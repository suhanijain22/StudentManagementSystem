
package com.studentmanagement.service;

import com.studentmanagement.dto.PointResponse;
import com.studentmanagement.dto.StudentResponse;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.entity.User;
import com.studentmanagement.repository.PointTransactionRepository;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.repository.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PointTransactionRepository pointTransactionRepository;

    public StudentService(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            PointTransactionRepository pointTransactionRepository) {

        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.pointTransactionRepository = pointTransactionRepository;
    }

    public StudentResponse getMyProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        StudentProfile profile =
                studentProfileRepository.findByUserId(user.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Student profile not found"));

        return mapStudent(profile);
    }

    public Page<PointResponse> getMyPointsHistory(
            String email, int page, int size) {

        validatePagination(page, size);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        StudentProfile profile =
                studentProfileRepository.findByUserId(user.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Student profile not found"));

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
                        .and(Sort.by(Sort.Direction.DESC, "id"))
        );

        return pointTransactionRepository
                .findByStudentId(profile.getId(), pageable)
                .map(this::mapPoint);
    }

    public Page<StudentResponse> getLeaderboard(int page, int size) {

        validatePagination(page, size);

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "totalPoints")
                        .and(Sort.by(Sort.Direction.ASC, "id"))
        );

        return studentProfileRepository.findAll(pageable)
                .map(this::mapStudent);
    }

    private StudentResponse mapStudent(StudentProfile profile) {

        User user = profile.getUser();

        return new StudentResponse(
                profile.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                profile.getRollNumber(),
                profile.getDepartment(),
                profile.getTotalPoints()
        );
    }

    private PointResponse mapPoint(
            com.studentmanagement.entity.PointTransaction transaction) {

        PointResponse response = new PointResponse();

        response.setId(transaction.getId());
        response.setStudentId(transaction.getStudent().getId());
        response.setStudentName(
                transaction.getStudent().getUser().getName()
        );

        if (transaction.getTeacher() != null) {
            response.setTeacherId(transaction.getTeacher().getId());
            response.setTeacherName(transaction.getTeacher().getName());
        }

        response.setPoints(transaction.getPoints());
        response.setReason(transaction.getReason());
        response.setCreatedAt(transaction.getCreatedAt());

        return response;
    }

    private void validatePagination(int page, int size) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative");
        }

        if (size < 1 || size > 50) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 50");
        }
    }
}
