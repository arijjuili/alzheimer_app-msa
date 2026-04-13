package com.humancare.notification.messaging.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record RoutineCompletedEvent(
        UUID routineId,
        UUID patientId,
        String title,
        LocalDateTime completedAt
) {}
