package com.example.sms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_profiles",
        uniqueConstraints = @UniqueConstraint(name = "uk_student_user", columnNames = "user_id"),
        indexes = @Index(name = "idx_student_points", columnList = "points"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_student_user"))
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private int points = 0;
}
