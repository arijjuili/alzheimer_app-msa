package com.humancare.checkin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DailyCheckinServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DailyCheckinServiceApplication.class, args);
    }
}
