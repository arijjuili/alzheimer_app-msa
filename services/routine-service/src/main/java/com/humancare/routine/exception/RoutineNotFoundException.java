package com.humancare.routine.exception;

import java.util.UUID;

public class RoutineNotFoundException extends RuntimeException {
    public RoutineNotFoundException(UUID id) {
        super("Routine not found: " + id);
    }
}
