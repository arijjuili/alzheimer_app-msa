package com.humancare.routine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class RoutineServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoutineServiceApplication.class, args);
    }
}
