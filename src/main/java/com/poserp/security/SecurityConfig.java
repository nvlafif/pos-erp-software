package com.poserp.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthFilter,
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder,
            CustomAuthenticationEntryPoint authenticationEntryPoint,
            CustomAccessDeniedHandler accessDeniedHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Aktifkan konfigurasi CORS untuk integrasi Frontend & nonaktifkan CSRF (karena Stateless JWT)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            // 2. Daftarkan custom JSON handler untuk 401 Unauthorized & 403 Forbidden
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )

            // 3. Wajib STATELESS: server tidak menyimpan session di memori
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 4. Aturan Otorisasi RBAC (Owner, Gudang, Kasir)
            .authorizeHttpRequests(auth -> auth
                // Endpoint Publik (Login)
                .requestMatchers(
                    "/api/auth/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                // Laporan Penjualan -> Khusus Owner
                .requestMatchers(HttpMethod.GET, "/api/transactions/report/**").hasRole("OWNER")

                // Monitoring Stok Menipis & Kedaluwarsa -> Gudang dan Owner
                .requestMatchers(HttpMethod.GET, "/api/products/low-stock", "/api/products/expiring").hasAnyRole("GUDANG", "OWNER")

                // Melihat Daftar Produk, Kategori, & Satuan -> Semua peran aktif (Kasir butuh untuk layar transaksi)
                .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**", "/api/units/**").hasAnyRole("OWNER", "GUDANG", "KASIR")

                // Kelola Data Produk (Tambah, Ubah, Hapus) -> Gudang dan Owner
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("GUDANG", "OWNER")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("GUDANG", "OWNER")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAnyRole("GUDANG", "OWNER")

                // Transaksi Checkout & Riwayat Struk -> Kasir dan Owner
                .requestMatchers(HttpMethod.POST, "/api/transactions/checkout").hasAnyRole("KASIR", "OWNER")
                .requestMatchers(HttpMethod.GET, "/api/transactions/**").hasAnyRole("KASIR", "OWNER")

                // Master Data (Roles, Users, serta ubah/hapus Categories & Units) -> Khusus Owner
                .requestMatchers("/api/roles/**", "/api/users/**").hasRole("OWNER")
                .requestMatchers("/api/categories/**", "/api/units/**").hasRole("OWNER")

                // Seluruh endpoint lain wajib terautentikasi
                .anyRequest().authenticated()
            )

            // 5. Daftarkan mesin verifikasi Argon2id & filter JWT sebelum filter autentikasi standar
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Izinkan seluruh origin lokal saat pengembangan frontend (React/Vite/Tauri/Electron)
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;

        
    }

}