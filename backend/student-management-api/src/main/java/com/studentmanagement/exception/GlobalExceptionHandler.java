package com.studentmanagement.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException ex) {
        Map<String,String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return response(HttpStatus.BAD_REQUEST, "Validation failed", errors);
    }
    @ExceptionHandler({IllegalArgumentException.class, ConstraintViolationException.class})
    public ResponseEntity<Map<String,Object>> badRequest(Exception ex) {
        return response(HttpStatus.BAD_REQUEST, ex.getMessage(), Map.of());
    }
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String,Object>> badCredentials(Exception ex) {
        return response(HttpStatus.UNAUTHORIZED, "Invalid email or password", Map.of());
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> unexpected(Exception ex) {
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred", Map.of());
    }
    private ResponseEntity<Map<String,Object>> response(HttpStatus status, String message, Map<String,?> details) {
        Map<String,Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("details", details);
        return ResponseEntity.status(status).body(body);
    }
}
