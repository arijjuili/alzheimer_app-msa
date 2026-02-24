package com.humancare.notification.dto;

import com.humancare.notification.entity.NotificationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateNotificationRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must be less than 150 characters")
        String title,

        @NotBlank(message = "Message is required")
        @Size(max = 1000, message = "Message must be less than 1000 characters")
        String message,

        @NotNull(message = "Type is required")
        NotificationType type,

        @NotNull(message = "Read status is required")
        Boolean isRead
) {}
