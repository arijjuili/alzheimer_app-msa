package com.humancare.routine.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI routineOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Routine Service API")
                        .description("HumanCare Routines & Habits Microservice")
                        .version("0.1.0"));
    }
}
