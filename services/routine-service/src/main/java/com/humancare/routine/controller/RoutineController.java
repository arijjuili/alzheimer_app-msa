package com.humancare.routine.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.humancare.routine.dto.CreateRoutineRequest;
import com.humancare.routine.dto.RoutineResponse;
import com.humancare.routine.dto.UpdateRoutineRequest;
import com.humancare.routine.service.RoutineService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/routines")
@Validated
public class RoutineController {

    private final RoutineService service;

    public RoutineController(RoutineService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<RoutineResponse>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<RoutineResponse>> getByPatient(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.findByPatientId(patientId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoutineResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<RoutineResponse> create(
            @Valid @RequestBody CreateRoutineRequest request) {
        RoutineResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoutineResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoutineRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<RoutineResponse> complete(@PathVariable UUID id) {
        return ResponseEntity.ok(service.completeRoutine(id));
    }

    @PatchMapping("/{id}/uncomplete")
    public ResponseEntity<RoutineResponse> uncomplete(@PathVariable UUID id) {
        return ResponseEntity.ok(service.uncompleteRoutine(id));
    }
}
