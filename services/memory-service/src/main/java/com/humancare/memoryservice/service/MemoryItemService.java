package com.humancare.memoryservice.service;

import com.humancare.memoryservice.dto.MemoryItemCreateRequest;
import com.humancare.memoryservice.dto.MemoryItemResponse;
import com.humancare.memoryservice.dto.MemoryItemUpdateRequest;
import com.humancare.memoryservice.entity.MemoryItem;
import com.humancare.memoryservice.exception.ResourceNotFoundException;
import com.humancare.memoryservice.repository.MemoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemoryItemService {

    private final MemoryItemRepository repository;

    @Transactional
    public MemoryItemResponse create(MemoryItemCreateRequest request) {
        MemoryItem item = MemoryItem.builder()
                .patientId(request.getPatientId())
                .memoryCategory(request.getMemoryCategory())
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .location(request.getLocation())
                .yearTaken(request.getYearTaken())
                .persons(request.getPersons())
                .questions(request.getQuestions())
                .correctAnswers(request.getCorrectAnswers())
                .storybookSelected(request.isStorybookSelected())
                .createdAt(OffsetDateTime.now())
                .build();

        MemoryItem saved = repository.save(item);
        return toResponse(saved);
    }

    public MemoryItemResponse getById(UUID id) {
        MemoryItem item = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MemoryItem not found: " + id));
        return toResponse(item);
    }

    public List<MemoryItemResponse> getAll(UUID patientId) {
        List<MemoryItem> items = patientId == null
                ? repository.findAll()
                : repository.findByPatientId(patientId);
        return items.stream().map(this::toResponse).toList();
    }

    public List<MemoryItemResponse> getByPatientId(UUID patientId) {
        return repository.findByPatientId(patientId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<MemoryItemResponse> getByPatientIds(List<UUID> patientIds) {
        return repository.findByPatientIdIn(patientIds).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MemoryItemResponse update(UUID id, MemoryItemUpdateRequest request) {
        MemoryItem item = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MemoryItem not found: " + id));

        if (request.getMemoryCategory() != null) {
            item.setMemoryCategory(request.getMemoryCategory());
        }
        if (request.getTitle() != null) {
            item.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            item.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }
        if (request.getLocation() != null) {
            item.setLocation(request.getLocation());
        }
        if (request.getYearTaken() != null) {
            item.setYearTaken(request.getYearTaken());
        }
        if (request.getPersons() != null) {
            item.setPersons(request.getPersons());
        }
        if (request.getQuestions() != null) {
            item.setQuestions(request.getQuestions());
        }
        if (request.getCorrectAnswers() != null) {
            item.setCorrectAnswers(request.getCorrectAnswers());
        }
        if (request.getStorybookSelected() != null) {
            item.setStorybookSelected(request.getStorybookSelected());
        }

        MemoryItem saved = repository.save(item);
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("MemoryItem not found: " + id);
        }
        repository.deleteById(id);
    }

    private MemoryItemResponse toResponse(MemoryItem item) {
        return MemoryItemResponse.builder()
                .id(item.getId())
                .patientId(item.getPatientId())
                .memoryCategory(item.getMemoryCategory())
                .title(item.getTitle())
                .description(item.getDescription())
                .imageUrl(item.getImageUrl())
                .location(item.getLocation())
                .yearTaken(item.getYearTaken())
                .persons(item.getPersons())
                .questions(item.getQuestions())
                .correctAnswers(item.getCorrectAnswers())
                .storybookSelected(item.isStorybookSelected())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
