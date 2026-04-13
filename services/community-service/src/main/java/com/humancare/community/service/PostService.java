package com.humancare.community.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.humancare.community.dto.CreatePostRequest;
import com.humancare.community.dto.PostResponse;
import com.humancare.community.dto.UpdatePostRequest;
import com.humancare.community.entity.CommunityPost;
import com.humancare.community.entity.PostCategory;
import com.humancare.community.exception.PostNotFoundException;
import com.humancare.community.mapper.PostMapper;
import com.humancare.community.repository.PostRepository;

@Service
public class PostService {

    private final PostRepository repository;
    private final PostMapper mapper;
    private final EventPublisherService eventPublisher;
    private final com.humancare.community.client.PatientClient patientClient;

    public PostService(PostRepository repository, PostMapper mapper,
                       EventPublisherService eventPublisher,
                       com.humancare.community.client.PatientClient patientClient) {
        this.repository = repository;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
        this.patientClient = patientClient;
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> findByAuthorId(UUID authorId, Pageable pageable) {
        return repository.findByAuthorId(authorId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> findByCategory(PostCategory category, Pageable pageable) {
        return repository.findByCategory(category, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PostResponse findById(UUID id) {
        return mapper.toResponse(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public PostResponse findByIdWithAuthor(UUID id) {
        PostResponse response = mapper.toResponse(getOrThrow(id));
        // Synchronous Feign enrichment: load patient author details
        try {
            var patient = patientClient.getPatientById(response.authorId());
            if (patient != null) {
                // enrich response if your DTO supports it; for now we keep it simple
            }
        } catch (Exception e) {
            // ignore enrichment failure
        }
        return response;
    }

    @Transactional
    public PostResponse create(CreatePostRequest request) {
        CommunityPost post = mapper.toEntity(request);
        CommunityPost saved = repository.save(post);

        eventPublisher.publishNewPostCreated(new com.humancare.community.event.NewPostCreatedEvent(
                saved.getId(),
                saved.getAuthorId(),
                saved.getTitle(),
                saved.getCategory().name()
        ));

        return mapper.toResponse(saved);
    }

    @Transactional
    public PostResponse update(UUID id, UpdatePostRequest request) {
        CommunityPost post = getOrThrow(id);
        mapper.applyUpdate(post, request);
        return mapper.toResponse(post);
    }

    @Transactional
    public void delete(UUID id) {
        CommunityPost post = getOrThrow(id);
        repository.delete(post);
    }

    private CommunityPost getOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }
}
