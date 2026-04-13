package medication.medication.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import medication.medication.config.RabbitMQConfig;
import medication.medication.event.MedicationMissedEvent;
import medication.medication.event.MedicationTakenEvent;

@Service
public class EventPublisherService {

    private final RabbitTemplate rabbitTemplate;

    public EventPublisherService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishMedicationTaken(MedicationTakenEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EVENT_EXCHANGE, "event.medication.taken", event);
    }

    public void publishMedicationMissed(MedicationMissedEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EVENT_EXCHANGE, "event.medication.missed", event);
    }
}
