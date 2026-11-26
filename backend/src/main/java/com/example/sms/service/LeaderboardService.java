package com.example.sms.service;

import com.example.sms.dto.Dtos.*;
import com.example.sms.entity.StudentProfile;
import com.example.sms.exception.*;
import com.example.sms.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LeaderboardService {
    private static final int MAX_POINTS = 1_000_000;
    private final StudentProfileRepository repository;

    @Transactional(readOnly = true)
    public PageResponse<LeaderboardEntry> list(int page, int size, String sortBy, String direction) {
        String property = switch (sortBy.toLowerCase()) {
            case "points" -> "points";
            case "name" -> "user.name";
            default -> throw new BadRequestException("sortBy must be one of: points, name");
        };
        Sort.Direction dir;
        try {
            dir = Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("direction must be 'asc' or 'desc'");
        }
        // id ASC is always the final tie-breaker => deterministic ordering and stable pagination
        Sort sort = Sort.by(dir, property).and(Sort.by(Sort.Direction.ASC, "id"));
        Page<StudentProfile> result = repository.findAll(PageRequest.of(page, size, sort));
        return new PageResponse<>(result.map(this::toEntry).getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages(), result.isFirst(), result.isLast(),
                sortBy.toLowerCase(), dir.name().toLowerCase());
    }

    @Transactional(readOnly = true)
    public LeaderboardEntry getByStudentId(Long studentId) {
        return toEntry(repository.findWithUserById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student " + studentId + " not found")));
    }

    @Transactional(readOnly = true)
    public LeaderboardEntry getByUserId(Long userId) {
        return toEntry(repository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for current user")));
    }

    /** Adds (or subtracts, if negative) points. Row-locked to avoid lost updates. */
    @Transactional
    public LeaderboardEntry award(Long studentId, int delta) {
        if (delta == 0) throw new BadRequestException("points must not be 0");
        StudentProfile s = repository.findByIdForUpdate(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student " + studentId + " not found"));
        long updated = (long) s.getPoints() + delta;
        if (updated < 0) throw new BadRequestException("Points cannot go below 0 (current: " + s.getPoints() + ")");
        if (updated > MAX_POINTS) throw new BadRequestException("Points cannot exceed " + MAX_POINTS);
        s.setPoints((int) updated);
        return toEntry(s);
    }

    private LeaderboardEntry toEntry(StudentProfile s) {
        long rank = repository.countAhead(s.getPoints(), s.getId()) + 1;
        return new LeaderboardEntry(s.getId(), s.getUser().getName(), s.getPoints(), rank);
    }
}
