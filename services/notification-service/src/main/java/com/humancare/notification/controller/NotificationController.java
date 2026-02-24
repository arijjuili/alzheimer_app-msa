package com.humancare.notification.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.humancare.notification.dto.CreateNotificationRequest;
import com.humancare.notification.dto.NotificationResponse;
import com.humancare.notification.dto.UpdateNotificationRequest;
import com.humancare.notification.service.NotificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notifications")
@Validated
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable));
    }

    @GetMapping("/my")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Principal principal) {
        UUID userId = extractUserId(principal);
        return ResponseEntity.ok(service.findAllByRecipient(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        UUID userId = extractUserId(principal);
        long count = service.countUnreadByRecipient(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/my/unread")
    public ResponseEntity<List<NotificationResponse>> getMyUnreadNotifications(Principal principal) {
        UUID userId = extractUserId(principal);
        return ResponseEntity.ok(service.findUnreadByRecipient(userId));
    }

    @GetMapping("/recipient/{recipientId}")
    public ResponseEntity<Page<NotificationResponse>> getByRecipient(
            @PathVariable UUID recipientId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.findByRecipient(recipientId, pageable));
    }

    @GetMapping("/recipient/{recipientId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadByRecipient(@PathVariable UUID recipientId) {
        return ResponseEntity.ok(service.findUnreadByRecipient(recipientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<NotificationResponse> create(
            @Valid @RequestBody CreateNotificationRequest request) {
        NotificationResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateNotificationRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable UUID id) {
        return ResponseEntity.ok(service.markAsRead(id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Principal principal) {
        UUID userId = extractUserId(principal);
        service.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== TESTING ENDPOINTS ====================

    private com.humancare.notification.scheduler.AppointmentScheduler appointmentScheduler;

    @Autowired
    public void setAppointmentScheduler(com.humancare.notification.scheduler.AppointmentScheduler scheduler) {
        this.appointmentScheduler = scheduler;
    }

    /**
     * MANUAL TEST: Trigger appointment reminder scheduler
     * This endpoint manually runs the scheduler to create reminder notifications
     * Use this for testing - checks appointments in next 7 days and creates notifications
     */
    @PostMapping("/test/trigger-appointment-reminders")
    public ResponseEntity<Map<String, String>> triggerAppointmentReminders() {
        try {
            appointmentScheduler.checkUpcomingAppointments();
            return ResponseEntity.ok(Map.of("message", "Appointment reminder scheduler triggered successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to trigger scheduler: " + e.getMessage()));
        }
    }

    /**
     * Extracts user ID from the authenticated Principal.
     * Extracts the 'sub' claim from the JWT token which contains the user UUID.
     */
    private UUID extractUserId(Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("User not authenticated");
        }
        
        // If it's a JWT authentication, extract the subject claim
        if (principal instanceof org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken jwtAuth) {
            String subject = jwtAuth.getToken().getClaimAsString("sub");
            if (subject != null) {
                return UUID.fromString(subject);
            }
        }
        
        // Fallback to principal name (should be the UUID in sub claim)
        return UUID.fromString(principal.getName());
    }
}
