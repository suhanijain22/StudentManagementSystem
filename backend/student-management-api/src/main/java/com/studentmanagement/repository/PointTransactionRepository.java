
package com.studentmanagement.repository;

import com.studentmanagement.entity.PointTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointTransactionRepository
        extends JpaRepository<PointTransaction, Long> {

    Page<PointTransaction> findByStudentId(
            Long studentId,
            Pageable pageable
    );
}
