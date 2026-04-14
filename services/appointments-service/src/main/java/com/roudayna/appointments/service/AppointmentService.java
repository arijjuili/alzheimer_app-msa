package com.roudayna.appointments.service;

import com.roudayna.appointments.event.AppointmentBookedEvent;
import com.roudayna.appointments.model.Appointment;
import com.roudayna.appointments.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private EventPublisherService eventPublisher;

    // Get all appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Get appointment by ID
    public Optional<Appointment> getAppointmentById(UUID id) {
        return appointmentRepository.findById(id);
    }

    // Get appointments by patient ID
    public List<Appointment> getAppointmentsByPatientId(UUID patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    // Get appointments by status
    public List<Appointment> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(status);
    }

    // Get upcoming appointments (next 7 days, status=SCHEDULED)
    public List<Appointment> getUpcomingAppointments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysLater = now.plusDays(7);
        return appointmentRepository.findByAppointmentDateBetweenAndStatus(now, sevenDaysLater, "SCHEDULED");
    }

    // Create appointment
    public Appointment createAppointment(Appointment appointment) {
        if (appointment.getStatus() == null) {
            appointment.setStatus("SCHEDULED");
        }
        Appointment saved = appointmentRepository.save(appointment);

        eventPublisher.publishAppointmentBooked(new AppointmentBookedEvent(
                saved.getId(),
                saved.getPatientId(),
                saved.getDoctorName(),
                saved.getAppointmentDate()
        ));

        return saved;
    }

    // Update appointment
    public Optional<Appointment> updateAppointment(UUID id, Appointment updatedAppointment) {
        return appointmentRepository.findById(id).map(existing -> {
            if (updatedAppointment.getPatientId() != null) {
                existing.setPatientId(updatedAppointment.getPatientId());
            }
            if (updatedAppointment.getDoctorName() != null) {
                existing.setDoctorName(updatedAppointment.getDoctorName());
            }
            if (updatedAppointment.getAppointmentDate() != null) {
                existing.setAppointmentDate(updatedAppointment.getAppointmentDate());
            }
            if (updatedAppointment.getReason() != null) {
                existing.setReason(updatedAppointment.getReason());
            }
            if (updatedAppointment.getStatus() != null) {
                existing.setStatus(updatedAppointment.getStatus());
            }
            if (updatedAppointment.getNotes() != null) {
                existing.setNotes(updatedAppointment.getNotes());
            }
            return appointmentRepository.save(existing);
        });
    }

    // Delete appointment
    public boolean deleteAppointment(UUID id) {
        if (appointmentRepository.existsById(id)) {
            appointmentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
