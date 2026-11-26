package com.studentmanagement.service;

import com.studentmanagement.dto.PointRequest;
import com.studentmanagement.dto.PointResponse;
import com.studentmanagement.dto.StudentResponse;
import com.studentmanagement.entity.PointTransaction;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.entity.User;
import com.studentmanagement.repository.PointTransactionRepository;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
public class TeacherService {
    private final UserRepository users;
    private final StudentProfileRepository students;
    private final PointTransactionRepository transactions;

    public TeacherService(UserRepository users, StudentProfileRepository students,
                          PointTransactionRepository transactions) {
        this.users = users; this.students = students; this.transactions = transactions;
    }

    public Page<StudentResponse> getStudents(int page, int size) {
        validatePage(page, size);
        return students.findAll(PageRequest.of(page, size,
                Sort.by(Sort.Direction.ASC, "user.name").and(Sort.by("id"))))
                .map(this::toStudent);
    }

    @Transactional
    public PointResponse updatePoints(PointRequest request, String teacherEmail) {
        if (request.getPoints() == null || request.getPoints() == 0)
            throw new IllegalArgumentException("Points cannot be zero");
        if (request.getPoints() > 1000 || request.getPoints() < -1000)
            throw new IllegalArgumentException("A single points change must be between -1000 and 1000");

        StudentProfile student = students.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        User teacher = users.findByEmail(teacherEmail)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        int updated = student.getTotalPoints() + request.getPoints();
        if (updated < 0) throw new IllegalArgumentException("A student's total points cannot become negative");
        student.setTotalPoints(updated);
        students.save(student);

        PointTransaction tx = new PointTransaction();
        tx.setStudent(student);
        tx.setTeacher(teacher);
        tx.setPoints(request.getPoints());
        tx.setReason(request.getReason().trim());
        return toPoint(transactions.save(tx));
    }

    private StudentResponse toStudent(StudentProfile p) {
        User u = p.getUser();
        return new StudentResponse(p.getId(), u.getId(), u.getName(), u.getEmail(),
                p.getRollNumber(), p.getDepartment(), p.getTotalPoints());
    }

    private PointResponse toPoint(PointTransaction tx) {
        PointResponse r = new PointResponse();
        r.setId(tx.getId());
        r.setStudentId(tx.getStudent().getId());
        r.setStudentName(tx.getStudent().getUser().getName());
        r.setTeacherId(tx.getTeacher().getId());
        r.setTeacherName(tx.getTeacher().getName());
        r.setPoints(tx.getPoints());
        r.setReason(tx.getReason());
        r.setCreatedAt(tx.getCreatedAt());
        return r;
    }

    private void validatePage(int page, int size) {
        if (page < 0 || size < 1 || size > 50)
            throw new IllegalArgumentException("Page must be non-negative and size must be between 1 and 50");
    }
}
