package com.roudayna.appointments.controller;

import com.roudayna.appointments.model.Appointment;
import com.roudayna.appointments.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    // Health check - useful for connection testing between microservices
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "service", "appointments-service",
            "status", "UP",
            "owner", "Roudayna",
            "port", "8085"
        ));
    }

    // GET all appointments
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // GET appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable UUID id) {
        return appointmentService.getAppointmentById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Appointment not found with id: " + id)));
    }

    // GET appointments by patient ID
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getByPatientId(@PathVariable UUID patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatientId(patientId));
    }

    // GET appointments by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Appointment>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByStatus(status.toUpperCase()));
    }

    // GET upcoming appointments (next 7 days, status=SCHEDULED)
    @GetMapping("/upcoming")
    public ResponseEntity<List<Appointment>> getUpcomingAppointments() {
        return ResponseEntity.ok(appointmentService.getUpcomingAppointments());
    }

    // POST - create appointment
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        Appointment created = appointmentService.createAppointment(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT - update appointment
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable UUID id, @RequestBody Appointment appointment) {
        return appointmentService.updateAppointment(id, appointment)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Appointment not found with id: " + id)));
    }

    // DELETE appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAppointment(@PathVariable UUID id) {
        if (appointmentService.deleteAppointment(id)) {
            return ResponseEntity.ok(Map.of("message", "Appointment deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "Appointment not found with id: " + id));
    }
}
