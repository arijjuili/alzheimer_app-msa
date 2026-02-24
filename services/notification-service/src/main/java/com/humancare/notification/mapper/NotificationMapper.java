package com.humancare.notification.mapper;

import org.springframework.stereotype.Component;

import com.humancare.notification.dto.CreateNotificationRequest;
import com.humancare.notification.dto.NotificationResponse;
import com.humancare.notification.dto.UpdateNotificationRequest;
import com.humancare.notification.entity.Notification;

@Component
public class NotificationMapper {

    public Notification toEntity(CreateNotificationRequest request) {
        Notification notification = new Notification();
        notification.setRecipientId(request.recipientId());
        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setType(request.type());
        notification.setIsRead(false);
        return notification;
    }

    public void applyUpdate(Notification notification, UpdateNotificationRequest request) {
        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setType(request.type());
        notification.setIsRead(request.isRead());
    }

    public NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipientId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getIsRead(),
                notification.getCreatedAt(),
                notification.getUpdatedAt()
        );
    }
}
