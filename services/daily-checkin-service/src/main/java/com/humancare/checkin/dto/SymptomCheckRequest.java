package com.humancare.checkin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SymptomCheckRequest {

    @NotBlank(message = "Symptom type is required")
    private String symptomType;

    @NotNull(message = "Severity is required")
    @Min(value = 1, message = "Severity must be at least 1")
    @Max(value = 10, message = "Severity must be at most 10")
    private Integer severity;

    @NotNull(message = "Present status is required")
    private Boolean present;

    public SymptomCheckRequest() {
    }

    public String getSymptomType() {
        return symptomType;
    }

    public void setSymptomType(String symptomType) {
        this.symptomType = symptomType;
    }

    public Integer getSeverity() {
        return severity;
    }

    public void setSeverity(Integer severity) {
        this.severity = severity;
    }

    public Boolean getPresent() {
        return present;
    }

    public void setPresent(Boolean present) {
        this.present = present;
    }
}
