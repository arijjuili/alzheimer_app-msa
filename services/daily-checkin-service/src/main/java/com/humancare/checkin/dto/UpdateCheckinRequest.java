package com.humancare.checkin.dto;

import com.humancare.checkin.entity.MoodType;
import com.humancare.checkin.entity.SleepQuality;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class UpdateCheckinRequest {

    private MoodType mood;

    @Min(value = 1, message = "Energy level must be at least 1")
    @Max(value = 10, message = "Energy level must be at most 10")
    private Integer energyLevel;

    private SleepQuality sleepQuality;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @Valid
    private List<SymptomCheckRequest> symptoms = new ArrayList<>();

    public UpdateCheckinRequest() {
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

    public List<SymptomCheckRequest> getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(List<SymptomCheckRequest> symptoms) {
        this.symptoms = symptoms;
    }
}
