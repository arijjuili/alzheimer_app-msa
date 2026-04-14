package com.roudayna.appointments.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentBookedEvent(
        UUID appointmentId,
        UUID patientId,
        String doctorName,
        LocalDateTime appointmentDate
) implements java.io.Serializable {}
