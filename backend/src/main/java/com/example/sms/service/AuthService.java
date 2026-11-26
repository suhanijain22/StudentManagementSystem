package com.example.sms.service;

import com.example.sms.dto.Dtos.*;
import com.example.sms.entity.*;
import com.example.sms.exception.DuplicateResourceException;
import com.example.sms.repository.*;
import com.example.sms.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final StudentProfileRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }
        User user = userRepository.save(User.builder()
                .name(req.name().trim())
                .email(email)
                .password(passwordEncoder.encode(req.password()))
                .role(req.role())
                .build());
        if (user.getRole() == Role.STUDENT) {
            studentRepository.save(StudentProfile.builder().user(user).points(0).build());
        }
        return buildResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email().trim().toLowerCase())
                .filter(u -> passwordEncoder.matches(req.password(), u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        return buildResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse toUserResponse(User user) {
        Long studentId = user.getRole() == Role.STUDENT
                ? studentRepository.findByUserId(user.getId()).map(StudentProfile::getId).orElse(null)
                : null;
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), studentId);
    }

    private AuthResponse buildResponse(User user) {
        return new AuthResponse(jwtService.generate(user), "Bearer", jwtService.getExpirationMs(), toUserResponse(user));
    }
}
