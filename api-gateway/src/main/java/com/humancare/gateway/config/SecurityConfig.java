package com.humancare.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Security configuration for Spring Cloud Gateway.
 * 
 * Validates JWT tokens from Keycloak and extracts roles.
 * Public paths: /actuator/**, /realms/** (Keycloak endpoints via gateway)
 * Secured paths: All other routes require valid JWT
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwkSetUri;

    /**
     * Public paths that don't require authentication.
     */
    private static final String[] PUBLIC_PATHS = {
        "/actuator/**",
        "/actuator",
        "/realms/**",
        "/resources/**",
        "/health",
        "/",
        "/favicon.ico",
        "/auth/**",
        "/.well-known/**",
        "/swagger-ui.html",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/webjars/swagger-ui/**",
        "/appointments/v3/api-docs",
        "/medication/v3/api-docs",
        "/community/v3/api-docs",
        "/notification/v3/api-docs",
        "/routine/v3/api-docs",
        "/memory/v3/api-docs",
        "/checkin/v3/api-docs",
        "/patient/v3/api-docs"
    };

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers(PUBLIC_PATHS).permitAll()
                .pathMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .pathMatchers("/api/v1/schedules/**").hasRole("ADMIN")
                .pathMatchers("/api/v1/doctor/**").hasAnyRole("DOCTOR", "ADMIN")
                .pathMatchers("/api/v1/caregiver/**").hasAnyRole("CAREGIVER", "DOCTOR", "ADMIN")
                .pathMatchers("/api/v1/patient/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
                .pathMatchers("/api/behavior-logs/**").hasAnyRole("CAREGIVER", "DOCTOR", "ADMIN")
                .pathMatchers("/api/alerts/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
                .pathMatchers("/api/appointments/health").permitAll()
                .pathMatchers("/api/appointments/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
                .pathMatchers("/api/medications/health").permitAll()
                .pathMatchers("/api/medications/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
                .pathMatchers("/api/notifications/health").permitAll()
                .pathMatchers("/api/notifications/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
                .pathMatchers("/api/routines/health").permitAll()
                .pathMatchers("/api/routines/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
                .pathMatchers("/api/community/health").permitAll()
                .pathMatchers("/api/community/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
                .pathMatchers("/api/memories/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(reactiveJwtAuthenticationConverter()))
            )
            .build();
    }

    @Bean
    public ReactiveJwtAuthenticationConverter reactiveJwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(this::extractAuthorities);
        converter.setPrincipalClaimName(StandardClaimNames.PREFERRED_USERNAME);
        return converter;
    }

    private Flux<GrantedAuthority> extractAuthorities(Jwt jwt) {
        // Extract realm roles from the JWT
        List<String> roles = extractRoles(jwt);
        
        Collection<GrantedAuthority> authorities = roles.stream()
            .map(role -> "ROLE_" + role)
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());
        
        return Flux.fromIterable(authorities);
    }

    @SuppressWarnings("unchecked")
    private List<String> extractRoles(Jwt jwt) {
        // Try to get from "roles" claim directly
        List<String> roles = jwt.getClaimAsStringList("roles");
        
        if (roles == null || roles.isEmpty()) {
            // Try to get from realm_access.roles
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                roles = (List<String>) realmAccess.get("roles");
            }
        }
        
        if (roles == null) {
            return List.of();
        }
        
        return roles;
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        return NimbusReactiveJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "http://localhost:4200",
            "http://localhost:4201",
            "http://127.0.0.1:4200",
            "http://127.0.0.1:4201"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
