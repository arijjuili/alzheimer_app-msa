package com.roudayna.appointments.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.roudayna.appointments.config.RabbitMQConfig;
import com.roudayna.appointments.event.AppointmentBookedEvent;

@Service
public class EventPublisherService {

    private final RabbitTemplate rabbitTemplate;

    public EventPublisherService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishAppointmentBooked(AppointmentBookedEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EVENT_EXCHANGE, "event.appointment.booked", event);
    }
}
