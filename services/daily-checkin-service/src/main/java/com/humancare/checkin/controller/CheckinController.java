package com.humancare.checkin.controller;

import com.humancare.checkin.dto.CreateCheckinRequest;
import com.humancare.checkin.dto.UpdateCheckinRequest;
import com.humancare.checkin.dto.CheckinResponse;
import com.humancare.checkin.service.CheckinService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/checkins")
@Validated
public class CheckinController {

    private final CheckinService checkinService;

    public CheckinController(CheckinService checkinService) {
        this.checkinService = checkinService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<CheckinResponse> create(@Valid @RequestBody CreateCheckinRequest request) {
        // TODO: Add security check - patient can only create for themselves
        return ResponseEntity.status(HttpStatus.CREATED).body(checkinService.create(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'CAREGIVER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<CheckinResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(checkinService.findById(id));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'CAREGIVER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<Page<CheckinResponse>> getByPatient(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(checkinService.findByPatientId(patientId, pageable));
    }

    @GetMapping("/patient/{patientId}/today")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<CheckinResponse> getTodayCheckin(@PathVariable UUID patientId) {
        return checkinService.findByPatientIdAndDate(patientId, LocalDate.now())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<CheckinResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCheckinRequest request) {
        return ResponseEntity.ok(checkinService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        checkinService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
