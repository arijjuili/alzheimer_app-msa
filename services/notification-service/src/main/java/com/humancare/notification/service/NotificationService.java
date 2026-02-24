package com.humancare.notification.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.humancare.notification.dto.CreateNotificationRequest;
import com.humancare.notification.dto.NotificationResponse;
import com.humancare.notification.dto.UpdateNotificationRequest;
import com.humancare.notification.entity.Notification;
import com.humancare.notification.exception.NotificationNotFoundException;
import com.humancare.notification.mapper.NotificationMapper;
import com.humancare.notification.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final NotificationMapper mapper;

    public NotificationService(NotificationRepository repository, NotificationMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> findByRecipient(UUID recipientId, Pageable pageable) {
        return repository.findByRecipientId(recipientId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findAllByRecipient(UUID recipientId) {
        return repository.findByRecipientId(recipientId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countUnreadByRecipient(UUID recipientId) {
        return repository.countByRecipientIdAndIsReadFalse(recipientId);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findUnreadByRecipient(UUID recipientId) {
        return repository.findByRecipientIdAndIsReadFalse(recipientId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NotificationResponse findById(UUID id) {
        return mapper.toResponse(getOrThrow(id));
    }

    @Transactional
    public NotificationResponse create(CreateNotificationRequest request) {
        Notification notification = mapper.toEntity(request);
        Notification saved = repository.save(notification);
        return mapper.toResponse(saved);
    }

    @Transactional
    public NotificationResponse update(UUID id, UpdateNotificationRequest request) {
        Notification notification = getOrThrow(id);
        mapper.applyUpdate(notification, request);
        return mapper.toResponse(notification);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID id) {
        Notification notification = getOrThrow(id);
        notification.setIsRead(true);
        return mapper.toResponse(notification);
    }

    @Transactional
    public void markAllAsRead(UUID recipientId) {
        repository.markAllAsReadByRecipientId(recipientId);
    }

    @Transactional
    public void delete(UUID id) {
        Notification notification = getOrThrow(id);
        repository.delete(notification);
    }

    private Notification getOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));
    }
}
