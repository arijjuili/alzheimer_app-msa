package com.humancare.checkin.dto;

import com.humancare.checkin.entity.MoodType;
import com.humancare.checkin.entity.SleepQuality;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CheckinResponse {

    private UUID id;
    private UUID patientId;
    private MoodType mood;
    private Integer energyLevel;
    private SleepQuality sleepQuality;
    private String notes;
    private LocalDate checkinDate;
    private List<SymptomCheckResponse> symptoms = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public CheckinResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getPatientId() {
        return patientId;
    }

    public void setPatientId(UUID patientId) {
        this.patientId = patientId;
    }

    public MoodType getMood() {
        return mood;
    }

    public void setMood(MoodType mood) {
        this.mood = mood;
    }

    public Integer getEnergyLevel() {
        return energyLevel;
    }

    public void setEnergyLevel(Integer energyLevel) {
        this.energyLevel = energyLevel;
    }

    public SleepQuality getSleepQuality() {
        return sleepQuality;
    }

    public void setSleepQuality(SleepQuality sleepQuality) {
        this.sleepQuality = sleepQuality;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDate getCheckinDate() {
        return checkinDate;
    }

    public void setCheckinDate(LocalDate checkinDate) {
        this.checkinDate = checkinDate;
    }

    public List<SymptomCheckResponse> getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(List<SymptomCheckResponse> symptoms) {
        this.symptoms = symptoms;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
