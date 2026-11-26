package com.example.sms.dto;

import com.example.sms.entity.Role;
import jakarta.validation.constraints.*;
import java.util.List;

public final class Dtos {
    private Dtos() {}

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Size(min = 6, max = 72) String password,
            @NotNull Role role) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record UserResponse(Long id, String name, String email, Role role, Long studentId) {}

    public record AuthResponse(String token, String tokenType, long expiresInMs, UserResponse user) {}

    public record LeaderboardEntry(Long studentId, String name, int points, long rank) {}

    public record AwardRequest(@NotNull @Min(-1000) @Max(1000) Integer points) {}

    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages,
                                  boolean first, boolean last, String sortBy, String direction) {}
}
