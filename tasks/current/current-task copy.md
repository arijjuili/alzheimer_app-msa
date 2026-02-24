# Current Task

**Task:** OpenFeign Communication - Appointment Reminder Cron Job  
**Status:** `in_progress`  
**Started:** 2026-02-23

## Summary
Implement functional inter-service communication using OpenFeign between notification-service (client) and appointments-service (provider).

## Key Points
- Cron job runs every 5 minutes in notification-service
- Fetches upcoming appointments (next 7 days) via Feign client
- Creates REMINDER notifications for patients
- Both services are Java/Spring Boot with Eureka integration

## Details
See full specification: [TASK_APPOINTMENT_REMINDER_FEIGN.md](./TASK_APPOINTMENT_REMINDER_FEIGN.md)

## Progress
- [x] Task defined and documented
- [ ] Appointments Service - Add /upcoming endpoint
- [ ] Notification Service - Add Feign dependency
- [ ] Notification Service - Create AppointmentClient
- [ ] Notification Service - Create scheduler
- [ ] Testing

## Notes
- UUID/String type for patientId needs verification in actual entity code
- Both services register with Eureka (lb:// routing)
- Simple implementation without duplicate prevention for now
