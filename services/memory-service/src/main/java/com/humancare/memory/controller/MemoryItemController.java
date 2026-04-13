package com.humancare.memory.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.humancare.memory.dto.CreateMemoryItemRequest;
import com.humancare.memory.dto.MemoryItemResponse;
import com.humancare.memory.dto.UpdateMemoryItemRequest;
import com.humancare.memory.service.MemoryItemService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/memories")
@Validated
public class MemoryItemController {

    private final MemoryItemService memoryItemService;

    public MemoryItemController(MemoryItemService memoryItemService) {
        this.memoryItemService = memoryItemService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'CAREGIVER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<Page<MemoryItemResponse>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(memoryItemService.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'CAREGIVER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<MemoryItemResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(memoryItemService.findById(id));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'CAREGIVER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<Page<MemoryItemResponse>> getByPatient(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(memoryItemService.findByPatientId(patientId, pageable));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'CAREGIVER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<MemoryItemResponse> create(
            @Valid @RequestBody CreateMemoryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(memoryItemService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'CAREGIVER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<MemoryItemResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMemoryItemRequest request) {
        return ResponseEntity.ok(memoryItemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        memoryItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
