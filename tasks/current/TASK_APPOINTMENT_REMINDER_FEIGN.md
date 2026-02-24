# Task: OpenFeign Communication - Appointment Reminder Cron Job

## 📋 Objective
Implement functional inter-service communication using **OpenFeign** between:
- **Client:** `notification-service` (port 8088)
- **Provider:** `appointments-service` (port 8085)

## 🎯 Use Case
A scheduled cron job runs every 5 minutes in the notification-service to:
1. Fetch upcoming appointments (next 7 days) from appointments-service via Feign
2. Create REMINDER notifications for each appointment

## 🏗️ Architecture

```
┌─────────────────────────────┐     OpenFeign      ┌─────────────────────────────┐
│   Notification Service      │ ───────────────────▶ │   Appointments Service      │
│   (Port 8088)               │  GET /api/appointments│   (Port 8085)               │
│                             │      /upcoming      │                             │
│  ┌─────────────────────┐    │                     │  ┌─────────────────────┐    │
│  │ @Scheduled          │    │                     │  │ GET /upcoming       │    │
│  │ (every 5 min)       │────┘                     │  │ Query: windowDays   │    │
│  └─────────────────────┘                          │  └─────────────────────┘    │
│           │                                       │           │                 │
│           ▼                                       │           ▼                 │
│  ┌─────────────────────┐                          │  ┌─────────────────────┐    │
│  │ AppointmentClient   │                          │  │ AppointmentRepository│   │
│  │ (Feign Interface)   │                          │  │ findByDateRange     │    │
│  └─────────────────────┘                          │  └─────────────────────┘    │
│           │                                       │           │                 │
│           ▼                                       │           ▼                 │
│  ┌─────────────────────┐                          │  ┌─────────────────────┐    │
│  │ NotificationService │                          │  │ MySQL Database      │    │
│  │ createNotification()│                          │  │ appointments_db     │    │
│  └─────────────────────┘                          │  └─────────────────────┘    │
└─────────────────────────────┘                     └─────────────────────────────┘
```

## ✅ Implementation Steps

### 1. Appointments Service (Provider)

**File:** `services/appointments-service/src/main/java/com/humancare/appointments/controller/AppointmentController.java`

Add new endpoint:
```java
@GetMapping("/upcoming")
public ResponseEntity<List<AppointmentResponse>> getUpcomingAppointments(
    @RequestParam(defaultValue = "7") int windowDays
) {
    // Fetch appointments where:
    // - appointmentDate >= now
    // - appointmentDate <= now + windowDays
    // - status = SCHEDULED (optional filter)
}
```

**File:** `services/appointments-service/src/main/java/com/humancare/appointments/repository/AppointmentRepository.java`

Add query method:
```java
@Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :start AND :end")
List<Appointment> findUpcomingAppointments(
    @Param("start") LocalDateTime start,
    @Param("end") LocalDateTime end
);
```

---

### 2. Notification Service (Client)

**File:** `services/notification-service/pom.xml`

Add dependency:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

**File:** `services/notification-service/src/main/java/com/humancare/notification/NotificationServiceApplication.java`

Enable Feign:
```java
@SpringBootApplication
@EnableFeignClients
public class NotificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}
```

**File:** `services/notification-service/src/main/java/com/humancare/notification/client/AppointmentClient.java`

Create Feign client:
```java
@FeignClient(name = "appointments-service")
public interface AppointmentClient {
    
    @GetMapping("/api/appointments/upcoming")
    List<AppointmentDto> getUpcomingAppointments(@RequestParam("windowDays") int windowDays);
}
```

**File:** `services/notification-service/src/main/java/com/humancare/notification/dto/AppointmentDto.java`

Create DTO:
```java
public record AppointmentDto(
    UUID id,
    String patientId,      // UUID as String
    String doctorName,
    LocalDateTime appointmentDate,
    String reason,
    String status
) {}
```

**File:** `services/notification-service/src/main/java/com/humancare/notification/scheduler/AppointmentReminderScheduler.java`

Create scheduler:
```java
@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {
    
    private final AppointmentClient appointmentClient;
    private final NotificationService notificationService;
    
    @Scheduled(fixedRate = 5, timeUnit = TimeUnit.MINUTES)
    public void sendAppointmentReminders() {
        log.info("Running appointment reminder cron job...");
        
        // Fetch appointments in next 7 days
        List<AppointmentDto> upcomingAppointments = appointmentClient
            .getUpcomingAppointments(7);
        
        log.info("Found {} upcoming appointments", upcomingAppointments.size());
        
        // Create notifications
        upcomingAppointments.forEach(appointment -> {
            CreateNotificationRequest request = new CreateNotificationRequest(
                UUID.fromString(appointment.patientId()),
                "Appointment Reminder",
                String.format("Dear Patient, you have an appointment with Dr. %s on %s. Reason: %s",
                    appointment.doctorName(),
                    appointment.appointmentDate().toString(),
                    appointment.reason() != null ? appointment.reason() : "N/A"
                ),
                NotificationType.REMINDER
            );
            
            notificationService.createNotification(request);
            log.info("Created reminder notification for appointment {}", appointment.id());
        });
    }
}
```

---

## 🧪 Testing Plan

### Step 1: Start Infrastructure
```bash
docker-compose up -d hc-mysql-appointments hc-mysql-notification hc-eureka-server hc-config-server
```

### Step 2: Start Services
```bash
# Terminal 1 - Appointments Service
cd services/appointments-service
mvn spring-boot:run

# Terminal 2 - Notification Service
cd services/notification-service
mvn spring-boot:run
```

### Step 3: Create Test Appointment
```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:8090/realms/humancare/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=humancare-webapp&username=patient1&password=password" \
  | jq -r '.access_token')

# Create appointment scheduled for tomorrow
curl -X POST http://localhost:8085/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "doctorName": "Dr. Smith",
    "appointmentDate": "2026-02-24T10:00:00",
    "reason": "Annual checkup",
    "status": "SCHEDULED"
  }'
```

### Step 4: Verify Cron Job
1. Wait up to 5 minutes for the scheduler to run
2. Check notification-service logs for: "Found X upcoming appointments"
3. Query notifications:
```bash
curl http://localhost:8088/api/v1/notifications/recipient/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer $TOKEN"
```

### Step 5: Verify Feign Communication
Check logs for successful HTTP calls between services.

---

## 📁 Files to Modify/Create

### Appointments Service
| File | Action |
|------|--------|
| `AppointmentController.java` | Add `/upcoming` endpoint |
| `AppointmentRepository.java` | Add `findUpcomingAppointments()` query |
| `AppointmentService.java` | Add business logic for upcoming appointments |

### Notification Service
| File | Action |
|------|--------|
| `pom.xml` | Add `spring-cloud-starter-openfeign` dependency |
| `NotificationServiceApplication.java` | Add `@EnableFeignClients` |
| `client/AppointmentClient.java` | **CREATE** - Feign client interface |
| `dto/AppointmentDto.java` | **CREATE** - Data transfer object |
| `scheduler/AppointmentReminderScheduler.java` | **CREATE** - Cron job |

---

## ⚠️ Important Notes

1. **UUID/String Reference:** The appointments service uses `patientId` as Long according to README, but the project migrated to UUID/String. Verify the actual type in the database/entity before implementing.

2. **Eureka Discovery:** Ensure appointments-service registers with Eureka as `appointments-service` so Feign can discover it via `lb://appointments-service`.

3. **Time Zone:** Both services should use the same timezone (UTC recommended) for date comparisons.

4. **Duplicate Notifications:** For simplicity, this implementation creates notifications every 5 minutes. In production, you'd track which appointments already have reminders sent.

5. **Error Handling:** Add `@FeignClient` fallback or error handling for when appointments-service is unavailable.

---

## 🎓 Learning Outcomes

After completing this task, you will have demonstrated:
- ✅ OpenFeign declarative HTTP client
- ✅ Inter-service communication via Eureka service discovery
- ✅ Spring Boot @Scheduled cron jobs
- ✅ Microservice data synchronization patterns

---

## Status
**Status:** `in_progress`  
**Created:** 2026-02-23  
**Assigned:** To be completed
