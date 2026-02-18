package com.school.repository;

import com.school.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findBySchoolClassIdAndTermId(Long classId, Long termId);
    List<Enrollment> findByTermId(Long termId);
    boolean existsByStudentIdAndSchoolClassIdAndTermId(Long studentId, Long classId, Long termId);
    Optional<Enrollment> findByStudentIdAndSchoolClassIdAndTermId(Long studentId, Long classId, Long termId);
}
