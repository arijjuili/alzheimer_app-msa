package com.humancare.memory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MemoryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MemoryServiceApplication.class, args);
    }
}
