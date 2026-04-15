package com.humancare.memory.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI memoryOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Memory Service API")
                        .description("HumanCare Cognitive Memory Microservice")
                        .version("0.1.0"));
    }
}
