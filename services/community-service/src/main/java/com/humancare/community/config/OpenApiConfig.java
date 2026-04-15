package com.humancare.community.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI communityOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Community Service API")
                        .description("HumanCare Community Wall Microservice")
                        .version("0.1.0"));
    }
}
