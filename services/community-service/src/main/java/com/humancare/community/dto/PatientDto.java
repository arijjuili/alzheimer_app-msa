package com.humancare.community.dto;

import java.util.UUID;

public record PatientDto(
        UUID id,
        String keycloakId,
        String firstName,
        String lastName,
        String email
) {}
