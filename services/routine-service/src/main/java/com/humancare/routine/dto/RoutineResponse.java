package com.humancare.routine.dto;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

import com.humancare.routine.entity.RoutineFrequency;

public record RoutineResponse(
        UUID id,
        UUID patientId,
        String title,
        String description,
        RoutineFrequency frequency,
        LocalTime timeOfDay,
        Boolean isActive,
        Boolean completed,
        java.time.LocalDate lastCompletedDate,
        Integer streak,
        Instant createdAt,
        Instant updatedAt
) {}
