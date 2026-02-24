package com.humancare.notification.client;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.humancare.notification.dto.PatientDto;

@FeignClient(name = "patient-service")
public interface PatientClient {

    /**
     * Get patient details by their internal patient DB ID.
     * Used to convert patient DB ID to Keycloak ID for notifications.
     */
    @GetMapping("/api/v1/patients/{patientId}")
    PatientDto getPatientById(@PathVariable UUID patientId);
}
