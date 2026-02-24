package com.humancare.notification.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentDto(
        UUID id,
        UUID patientId,
        String doctorName,
        LocalDateTime appointmentDate,
        String reason,
        String status,
        String notes
) {}
