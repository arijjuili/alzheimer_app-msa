package medication.medication.service;

import medication.medication.entity.MedicationIntake;
import medication.medication.entity.MedicationPlan;
import medication.medication.entity.enums.IntakeStatus;
import medication.medication.event.MedicationMissedEvent;
import medication.medication.event.MedicationTakenEvent;
import medication.medication.exception.BadRequestException;
import medication.medication.exception.ResourceNotFoundException;
import medication.medication.repository.MedicationIntakeRepository;
import medication.medication.repository.MedicationPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MedicationIntakeService {

    private final MedicationIntakeRepository intakeRepository;
    private final MedicationPlanRepository planRepository;
    private final EventPublisherService eventPublisher;

    @Autowired
    public MedicationIntakeService(MedicationIntakeRepository intakeRepository,
                                   MedicationPlanRepository planRepository,
                                   EventPublisherService eventPublisher) {
        this.intakeRepository = intakeRepository;
        this.planRepository = planRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Create a new intake for a specific plan
     */
    public MedicationIntake createIntake(UUID planId, MedicationIntake intake) {
        MedicationPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationPlan", "id", planId));
        
        intake.setPlan(plan);
        
        // Set default status if not provided
        if (intake.getStatus() == null) {
            intake.setStatus(IntakeStatus.SCHEDULED);
        }
        
        // If status is TAKEN but takenAt is not set, set it to now
        if (intake.getStatus() == IntakeStatus.TAKEN && intake.getTakenAt() == null) {
            intake.setTakenAt(LocalDateTime.now());
        }
        
        return intakeRepository.save(intake);
    }

    /**
     * Get all intakes for a specific plan
     */
    @Transactional(readOnly = true)
    public List<MedicationIntake> getIntakesByPlanId(UUID planId) {
        // Verify plan exists
        if (!planRepository.existsById(planId)) {
            throw new ResourceNotFoundException("MedicationPlan", "id", planId);
        }
        return intakeRepository.findByPlanId(planId);
    }

    /**
     * Get intakes by plan and status
     */
    @Transactional(readOnly = true)
    public List<MedicationIntake> getIntakesByPlanIdAndStatus(UUID planId, IntakeStatus status) {
        if (!planRepository.existsById(planId)) {
            throw new ResourceNotFoundException("MedicationPlan", "id", planId);
        }
        return intakeRepository.findByPlanIdAndStatus(planId, status);
    }

    /**
     * Get intake by ID
     */
    @Transactional(readOnly = true)
    public MedicationIntake getIntakeById(UUID id) {
        return intakeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationIntake", "id", id));
    }

    /**
     * Get all intakes
     */
    @Transactional(readOnly = true)
    public List<MedicationIntake> getAllIntakes() {
        return intakeRepository.findAll();
    }

    /**
     * Get intakes by status
     */
    @Transactional(readOnly = true)
    public List<MedicationIntake> getIntakesByStatus(IntakeStatus status) {
        return intakeRepository.findByStatus(status);
    }

    /**
     * Update an intake
     */
    public MedicationIntake updateIntake(UUID id, MedicationIntake intakeDetails) {
        MedicationIntake intake = getIntakeById(id);
        
        intake.setScheduledAt(intakeDetails.getScheduledAt());
        intake.setTakenAt(intakeDetails.getTakenAt());
        intake.setStatus(intakeDetails.getStatus());
        intake.setNotes(intakeDetails.getNotes());
        
        // If status changed to TAKEN and takenAt is null, set it to now
        if (intake.getStatus() == IntakeStatus.TAKEN && intake.getTakenAt() == null) {
            intake.setTakenAt(LocalDateTime.now());
        }
        
        return intakeRepository.save(intake);
    }

    /**
     * Mark an intake as taken
     */
    public MedicationIntake markAsTaken(UUID id, String notes) {
        MedicationIntake intake = getIntakeById(id);
        intake.setStatus(IntakeStatus.TAKEN);
        intake.setTakenAt(LocalDateTime.now());
        if (notes != null && !notes.isEmpty()) {
            intake.setNotes(notes);
        }
        MedicationIntake saved = intakeRepository.save(intake);

        eventPublisher.publishMedicationTaken(new MedicationTakenEvent(
                saved.getId(),
                saved.getPlan().getId(),
                saved.getPlan().getPatientId(),
                saved.getPlan().getMedicationName(),
                saved.getTakenAt()
        ));

        return saved;
    }

    /**
     * Mark an intake as missed
     */
    public MedicationIntake markAsMissed(UUID id, String notes) {
        MedicationIntake intake = getIntakeById(id);
        intake.setStatus(IntakeStatus.MISSED);
        if (notes != null && !notes.isEmpty()) {
            intake.setNotes(notes);
        }
        MedicationIntake saved = intakeRepository.save(intake);

        eventPublisher.publishMedicationMissed(new MedicationMissedEvent(
                saved.getId(),
                saved.getPlan().getId(),
                saved.getPlan().getPatientId(),
                saved.getPlan().getMedicationName(),
                saved.getScheduledAt()
        ));

        return saved;
    }

    /**
     * Mark an intake as skipped
     */
    public MedicationIntake markAsSkipped(UUID id, String notes) {
        MedicationIntake intake = getIntakeById(id);
        intake.setStatus(IntakeStatus.SKIPPED);
        if (notes != null && !notes.isEmpty()) {
            intake.setNotes(notes);
        }
        return intakeRepository.save(intake);
    }

    /**
     * Delete an intake
     */
    public void deleteIntake(UUID id) {
        MedicationIntake intake = getIntakeById(id);
        intakeRepository.delete(intake);
    }

    /**
     * Count intakes by plan and status
     */
    @Transactional(readOnly = true)
    public long countIntakesByPlanAndStatus(UUID planId, IntakeStatus status) {
        return intakeRepository.countByPlanIdAndStatus(planId, status);
    }
}
