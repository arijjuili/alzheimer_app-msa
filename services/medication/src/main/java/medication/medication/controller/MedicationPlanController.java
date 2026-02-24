package medication.medication.controller;

import jakarta.validation.Valid;
import medication.medication.entity.MedicationPlan;
import medication.medication.service.MedicationPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medications/plans")
public class MedicationPlanController {

    private final MedicationPlanService planService;

    @Autowired
    public MedicationPlanController(MedicationPlanService planService) {
        this.planService = planService;
    }

    /**
     * Create a new medication plan
     * POST /api/medications/plans
     */
    @PostMapping
    public ResponseEntity<MedicationPlan> createPlan(@Valid @RequestBody MedicationPlan plan) {
        MedicationPlan createdPlan = planService.createPlan(plan);
        return new ResponseEntity<>(createdPlan, HttpStatus.CREATED);
    }

    /**
     * Get all medication plans
     * GET /api/medications/plans
     */
    @GetMapping
    public ResponseEntity<List<MedicationPlan>> getAllPlans() {
        List<MedicationPlan> plans = planService.getAllPlans();
        return ResponseEntity.ok(plans);
    }

    /**
     * Get medication plan by ID
     * GET /api/medications/plans/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<MedicationPlan> getPlanById(@PathVariable UUID id) {
        MedicationPlan plan = planService.getPlanById(id);
        return ResponseEntity.ok(plan);
    }

    /**
     * Get plans by patient ID
     * GET /api/medications/plans/by-patient/{patientId}
     */
    @GetMapping("/by-patient/{patientId}")
    public ResponseEntity<List<MedicationPlan>> getPlansByPatientId(@PathVariable UUID patientId) {
        List<MedicationPlan> plans = planService.getPlansByPatientId(patientId);
        return ResponseEntity.ok(plans);
    }

    /**
     * Get active plans by patient ID
     * GET /api/medications/plans/by-patient/{patientId}/active
     */
    @GetMapping("/by-patient/{patientId}/active")
    public ResponseEntity<List<MedicationPlan>> getActivePlansByPatientId(@PathVariable UUID patientId) {
        List<MedicationPlan> plans = planService.getActivePlansByPatientId(patientId);
        return ResponseEntity.ok(plans);
    }

    /**
     * Update a medication plan
     * PUT /api/medications/plans/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<MedicationPlan> updatePlan(
            @PathVariable UUID id,
            @Valid @RequestBody MedicationPlan planDetails) {
        MedicationPlan updatedPlan = planService.updatePlan(id, planDetails);
        return ResponseEntity.ok(updatedPlan);
    }

    /**
     * Delete a medication plan
     * DELETE /api/medications/plans/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable UUID id) {
        planService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}
