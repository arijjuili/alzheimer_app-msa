package medication.medication.repository;

import medication.medication.entity.MedicationIntake;
import medication.medication.entity.enums.IntakeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationIntakeRepository extends JpaRepository<MedicationIntake, UUID> {
    
    /**
     * Find all intakes for a specific medication plan
     */
    List<MedicationIntake> findByPlanId(UUID planId);
    
    /**
     * Find all intakes for a specific plan with a specific status
     */
    List<MedicationIntake> findByPlanIdAndStatus(UUID planId, IntakeStatus status);
    
    /**
     * Find all intakes scheduled between two dates
     */
    List<MedicationIntake> findByScheduledAtBetween(LocalDateTime start, LocalDateTime end);
    
    /**
     * Find all intakes with a specific status
     */
    List<MedicationIntake> findByStatus(IntakeStatus status);
    
    /**
     * Count intakes by plan and status
     */
    long countByPlanIdAndStatus(UUID planId, IntakeStatus status);
    
    /**
     * Delete all intakes for a specific plan
     */
    void deleteByPlanId(UUID planId);
}
