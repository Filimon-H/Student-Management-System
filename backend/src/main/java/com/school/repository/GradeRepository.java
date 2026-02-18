package com.school.repository;

import com.school.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByStudentId(Long studentId);
    List<Grade> findBySubjectId(Long subjectId);
    List<Grade> findByStudentIdAndSubjectId(Long studentId, Long subjectId);

    @Query("SELECT AVG(g.score / g.maxScore * 100) FROM Grade g WHERE g.student.id = :studentId")
    Double calculateAverageByStudentId(Long studentId);
}
