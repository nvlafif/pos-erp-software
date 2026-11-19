package com.poserp.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Parameter standar OWASP untuk Argon2id:
        // saltLength = 16 bytes, hashLength = 32 bytes, parallelism = 1, memory = 19456 KB (19 MB), iterations = 2
        return new Argon2PasswordEncoder(16, 32, 1, 19456, 2);
    }
}