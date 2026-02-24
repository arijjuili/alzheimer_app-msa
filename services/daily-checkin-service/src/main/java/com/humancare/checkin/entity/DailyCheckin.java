package com.humancare.checkin.entity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "daily_checkins", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"patient_id", "checkin_date"}, name = "uk_patient_checkin_date")
})
@EntityListeners(AuditingEntityListener.class)
public class DailyCheckin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MoodType mood;

    @Column(name = "energy_level", nullable = false)
    private Integer energyLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "sleep_quality", nullable = false, length = 20)
    private SleepQuality sleepQuality;

    @Column(length = 500)
    private String notes;

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;

    @OneToMany(mappedBy = "dailyCheckin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SymptomCheck> symptoms = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public DailyCheckin() {
    }

    public DailyCheckin(UUID id, UUID patientId, MoodType mood, Integer energyLevel, 
                        SleepQuality sleepQuality, String notes, LocalDate checkinDate,
                        Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.mood = mood;
        this.energyLevel = energyLevel;
        this.sleepQuality = sleepQuality;
        this.notes = notes;
        this.checkinDate = checkinDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public List<SymptomCheck> getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(List<SymptomCheck> symptoms) {
        this.symptoms = symptoms;
    }

    public void addSymptom(SymptomCheck symptom) {
        symptoms.add(symptom);
        symptom.setDailyCheckin(this);
    }

    public void removeSymptom(SymptomCheck symptom) {
        symptoms.remove(symptom);
        symptom.setDailyCheckin(null);
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
