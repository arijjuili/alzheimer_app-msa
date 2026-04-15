package com.humancare.notification.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EVENT_EXCHANGE = "humancare.events";

    public static final String QUEUE_MEDICATION_TAKEN = "notifications.medication.taken";
    public static final String QUEUE_MEDICATION_MISSED = "notifications.medication.missed";
    public static final String QUEUE_APPOINTMENTS = "notifications.appointments";
    public static final String QUEUE_COMMUNITY = "notifications.community";
    public static final String QUEUE_ROUTINE = "notifications.routine";

    public static final String RK_MEDICATION_TAKEN = "event.medication.taken";
    public static final String RK_MEDICATION_MISSED = "event.medication.missed";
    public static final String RK_APPOINTMENT_BOOKED = "event.appointment.booked";
    public static final String RK_COMMUNITY_POST_CREATED = "event.community.post.created";
    public static final String RK_ROUTINE_COMPLETED = "event.routine.completed";

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(EVENT_EXCHANGE);
    }

    @Bean
    public Queue medicationTakenQueue() {
        return new Queue(QUEUE_MEDICATION_TAKEN, true);
    }

    @Bean
    public Queue medicationMissedQueue() {
        return new Queue(QUEUE_MEDICATION_MISSED, true);
    }

    @Bean
    public Queue appointmentsQueue() {
        return new Queue(QUEUE_APPOINTMENTS, true);
    }

    @Bean
    public Queue communityQueue() {
        return new Queue(QUEUE_COMMUNITY, true);
    }

    @Bean
    public Queue routineQueue() {
        return new Queue(QUEUE_ROUTINE, true);
    }

    @Bean
    public Binding bindingMedicationTaken(Queue medicationTakenQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(medicationTakenQueue).to(eventExchange).with(RK_MEDICATION_TAKEN);
    }

    @Bean
    public Binding bindingMedicationMissed(Queue medicationMissedQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(medicationMissedQueue).to(eventExchange).with(RK_MEDICATION_MISSED);
    }

    @Bean
    public Binding bindingAppointmentBooked(Queue appointmentsQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(appointmentsQueue).to(eventExchange).with(RK_APPOINTMENT_BOOKED);
    }

    @Bean
    public Binding bindingCommunityPostCreated(Queue communityQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(communityQueue).to(eventExchange).with(RK_COMMUNITY_POST_CREATED);
    }

    @Bean
    public Binding bindingRoutineCompleted(Queue routineQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(routineQueue).to(eventExchange).with(RK_ROUTINE_COMPLETED);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, Jackson2JsonMessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }
}
