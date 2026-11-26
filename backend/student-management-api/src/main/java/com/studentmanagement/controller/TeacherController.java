package com.studentmanagement.controller;

import com.studentmanagement.dto.PointRequest;
import com.studentmanagement.dto.PointResponse;
import com.studentmanagement.dto.StudentResponse;
import com.studentmanagement.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {
    private final TeacherService teacherService;
    public TeacherController(TeacherService teacherService) { this.teacherService = teacherService; }

    @GetMapping("/students")
    public Page<StudentResponse> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return teacherService.getStudents(page, size);
    }

    @PostMapping("/points")
    public PointResponse awardPoints(
            @Valid @RequestBody PointRequest request,
            @AuthenticationPrincipal UserDetails teacher) {
        return teacherService.updatePoints(request, teacher.getUsername());
    }
}
