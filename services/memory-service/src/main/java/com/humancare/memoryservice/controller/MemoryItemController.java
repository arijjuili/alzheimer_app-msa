package com.humancare.memoryservice.controller;

import com.humancare.memoryservice.dto.MemoryItemCreateRequest;
import com.humancare.memoryservice.dto.MemoryItemResponse;
import com.humancare.memoryservice.dto.MemoryItemUpdateRequest;
import com.humancare.memoryservice.service.MemoryItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/memory-items")
@RequiredArgsConstructor
public class MemoryItemController {

    private final MemoryItemService service;

    @PostMapping
    public ResponseEntity<MemoryItemResponse> create(@Valid @RequestBody MemoryItemCreateRequest request) {
        MemoryItemResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemoryItemResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<MemoryItemResponse>> getAll(
            @RequestParam(required = false) UUID patientId) {
        return ResponseEntity.ok(service.getAll(patientId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MemoryItemResponse>> getByPatientId(@PathVariable UUID patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @PostMapping("/batch/by-patients")
    public ResponseEntity<List<MemoryItemResponse>> getByPatientIds(@RequestBody List<UUID> patientIds) {
        return ResponseEntity.ok(service.getByPatientIds(patientIds));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemoryItemResponse> update(
            @PathVariable UUID id,
            @RequestBody MemoryItemUpdateRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
