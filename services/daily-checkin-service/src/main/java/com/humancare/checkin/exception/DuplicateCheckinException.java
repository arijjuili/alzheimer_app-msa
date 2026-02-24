package com.humancare.checkin.exception;

import java.time.LocalDate;
import java.util.UUID;

public class DuplicateCheckinException extends RuntimeException {
    public DuplicateCheckinException(UUID patientId, LocalDate date) {
        super("Patient " + patientId + " already has a check-in for date: " + date);
    }

    public DuplicateCheckinException(String message) {
        super(message);
    }
}
