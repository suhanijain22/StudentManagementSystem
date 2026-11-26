package com.example.sms.controller;

import com.example.sms.dto.Dtos.*;
import com.example.sms.entity.User;
import com.example.sms.service.LeaderboardService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaderboard")
@Validated
@RequiredArgsConstructor
public class LeaderboardController {
    private final LeaderboardService service;

    /** GET /api/leaderboard?page=0&size=20&sortBy=points|name&direction=asc|desc  (any authenticated user) */
    @GetMapping
    public PageResponse<LeaderboardEntry> list(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "points") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return service.list(page, size, sortBy, direction);
    }

    /** STUDENT only: the caller's own rank and points. */
    @GetMapping("/me")
    public LeaderboardEntry me(@AuthenticationPrincipal User user) {
        return service.getByUserId(user.getId());
    }

    @GetMapping("/{studentId}")
    public LeaderboardEntry byId(@PathVariable Long studentId) {
        return service.getByStudentId(studentId);
    }

    /** TEACHER only: award (positive) or deduct (negative) points. */
    @PostMapping("/{studentId}/points")
    public LeaderboardEntry award(@PathVariable Long studentId, @Valid @RequestBody AwardRequest request) {
        return service.award(studentId, request.points());
    }
}
