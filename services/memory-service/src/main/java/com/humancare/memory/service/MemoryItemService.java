package com.humancare.memory.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.humancare.memory.dto.CreateMemoryItemRequest;
import com.humancare.memory.dto.MemoryItemResponse;
import com.humancare.memory.dto.UpdateMemoryItemRequest;
import com.humancare.memory.entity.MemoryItem;
import com.humancare.memory.exception.MemoryItemNotFoundException;
import com.humancare.memory.repository.MemoryItemRepository;

@Service
public class MemoryItemService {

    private final MemoryItemRepository repository;

    public MemoryItemService(MemoryItemRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<MemoryItemResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public MemoryItemResponse findById(UUID id) {
        MemoryItem item = repository.findById(id)
                .orElseThrow(() -> new MemoryItemNotFoundException(id));
        return mapToResponse(item);
    }

    @Transactional(readOnly = true)
    public Page<MemoryItemResponse> findByPatientId(UUID patientId, Pageable pageable) {
        return repository.findByPatientId(patientId, pageable).map(this::mapToResponse);
    }

    @Transactional
    public MemoryItemResponse create(CreateMemoryItemRequest request) {
        MemoryItem item = new MemoryItem();
        item.setPatientId(request.getPatientId());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setMemoryDate(request.getMemoryDate());
        item.setMemoryType(request.getMemoryType());

        MemoryItem saved = repository.save(item);
        return mapToResponse(saved);
    }

    @Transactional
    public MemoryItemResponse update(UUID id, UpdateMemoryItemRequest request) {
        MemoryItem item = repository.findById(id)
                .orElseThrow(() -> new MemoryItemNotFoundException(id));

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setMemoryDate(request.getMemoryDate());
        item.setMemoryType(request.getMemoryType());

        MemoryItem saved = repository.save(item);
        return mapToResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        MemoryItem item = repository.findById(id)
                .orElseThrow(() -> new MemoryItemNotFoundException(id));
        repository.delete(item);
    }

    private MemoryItemResponse mapToResponse(MemoryItem item) {
        MemoryItemResponse response = new MemoryItemResponse();
        response.setId(item.getId());
        response.setPatientId(item.getPatientId());
        response.setTitle(item.getTitle());
        response.setDescription(item.getDescription());
        response.setMemoryDate(item.getMemoryDate());
        response.setMemoryType(item.getMemoryType());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }
}
