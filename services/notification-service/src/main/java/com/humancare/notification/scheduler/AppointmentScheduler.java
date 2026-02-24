package com.humancare.notification.scheduler;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.humancare.notification.client.AppointmentClient;
import com.humancare.notification.client.PatientClient;
import com.humancare.notification.dto.AppointmentDto;
import com.humancare.notification.dto.CreateNotificationRequest;
import com.humancare.notification.dto.PatientDto;
import com.humancare.notification.entity.NotificationType;
import com.humancare.notification.service.NotificationService;

@Component
public class AppointmentScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentScheduler.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM d, yyyy 'at' h:mm a");

    private final AppointmentClient appointmentClient;
    private final NotificationService notificationService;
    private final PatientClient patientClient;

    public AppointmentScheduler(AppointmentClient appointmentClient, NotificationService notificationService, PatientClient patientClient) {
        this.appointmentClient = appointmentClient;
        this.notificationService = notificationService;
        this.patientClient = patientClient;
    }

    @Scheduled(fixedRate = 300000)
    public void checkUpcomingAppointments() {
        logger.info("Checking for upcoming appointments...");
        
        try {
            List<AppointmentDto> appointments = appointmentClient.getUpcomingAppointments();
            logger.info("Found {} upcoming appointments", appointments.size());
            
            for (AppointmentDto appointment : appointments) {
                createReminderNotification(appointment);
            }
        } catch (Exception e) {
            logger.error("Error checking upcoming appointments: {}", e.getMessage(), e);
        }
    }

    private void createReminderNotification(AppointmentDto appointment) {
        String formattedDate = appointment.appointmentDate().format(DATE_FORMATTER);
        String message = String.format("You have an appointment with Dr. %s on %s", 
                appointment.doctorName(), formattedDate);
        
        try {
            // Get patient details to convert patient DB ID to Keycloak ID
            PatientDto patient = patientClient.getPatientById(appointment.patientId());
            
            if (patient == null || patient.keycloakId() == null) {
                logger.error("Patient not found or has no keycloakId for patientId: {}", appointment.patientId());
                return;
            }
            
            UUID keycloakId = UUID.fromString(patient.keycloakId());
            
            CreateNotificationRequest request = new CreateNotificationRequest(
                    keycloakId,
                    "Upcoming Appointment",
                    message,
                    NotificationType.REMINDER
            );
            
            notificationService.create(request);
            logger.info("Created reminder notification for appointment ID: {} with Keycloak ID: {}", 
                    appointment.id(), keycloakId);
        } catch (Exception e) {
            logger.error("Failed to create notification for appointment {}: {}", appointment.id(), e.getMessage());
        }
    }
}
