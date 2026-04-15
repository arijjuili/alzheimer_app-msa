Here is an **OpenFeign inter-service communication** found in the HumanCare platform:

---

## 🔗 Communication: `notification-service` → `appointments-service`

**Purpose:** Automatically create reminder notifications for patients with upcoming appointments.

### How It Works (Flow)

```
┌─────────────────────┐      OpenFeign       ┌─────────────────────┐
│ notification-service│  ──────────────────► │ appointments-service│
│   (Feign Client)    │  GET /api/appointments/upcoming             │
└─────────────────────┘                      └─────────────────────┘
         │
         ▼
   Creates REMINDER notifications in MongoDB
```

### 1. The Feign Client Interface

**File:** `services/notification-service/src/main/java/com/humancare/notification/client/AppointmentClient.java`

```java
@FeignClient(name = "appointments-service")
public interface AppointmentClient {
    @GetMapping("/api/appointments/upcoming")
    List<AppointmentDto> getUpcomingAppointments();
}
```

- `@FeignClient(name = "appointments-service")` tells Spring Cloud to use **Eureka service discovery** to resolve the target service (load-balanced via `lb://appointments-service`).
- The interface method mirrors the HTTP endpoint on the provider side.

### 2. The Provider Endpoint

**File:** `services/appointments-service/src/main/java/com/roudayna/appointments/controller/AppointmentController.java`

```java
@GetMapping("/upcoming")
public ResponseEntity<List<Appointment>> getUpcomingAppointments() {
    return ResponseEntity.ok(appointmentService.getUpcomingAppointments());
}
```

The service layer returns appointments scheduled within the **next 7 days** with status `SCHEDULED`.

### 3. The Consumer (Scheduler)

**File:** `services/notification-service/src/main/java/com/humancare/notification/scheduler/AppointmentScheduler.java`

```java
@Component
public class AppointmentScheduler {

    private final AppointmentClient appointmentClient;
    private final PatientClient patientClient;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 300000)  // Every 5 minutes
    public void checkUpcomingAppointments() {
        List<AppointmentDto> appointments = appointmentClient.getUpcomingAppointments();
        
        for (AppointmentDto appointment : appointments) {
            // Get patient details via another Feign call to patient-service
            PatientDto patient = patientClient.getPatientById(appointment.patientId());
            
            // Create a REMINDER notification
            CreateNotificationRequest request = new CreateNotificationRequest(
                UUID.fromString(patient.keycloakId()),
                "Upcoming Appointment",
                "You have an appointment with Dr. " + appointment.doctorName() + " on ...",
                NotificationType.REMINDER
            );
            notificationService.create(request);
        }
    }
}
```

### 4. Enabling Feign

**File:** `services/notification-service/src/main/java/com/humancare/notification/NotificationServiceApplication.java`

```java
@SpringBootApplication
@EnableFeignClients      // Enables component scanning for @FeignClient interfaces
@EnableScheduling        // Enables the @Scheduled cron job
public class NotificationServiceApplication { ... }
```

### 5. Maven Dependency

**File:** `services/notification-service/pom.xml`

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

---

## Summary

| Aspect | Detail |
|--------|--------|
| **Client** | `notification-service` |
| **Provider** | `appointments-service` |
| **Mechanism** | Spring Cloud OpenFeign |
| **Service Discovery** | Eureka (`lb://appointments-service`) |
| **Endpoint** | `GET /api/appointments/upcoming` |
| **Trigger** | Scheduled job every 5 minutes |
| **Result** | REMINDER notifications created for patients |

This is a clean example of **declarative HTTP clients** with OpenFeign — the consumer defines an interface, and Spring handles all the HTTP boilerplate, load balancing, and service discovery automatically.









Here is the **asynchronous inter-service communication** found in the HumanCare platform:

---

## 🔗 Communication: Event-Driven RabbitMQ Messaging

**Purpose:** Multiple services publish domain events, and `notification-service` asynchronously consumes them to create user notifications.

### Architecture Overview

```
         ┌─────────────────────┐
         │   Topic Exchange    │
         │  humancare.events   │
         └──────────┬──────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
appointments    medication      community
   service        service        service
  (publisher)   (publisher)    (publisher)
                    │
                    ▼
            notification-service
              (consumer with
               @RabbitListener)
```

### 1. The Producer: `appointments-service`

**File:** `services/appointments-service/src/main/java/com/roudayna/appointments/service/AppointmentService.java`

```java
@Service
public class AppointmentService {
    private final EventPublisherService eventPublisher;

    public Appointment createAppointment(Appointment appointment) {
        Appointment saved = appointmentRepository.save(appointment);

        // Publish async event after saving
        eventPublisher.publishAppointmentBooked(new AppointmentBookedEvent(
                saved.getId(),
                saved.getPatientId(),
                saved.getDoctorName(),
                saved.getAppointmentDate()
        ));

        return saved;
    }
}
```

**File:** `services/appointments-service/src/main/java/com/roudayna/appointments/service/EventPublisherService.java`

```java
@Service
public class EventPublisherService {
    private final RabbitTemplate rabbitTemplate;

    public void publishAppointmentBooked(AppointmentBookedEvent event) {
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EVENT_EXCHANGE,
            "event.appointment.booked",
            event
        );
    }
}
```

### 2. The Event Payload

**File:** `services/appointments-service/src/main/java/com/roudayna/appointments/event/AppointmentBookedEvent.java`

```java
public record AppointmentBookedEvent(
        UUID appointmentId,
        UUID patientId,
        String doctorName,
        LocalDateTime appointmentDate
) {}
```

### 3. The Consumer: `notification-service`

**File:** `services/notification-service/src/main/java/com/humancare/notification/messaging/RabbitMQConfig.java`

```java
@Configuration
public class RabbitMQConfig {
    public static final String EVENT_EXCHANGE = "humancare.events";
    public static final String QUEUE_APPOINTMENTS = "notifications.appointments";
    public static final String RK_APPOINTMENT_BOOKED = "event.appointment.booked";

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(EVENT_EXCHANGE);
    }

    @Bean
    public Queue appointmentsQueue() {
        return new Queue(QUEUE_APPOINTMENTS, true); // durable queue
    }

    @Bean
    public Binding bindingAppointmentBooked(Queue appointmentsQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(appointmentsQueue).to(eventExchange).with(RK_APPOINTMENT_BOOKED);
    }

    // ...similar queues/bindings for medication, community, routine
}
```

**File:** `services/notification-service/src/main/java/com/humancare/notification/messaging/NotificationEventConsumer.java`

```java
@Component
public class NotificationEventConsumer {

    private final NotificationService notificationService;

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

    @RabbitListener(queues = RabbitMQConfig.QUEUE_MEDICATION_TAKEN)
    public void handleMedicationTaken(MedicationTakenEvent event) { ... }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_MEDICATION_MISSED)
    public void handleMedicationMissed(MedicationMissedEvent event) { ... }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_COMMUNITY)
    public void handleNewPostCreated(NewPostCreatedEvent event) { ... }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_ROUTINE)
    public void handleRoutineCompleted(RoutineCompletedEvent event) { ... }
}
```

### 4. Enabling RabbitMQ

**File:** `services/notification-service/src/main/java/com/humancare/notification/NotificationServiceApplication.java`

```java
@SpringBootApplication
@EnableRabbit      // Enables @RabbitListener processing
@EnableFeignClients
@EnableScheduling
public class NotificationServiceApplication { ... }
```

---

## Summary

| Aspect | Detail |
|--------|--------|
| **Broker** | RabbitMQ |
| **Exchange Type** | Topic Exchange (`humancare.events`) |
| **Pattern** | Publish/Subscribe (multiple publishers, single consumer) |
| **Producers** | `appointments-service`, `medication-service`, `community-service`, `routine-service` |
| **Consumer** | `notification-service` |
| **Spring Abstraction** | `RabbitTemplate` (publish) + `@RabbitListener` (consume) |
| **Result** | Asynchronous notification creation without blocking the caller |

This is a classic **event-driven architecture**: when a user books an appointment, the appointments service saves it and immediately publishes an event. The notification service picks it up asynchronously and creates a notification — the two services are decoupled and don't need to know about each other's APIs or availability.



Here is a breakdown of the **asynchronous event-driven workflow** in HumanCare — how it works, the principles behind it, and why the team chose this design.

---

## 🔄 The Workflow Step-by-Step

Let’s trace what happens when a patient **books an appointment**:

### 1. User Action Triggers a Change
A frontend request hits the `appointments-service`:
```http
POST /api/appointments
```
The service validates the data, saves the appointment to PostgreSQL, and gets a `saved` entity back.

### 2. The Producer Fires-and-Forgets
Inside `AppointmentService.createAppointment()`:
```java
eventPublisher.publishAppointmentBooked(
    new AppointmentBookedEvent(saved.getId(), saved.getPatientId(), ...)
);
```
- This uses `RabbitTemplate.convertAndSend()` to drop a message onto the `humancare.events` topic exchange.
- The routing key is `event.appointment.booked`.
- **It does NOT wait for a response.** The appointment booking returns `200 OK` to the user immediately.

### 3. RabbitMQ Routes the Message
The `TopicExchange` (`humancare.events`) looks at the routing key and delivers the message to any queue that has a matching binding.

In this case, the binding is:
```java
Queue: "notifications.appointments"
Binding Key: "event.appointment.booked"
```
So the message lands in the `notifications.appointments` queue.

### 4. The Consumer Picks It Up Asynchronously
`notification-service` has a `@RabbitListener` attached to that queue:
```java
@RabbitListener(queues = RabbitMQConfig.QUEUE_APPOINTMENTS)
public void handleAppointmentBooked(AppointmentBookedEvent event) {
    notificationService.create(request);
}
```
- This runs **independently** of the appointments service.
- It creates a notification document in MongoDB.
- If `notification-service` is temporarily down, the message sits safely in the durable queue until the service comes back online.

---

## 🏛️ The Principle: Event-Driven Architecture (EDA)

This pattern is called **Event-Driven Architecture** with a **Publish/Subscribe** model.

### Core Concepts

| Concept | What it means in this project |
|---------|------------------------------|
| **Event** | A fact that something happened (e.g., "Appointment was booked") |
| **Publisher** | The service where the event originated (`appointments-service`) |
| **Subscriber/Consumer** | The service interested in reacting to the event (`notification-service`) |
| **Message Broker** | RabbitMQ — the middleman that decouples producer from consumer |
| **Topic Exchange** | Routes events based on routing keys, enabling 1-to-many fan-out |

### The "How"
1. **Decoupling via a broker:** Services never call each other directly. They speak to RabbitMQ.
2. **Topic-based routing:** One exchange handles multiple event types (`appointment.booked`, `medication.taken`, `routine.completed`) and routes them to the correct queues.
3. **Durable queues:** Messages survive consumer restarts (`new Queue(..., true)`).

### The "Why"

| Problem with synchronous (REST/Feign) | How async (RabbitMQ) solves it |
|----------------------------------------|-------------------------------|
| If `notification-service` is down, `appointments-service` would fail or hang | The broker buffers the message; `appointments-service` never knows or cares |
| Tight coupling — every service needs to know the other's API/location | Services only need to agree on the **event schema**, not network addresses |
| Cascading failures — one slow downstream service slows everyone up | Publishers return instantly; consumers process at their own pace |
| Hard to add new reactions later | Just bind a new queue to the same routing key (e.g., `analytics-service` could also listen to `event.appointment.booked` without touching the publisher) |

---

## 🎯 Why HumanCare Specifically Uses This

### 1. Notifications Are a Side Effect
Booking an appointment is the **core business operation**. Creating a notification is a **secondary concern**.  
With async messaging, the primary operation is never blocked or endangered by a secondary one.

### 2. One Consumer, Many Producers
`notification-service` is a central hub. It needs to react to:
- Appointments (`appointments-service`)
- Medication taken/missed (`medication-service`)
- Community posts (`community-service`)
- Routines completed (`routine-service`)

Instead of `notification-service` exposing 4 different REST endpoints and forcing every producer to know its URL, each producer simply emits an event to the shared exchange. `notification-service` listens to the relevant queues.

### 3. Scalability & Resilience
- If there is a burst of appointments, RabbitMQ queues them up. The consumer processes them as fast as it can.
- If `notification-service` crashes and restarts, no notifications are lost because the queues are **durable**.

---

## ⚖️ Trade-offs

| ✅ Pros | ❌ Cons |
|---------|---------|
| Loose coupling | Eventual consistency (notifications may appear with a slight delay) |
| Better fault tolerance | Harder to debug (messages are invisible in flight) |
| Easier to scale consumers independently | Need to handle duplicate or out-of-order messages |
| Publishers are fast and responsive | Requires operational overhead (monitoring RabbitMQ queues) |

---

## 🧠 One-Sentence Summary

> **The `appointments-service` announces that something happened, and `notification-service` reacts to it later — they are decoupled by RabbitMQ, making the platform more resilient, scalable, and easier to extend.**