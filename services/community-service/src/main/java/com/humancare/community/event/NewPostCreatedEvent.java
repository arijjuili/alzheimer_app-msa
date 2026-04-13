package com.humancare.community.event;

import java.util.UUID;

public record NewPostCreatedEvent(
        UUID postId,
        UUID authorId,
        String title,
        String category
) {}
