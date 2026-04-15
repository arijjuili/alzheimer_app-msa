package medication.medication.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI medicationOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Medication Service API")
                        .description("HumanCare Medication Plans & Intakes Microservice")
                        .version("1.0.0"));
    }
}
