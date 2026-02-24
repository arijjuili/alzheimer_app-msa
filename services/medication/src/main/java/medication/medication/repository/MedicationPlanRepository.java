package medication.medication.repository;

import medication.medication.entity.MedicationPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationPlanRepository extends JpaRepository<MedicationPlan, UUID> {
    
    /**
     * Find all medication plans for a specific patient
     */
    List<MedicationPlan> findByPatientId(UUID patientId);
    
    /**
     * Find all active medication plans for a specific patient
     */
    List<MedicationPlan> findByPatientIdAndActiveTrue(UUID patientId);
    
    /**
     * Find all active medication plans
     */
    List<MedicationPlan> findByActiveTrue();
    
    /**
     * Check if a patient has any medication plans
     */
    boolean existsByPatientId(UUID patientId);
}
