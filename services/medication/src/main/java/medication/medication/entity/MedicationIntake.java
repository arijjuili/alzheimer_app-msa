package medication.medication.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import medication.medication.entity.enums.IntakeStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medication_intakes")
public class MedicationIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    @JsonIgnore
    private MedicationPlan plan;

    @NotNull(message = "Scheduled time is required")
    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "taken_at")
    private LocalDateTime takenAt;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IntakeStatus status = IntakeStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Constructors
    public MedicationIntake() {
    }

    public MedicationIntake(MedicationPlan plan, LocalDateTime scheduledAt, 
                            LocalDateTime takenAt, IntakeStatus status, String notes) {
        this.plan = plan;
        this.scheduledAt = scheduledAt;
        this.takenAt = takenAt;
        this.status = status;
        this.notes = notes;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public MedicationPlan getPlan() {
        return plan;
    }

    public void setPlan(MedicationPlan plan) {
        this.plan = plan;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public LocalDateTime getTakenAt() {
        return takenAt;
    }

    public void setTakenAt(LocalDateTime takenAt) {
        this.takenAt = takenAt;
    }

    public IntakeStatus getStatus() {
        return status;
    }

    public void setStatus(IntakeStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
