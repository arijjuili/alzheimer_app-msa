package com.roudayna.appointments.repository;

import com.roudayna.appointments.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientId(UUID patientId);
    List<Appointment> findByStatus(String status);
    List<Appointment> findByAppointmentDateBetweenAndStatus(LocalDateTime start, LocalDateTime end, String status);
}
