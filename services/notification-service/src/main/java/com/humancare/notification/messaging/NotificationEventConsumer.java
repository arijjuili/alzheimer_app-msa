package com.humancare.notification.messaging;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.humancare.notification.dto.CreateNotificationRequest;
import com.humancare.notification.entity.NotificationType;
import com.humancare.notification.messaging.event.AppointmentBookedEvent;
import com.humancare.notification.messaging.event.MedicationMissedEvent;
import com.humancare.notification.messaging.event.MedicationTakenEvent;
import com.humancare.notification.messaging.event.NewPostCreatedEvent;
import com.humancare.notification.messaging.event.RoutineCompletedEvent;
import com.humancare.notification.service.NotificationService;

@Component
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    public NotificationEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_MEDICATION_TAKEN)
    public void handleMedicationTaken(MedicationTakenEvent event) {
        CreateNotificationRequest request = new CreateNotificationRequest(
                event.patientId(),
                "Medication Taken",
                "You have taken your medication: " + event.medicationName(),
                NotificationType.INFO
        );
        notificationService.create(request);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_MEDICATION_MISSED)
    public void handleMedicationMissed(MedicationMissedEvent event) {
        CreateNotificationRequest request = new CreateNotificationRequest(
                event.patientId(),
                "Medication Missed",
                "You missed your scheduled medication: " + event.medicationName(),
                NotificationType.ALERT
        );
        notificationService.create(request);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_APPOINTMENTS)
    public void handleAppointmentBooked(AppointmentBookedEvent event) {
        CreateNotificationRequest request = new CreateNotificationRequest(
                event.patientId(),
                "Appointment Booked",
                "Appointment with Dr. " + event.doctorName() + " has been booked for " + event.appointmentDate(),
                NotificationType.INFO
        );
        notificationService.create(request);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_COMMUNITY)
    public void handleNewPostCreated(NewPostCreatedEvent event) {
        // Notify the author that their post was published
        CreateNotificationRequest request = new CreateNotificationRequest(
                event.authorId(),
                "Post Published",
                "Your post \"" + event.title() + "\" has been published in " + event.category(),
                NotificationType.INFO
        );
        notificationService.create(request);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_ROUTINE)
    public void handleRoutineCompleted(RoutineCompletedEvent event) {
        CreateNotificationRequest request = new CreateNotificationRequest(
                event.patientId(),
                "Routine Completed",
                "You completed your routine: " + event.title(),
                NotificationType.INFO
        );
        notificationService.create(request);
    }
}
