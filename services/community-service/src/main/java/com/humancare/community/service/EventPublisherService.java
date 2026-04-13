package com.humancare.community.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.humancare.community.config.RabbitMQConfig;
import com.humancare.community.event.NewPostCreatedEvent;

@Service
public class EventPublisherService {

    private final RabbitTemplate rabbitTemplate;

    public EventPublisherService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishNewPostCreated(NewPostCreatedEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EVENT_EXCHANGE, "event.community.post.created", event);
    }
}
