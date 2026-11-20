
package com.studentmanagement.controller;

import com.studentmanagement.dto.PointResponse;
import com.studentmanagement.dto.StudentResponse;
import com.studentmanagement.service.StudentService;

import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // Get logged-in student's dashboard/profile
    @GetMapping("/me")
    public StudentResponse getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        return studentService.getMyProfile(
                userDetails.getUsername()
        );
    }

    // Get logged-in student's points history
    @GetMapping("/me/points")
    public Page<PointResponse> getMyPointsHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return studentService.getMyPointsHistory(
                userDetails.getUsername(),
                page,
                size
        );
    }

    // Get leaderboard with pagination
    @GetMapping("/leaderboard")
    public Page<StudentResponse> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return studentService.getLeaderboard(page, size);
    }
}
