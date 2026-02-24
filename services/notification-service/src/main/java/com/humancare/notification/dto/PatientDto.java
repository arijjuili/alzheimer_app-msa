package com.humancare.notification.dto;

import java.util.UUID;

/**
 * Patient DTO matching the patient service response.
 * Used to get Keycloak ID from patient DB ID.
 */
public record PatientDto(
        UUID id,
        String keycloakId,
        String firstName,
        String lastName,
        String email,
        String birthDate,
        String medicalHistory,
        String caregiverId,
        String doctorId,
        String createdAt,
        String updatedAt
) {}
