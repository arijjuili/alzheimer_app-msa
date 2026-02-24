package com.humancare.community.dto;

import java.time.Instant;
import java.util.UUID;

import com.humancare.community.entity.PostCategory;

public record PostResponse(
        UUID id,
        UUID authorId,
        String title,
        String content,
        PostCategory category,
        Boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {}
