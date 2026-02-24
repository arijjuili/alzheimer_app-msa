package com.humancare.checkin.exception;

import java.time.Instant;
import java.util.List;

public class ErrorResponse {
    private String error;
    private String message;
    private List<String> details;
    private Instant timestamp;
    private String path;

    public ErrorResponse() {
    }

    public ErrorResponse(String error, String message, List<String> details, Instant timestamp, String path) {
        this.error = error;
        this.message = message;
        this.details = details;
        this.timestamp = timestamp;
        this.path = path;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getDetails() {
        return details;
    }

    public void setDetails(List<String> details) {
        this.details = details;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
