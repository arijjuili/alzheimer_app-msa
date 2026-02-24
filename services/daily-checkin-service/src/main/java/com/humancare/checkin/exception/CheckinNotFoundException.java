package com.humancare.checkin.exception;

import java.util.UUID;

public class CheckinNotFoundException extends RuntimeException {
    public CheckinNotFoundException(UUID id) {
        super("Check-in not found: " + id);
    }

    public CheckinNotFoundException(String message) {
        super(message);
    }
}
