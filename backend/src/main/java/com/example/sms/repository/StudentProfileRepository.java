package com.example.sms.repository;

import com.example.sms.entity.StudentProfile;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    @EntityGraph(attributePaths = "user")
    Page<StudentProfile> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Optional<StudentProfile> findByUserId(Long userId);

    @EntityGraph(attributePaths = "user")
    Optional<StudentProfile> findWithUserById(Long id);

    /** Row lock so concurrent awards on the same student never lose an update. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from StudentProfile s join fetch s.user where s.id = :id")
    Optional<StudentProfile> findByIdForUpdate(@Param("id") Long id);

    /**
     * Number of students ranked strictly ahead: more points, or same points and lower id.
     * Ranking order is therefore deterministic: points DESC, id ASC. rank = countAhead + 1.
     */
    @Query("select count(s) from StudentProfile s where s.points > :points or (s.points = :points and s.id < :id)")
    long countAhead(@Param("points") int points, @Param("id") Long id);
}
