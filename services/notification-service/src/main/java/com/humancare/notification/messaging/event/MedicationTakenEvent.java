package com.humancare.notification.messaging.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record MedicationTakenEvent(
        UUID intakeId,
        UUID planId,
        UUID patientId,
        String medicationName,
        LocalDateTime takenAt
) {}
