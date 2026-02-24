package com.humancare.checkin.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "symptom_checks")
public class SymptomCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "daily_checkin_id", nullable = false)
    private DailyCheckin dailyCheckin;

    @Column(name = "symptom_type", nullable = false, length = 100)
    private String symptomType;

    @Column(nullable = false)
    private Integer severity;

    @Column(nullable = false)
    private Boolean present = true;

    public SymptomCheck() {
    }

    public SymptomCheck(UUID id, DailyCheckin dailyCheckin, String symptomType, Integer severity, Boolean present) {
        this.id = id;
        this.dailyCheckin = dailyCheckin;
        this.symptomType = symptomType;
        this.severity = severity;
        this.present = present;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public DailyCheckin getDailyCheckin() {
        return dailyCheckin;
    }

    public void setDailyCheckin(DailyCheckin dailyCheckin) {
        this.dailyCheckin = dailyCheckin;
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
