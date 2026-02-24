package com.humancare.community.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.humancare.community.dto.CreatePostRequest;
import com.humancare.community.dto.PostResponse;
import com.humancare.community.dto.UpdatePostRequest;
import com.humancare.community.entity.PostCategory;
import com.humancare.community.service.PostService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/posts")
@Validated
public class PostController {

    private final PostService service;

    public PostController(PostService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAll(
            @RequestParam(required = false) UUID authorId,
            @RequestParam(required = false) PostCategory category,
            @PageableDefault(size = 20) Pageable pageable) {
        if (authorId != null) {
            return ResponseEntity.ok(service.findByAuthorId(authorId, pageable));
        }
        if (category != null) {
            return ResponseEntity.ok(service.findByCategory(category, pageable));
        }
        return ResponseEntity.ok(service.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<PostResponse> create(@Valid @RequestBody CreatePostRequest request) {
        PostResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePostRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
