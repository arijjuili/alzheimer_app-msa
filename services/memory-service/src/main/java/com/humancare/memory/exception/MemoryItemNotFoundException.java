package com.humancare.memory.exception;

import java.util.UUID;

public class MemoryItemNotFoundException extends RuntimeException {

    public MemoryItemNotFoundException(UUID id) {
        super("Memory item not found: " + id);
    }
}
