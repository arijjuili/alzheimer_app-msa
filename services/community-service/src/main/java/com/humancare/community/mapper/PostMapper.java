package com.humancare.community.mapper;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.humancare.community.dto.CreatePostRequest;
import com.humancare.community.dto.PostResponse;
import com.humancare.community.dto.UpdatePostRequest;
import com.humancare.community.entity.CommunityPost;

@Component
public class PostMapper {

    private UUID parseAuthorId(String authorId) {
        try {
            return UUID.fromString(authorId);
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(authorId.getBytes(StandardCharsets.UTF_8));
        }
    }

    public CommunityPost toEntity(CreatePostRequest request) {
        CommunityPost post = new CommunityPost();
        post.setAuthorId(parseAuthorId(request.authorId()));
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setCategory(request.category());
        post.setIsActive(true);
        return post;
    }

    public void applyUpdate(CommunityPost post, UpdatePostRequest request) {
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setCategory(request.category());
        post.setIsActive(request.isActive());
    }

    public PostResponse toResponse(CommunityPost post) {
        return new PostResponse(
                post.getId(),
                post.getAuthorId(),
                post.getTitle(),
                post.getContent(),
                post.getCategory(),
                post.getIsActive(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
