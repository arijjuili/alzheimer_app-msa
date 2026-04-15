package com.roudayna.appointments.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI appointmentsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Appointments Service API")
                        .description("HumanCare Appointments Management Microservice")
                        .version("1.0.0"));
    }
}
