package com.humancare.routine.event;

import java.util.UUID;

public record RoutineCompletedEvent(
        UUID routineId,
        UUID patientId,
        String title,
        java.time.LocalDateTime completedAt
) implements java.io.Serializable {}
