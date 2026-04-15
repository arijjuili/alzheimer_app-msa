package com.humancare.checkin.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI checkinOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Daily Check-in Service API")
                        .description("HumanCare Daily Check-in Microservice")
                        .version("0.1.0"));
    }
}
