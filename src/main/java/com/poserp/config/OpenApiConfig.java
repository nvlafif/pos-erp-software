package com.poserp.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI posErpOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("POS & ERP System REST API")
                        .description("Dokumentasi API standar OpenAPI 3.0 untuk Sistem Point of Sale (POS) & ERP dengan autentikasi stateless JWT dan otorisasi RBAC (Owner, Gudang, Kasir).")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("POS/ERP Engineering")
                                .email("owner@poserp.com")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Tempelkan token JWT hasil login (tanpa awalan kata 'Bearer').")));
    }
}