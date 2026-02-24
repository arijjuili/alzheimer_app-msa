package com.humancare.notification.dto;

import java.time.Instant;
import java.util.UUID;

import com.humancare.notification.entity.NotificationType;

public record NotificationResponse(
        UUID id,
        UUID recipientId,
        String title,
        String message,
        NotificationType type,
        Boolean isRead,
        Instant createdAt,
        Instant updatedAt
) {}
