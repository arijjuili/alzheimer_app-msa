package com.humancare.routine.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.humancare.routine.config.RabbitMQConfig;
import com.humancare.routine.event.RoutineCompletedEvent;

@Service
public class EventPublisherService {

    private final RabbitTemplate rabbitTemplate;

    public EventPublisherService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishRoutineCompleted(RoutineCompletedEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EVENT_EXCHANGE, "event.routine.completed", event);
    }
}
