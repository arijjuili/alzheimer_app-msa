package com.humancare.routine.dto;

import java.time.LocalTime;

import com.humancare.routine.entity.RoutineFrequency;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateRoutineRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must be less than 150 characters")
        String title,

        @Size(max = 1000, message = "Description must be less than 1000 characters")
        String description,

        @NotNull(message = "Frequency is required")
        RoutineFrequency frequency,

        LocalTime timeOfDay,

        @NotNull(message = "Active status is required")
        Boolean isActive
) {}
