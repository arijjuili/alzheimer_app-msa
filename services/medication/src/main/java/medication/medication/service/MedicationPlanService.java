package medication.medication.service;

import medication.medication.entity.MedicationPlan;
import medication.medication.exception.ResourceNotFoundException;
import medication.medication.repository.MedicationPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MedicationPlanService {

    private final MedicationPlanRepository medicationPlanRepository;

    @Autowired
    public MedicationPlanService(MedicationPlanRepository medicationPlanRepository) {
        this.medicationPlanRepository = medicationPlanRepository;
    }

    /**
     * Create a new medication plan
     */
    public MedicationPlan createPlan(MedicationPlan plan) {
        return medicationPlanRepository.save(plan);
    }

    /**
     * Get all medication plans
     */
    @Transactional(readOnly = true)
    public List<MedicationPlan> getAllPlans() {
        return medicationPlanRepository.findAll();
    }

    /**
     * Get all active medication plans
     */
    @Transactional(readOnly = true)
    public List<MedicationPlan> getAllActivePlans() {
        return medicationPlanRepository.findByActiveTrue();
    }

    /**
     * Get medication plan by ID
     */
    @Transactional(readOnly = true)
    public MedicationPlan getPlanById(UUID id) {
        return medicationPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationPlan", "id", id));
    }

    /**
     * Get all plans for a specific patient
     */
    @Transactional(readOnly = true)
    public List<MedicationPlan> getPlansByPatientId(UUID patientId) {
        return medicationPlanRepository.findByPatientId(patientId);
    }

    /**
     * Get all active plans for a specific patient
     */
    @Transactional(readOnly = true)
    public List<MedicationPlan> getActivePlansByPatientId(UUID patientId) {
        return medicationPlanRepository.findByPatientIdAndActiveTrue(patientId);
    }

    /**
     * Update a medication plan
     */
    public MedicationPlan updatePlan(UUID id, MedicationPlan planDetails) {
        MedicationPlan plan = getPlanById(id);
        
        plan.setPatientId(planDetails.getPatientId());
        plan.setMedicationName(planDetails.getMedicationName());
        plan.setDosage(planDetails.getDosage());
        plan.setForm(planDetails.getForm());
        plan.setFrequencyPerDay(planDetails.getFrequencyPerDay());
        plan.setStartDate(planDetails.getStartDate());
        plan.setEndDate(planDetails.getEndDate());
        plan.setInstructions(planDetails.getInstructions());
        plan.setActive(planDetails.getActive());
        
        return medicationPlanRepository.save(plan);
    }

    /**
     * Delete a medication plan (cascade will delete associated intakes)
     */
    public void deletePlan(UUID id) {
        MedicationPlan plan = getPlanById(id);
        medicationPlanRepository.delete(plan);
    }

    /**
     * Check if a plan exists
     */
    @Transactional(readOnly = true)
    public boolean existsById(UUID id) {
        return medicationPlanRepository.existsById(id);
    }
}
