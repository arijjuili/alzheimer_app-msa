package com.humancare.checkin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**", "/h2-console/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
        
        // For H2 console (disable frame options)
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));
        
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> roles = extractRoles(jwt.getClaims());
            return roles.stream()
                .map(role -> "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        });
        converter.setPrincipalClaimName("preferred_username");
        return converter;
    }

    @SuppressWarnings("unchecked")
    private List<String> extractRoles(Map<String, Object> claims) {
        // Try to get from "roles" claim directly
        List<String> roles = (List<String>) claims.get("roles");
        
        if (roles == null || roles.isEmpty()) {
            // Try to get from realm_access.roles
            Map<String, Object> realmAccess = (Map<String, Object>) claims.get("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                roles = (List<String>) realmAccess.get("roles");
            }
        }
        
        if (roles == null) {
            return List.of();
        }
        
        return roles;
    }
}
