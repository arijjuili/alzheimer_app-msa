package com.humancare.notification.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.humancare.notification.entity.Notification;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, UUID> {
    Page<Notification> findByRecipientId(UUID recipientId, Pageable pageable);

    List<Notification> findByRecipientId(UUID recipientId);

    long countByRecipientIdAndIsReadFalse(UUID recipientId);

    List<Notification> findByRecipientIdAndIsReadFalse(UUID recipientId);
}
