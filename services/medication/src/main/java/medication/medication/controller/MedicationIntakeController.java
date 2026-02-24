package medication.medication.controller;

import jakarta.validation.Valid;
import medication.medication.entity.MedicationIntake;
import medication.medication.entity.enums.IntakeStatus;
import medication.medication.service.MedicationIntakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/medications")
public class MedicationIntakeController {

    private final MedicationIntakeService intakeService;

    @Autowired
    public MedicationIntakeController(MedicationIntakeService intakeService) {
        this.intakeService = intakeService;
    }

    // ==================== Intake Endpoints under Plans ====================

    /**
     * Create a new intake for a specific plan
     * POST /api/medications/plans/{planId}/intakes
     */
    @PostMapping("/plans/{planId}/intakes")
    public ResponseEntity<MedicationIntake> createIntake(
            @PathVariable UUID planId,
            @Valid @RequestBody MedicationIntake intake) {
        MedicationIntake createdIntake = intakeService.createIntake(planId, intake);
        return new ResponseEntity<>(createdIntake, HttpStatus.CREATED);
    }

    /**
     * Get all intakes for a specific plan
     * GET /api/medications/plans/{planId}/intakes
     */
    @GetMapping("/plans/{planId}/intakes")
    public ResponseEntity<List<MedicationIntake>> getIntakesByPlanId(@PathVariable UUID planId) {
        List<MedicationIntake> intakes = intakeService.getIntakesByPlanId(planId);
        return ResponseEntity.ok(intakes);
    }

    /**
     * Get intakes by plan and status
     * GET /api/medications/plans/{planId}/intakes?status=TAKEN
     */
    @GetMapping(value = "/plans/{planId}/intakes", params = "status")
    public ResponseEntity<List<MedicationIntake>> getIntakesByPlanIdAndStatus(
            @PathVariable UUID planId,
            @RequestParam IntakeStatus status) {
        List<MedicationIntake> intakes = intakeService.getIntakesByPlanIdAndStatus(planId, status);
        return ResponseEntity.ok(intakes);
    }

    // ==================== Direct Intake Endpoints ====================

    /**
     * Get all intakes
     * GET /api/medications/intakes
     */
    @GetMapping("/intakes")
    public ResponseEntity<List<MedicationIntake>> getAllIntakes() {
        List<MedicationIntake> intakes = intakeService.getAllIntakes();
        return ResponseEntity.ok(intakes);
    }

    /**
     * Get intake by ID
     * GET /api/medications/intakes/{id}
     */
    @GetMapping("/intakes/{id}")
    public ResponseEntity<MedicationIntake> getIntakeById(@PathVariable UUID id) {
        MedicationIntake intake = intakeService.getIntakeById(id);
        return ResponseEntity.ok(intake);
    }

    /**
     * Update an intake
     * PUT /api/medications/intakes/{id}
     */
    @PutMapping("/intakes/{id}")
    public ResponseEntity<MedicationIntake> updateIntake(
            @PathVariable UUID id,
            @Valid @RequestBody MedicationIntake intakeDetails) {
        MedicationIntake updatedIntake = intakeService.updateIntake(id, intakeDetails);
        return ResponseEntity.ok(updatedIntake);
    }

    /**
     * Delete an intake
     * DELETE /api/medications/intakes/{id}
     */
    @DeleteMapping("/intakes/{id}")
    public ResponseEntity<Void> deleteIntake(@PathVariable UUID id) {
        intakeService.deleteIntake(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Status Change Endpoints ====================

    /**
     * Mark an intake as taken
     * PATCH /api/medications/intakes/{id}/take
     */
    @PatchMapping("/intakes/{id}/take")
    public ResponseEntity<MedicationIntake> markAsTaken(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        MedicationIntake intake = intakeService.markAsTaken(id, notes);
        return ResponseEntity.ok(intake);
    }

    /**
     * Mark an intake as missed
     * PATCH /api/medications/intakes/{id}/miss
     */
    @PatchMapping("/intakes/{id}/miss")
    public ResponseEntity<MedicationIntake> markAsMissed(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        MedicationIntake intake = intakeService.markAsMissed(id, notes);
        return ResponseEntity.ok(intake);
    }

    /**
     * Mark an intake as skipped
     * PATCH /api/medications/intakes/{id}/skip
     */
    @PatchMapping("/intakes/{id}/skip")
    public ResponseEntity<MedicationIntake> markAsSkipped(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        MedicationIntake intake = intakeService.markAsSkipped(id, notes);
        return ResponseEntity.ok(intake);
    }
}
