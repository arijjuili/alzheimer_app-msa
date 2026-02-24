package com.humancare.community.dto;

import java.util.UUID;

import com.humancare.community.entity.PostCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @NotNull(message = "Author ID is required")
        UUID authorId,

        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must be less than 150 characters")
        String title,

        @NotBlank(message = "Content is required")
        @Size(max = 2000, message = "Content must be less than 2000 characters")
        String content,

        @NotNull(message = "Category is required")
        PostCategory category
) {}
