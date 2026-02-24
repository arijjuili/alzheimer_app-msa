package com.roudayna.appointments.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private String doctorName;

    @Column(nullable = false)
    private LocalDateTime appointmentDate;

    @Column
    private String reason;

    @Column
    private String status; // SCHEDULED, COMPLETED, CANCELLED

    @Column
    private String notes;
}
