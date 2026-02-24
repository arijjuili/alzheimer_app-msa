package com.humancare.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Spring Cloud Gateway Application for AlzCare Platform.
 * 
 * Responsibilities:
 * - Route requests to microservices
 * - JWT token validation
 * - Rate limiting (future)
 * - CORS handling
 */
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

}
