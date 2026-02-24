package medication.medication.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import medication.medication.entity.enums.MedicationForm;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "medication_plans")
public class MedicationPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "Patient ID is required")
    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @NotBlank(message = "Medication name is required")
    @Column(name = "medication_name", nullable = false)
    private String medicationName;

    @NotBlank(message = "Dosage is required")
    @Column(nullable = false)
    private String dosage;

    @NotNull(message = "Form is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MedicationForm form;

    @NotNull(message = "Frequency per day is required")
    @Min(value = 1, message = "Frequency must be at least 1")
    @Column(name = "frequency_per_day", nullable = false)
    private Integer frequencyPerDay;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<MedicationIntake> intakes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for bidirectional relationship
    public void addIntake(MedicationIntake intake) {
        intakes.add(intake);
        intake.setPlan(this);
    }

    public void removeIntake(MedicationIntake intake) {
        intakes.remove(intake);
        intake.setPlan(null);
    }

    // Constructors
    public MedicationPlan() {
    }

    public MedicationPlan(UUID patientId, String medicationName, String dosage, 
                          MedicationForm form, Integer frequencyPerDay, 
                          LocalDate startDate, LocalDate endDate, 
                          String instructions, Boolean active) {
        this.patientId = patientId;
        this.medicationName = medicationName;
        this.dosage = dosage;
        this.form = form;
        this.frequencyPerDay = frequencyPerDay;
        this.startDate = startDate;
        this.endDate = endDate;
        this.instructions = instructions;
        this.active = active;
    }

    // Getters and Setters
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

    public String getMedicationName() {
        return medicationName;
    }

    public void setMedicationName(String medicationName) {
        this.medicationName = medicationName;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public MedicationForm getForm() {
        return form;
    }

    public void setForm(MedicationForm form) {
        this.form = form;
    }

    public Integer getFrequencyPerDay() {
        return frequencyPerDay;
    }

    public void setFrequencyPerDay(Integer frequencyPerDay) {
        this.frequencyPerDay = frequencyPerDay;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<MedicationIntake> getIntakes() {
        return intakes;
    }

    public void setIntakes(List<MedicationIntake> intakes) {
        this.intakes = intakes;
    }
}
