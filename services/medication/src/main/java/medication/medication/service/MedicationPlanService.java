package medication.medication.service;

import medication.medication.client.PatientClient;
import medication.medication.dto.PatientDto;
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
    private final PatientClient patientClient;

    @Autowired
    public MedicationPlanService(MedicationPlanRepository medicationPlanRepository,
                                 PatientClient patientClient) {
        this.medicationPlanRepository = medicationPlanRepository;
        this.patientClient = patientClient;
    }

    /**
     * Create a new medication plan
     */
    public MedicationPlan createPlan(MedicationPlan plan) {
        // Synchronous Feign validation: ensure patient exists
        PatientDto patient = patientClient.getPatientById(plan.getPatientId());
        if (patient == null) {
            throw new ResourceNotFoundException("Patient", "id", plan.getPatientId());
        }
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
     * Update a medication plan (partial update)
     */
    public MedicationPlan updatePlan(UUID id, MedicationPlan planDetails) {
        MedicationPlan plan = getPlanById(id);

        if (planDetails.getPatientId() != null) {
            plan.setPatientId(planDetails.getPatientId());
        }
        if (planDetails.getMedicationName() != null) {
            plan.setMedicationName(planDetails.getMedicationName());
        }
        if (planDetails.getDosage() != null) {
            plan.setDosage(planDetails.getDosage());
        }
        if (planDetails.getForm() != null) {
            plan.setForm(planDetails.getForm());
        }
        if (planDetails.getFrequencyPerDay() != null) {
            plan.setFrequencyPerDay(planDetails.getFrequencyPerDay());
        }
        if (planDetails.getStartDate() != null) {
            plan.setStartDate(planDetails.getStartDate());
        }
        if (planDetails.getEndDate() != null) {
            plan.setEndDate(planDetails.getEndDate());
        }
        if (planDetails.getInstructions() != null) {
            plan.setInstructions(planDetails.getInstructions());
        }
        if (planDetails.getActive() != null) {
            plan.setActive(planDetails.getActive());
        }

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
