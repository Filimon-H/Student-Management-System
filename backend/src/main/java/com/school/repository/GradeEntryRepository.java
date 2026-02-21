package com.school.repository;

import com.school.entity.GradeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GradeEntryRepository extends JpaRepository<GradeEntry, Long> {
    List<GradeEntry> findByAssessmentId(Long assessmentId);
    List<GradeEntry> findByStudentId(Long studentId);
    Optional<GradeEntry> findByAssessmentIdAndStudentId(Long assessmentId, Long studentId);

    @Query("SELECT ge FROM GradeEntry ge JOIN ge.assessment a WHERE a.term.id = :termId AND ge.student.id = :studentId")
    List<GradeEntry> findByTermIdAndStudentId(@Param("termId") Long termId, @Param("studentId") Long studentId);

    @Query("SELECT ge FROM GradeEntry ge JOIN ge.assessment a WHERE a.term.id = :termId AND a.subject.id = :subjectId AND ge.student.id = :studentId")
    List<GradeEntry> findByTermIdAndSubjectIdAndStudentId(@Param("termId") Long termId, @Param("subjectId") Long subjectId, @Param("studentId") Long studentId);

    @Query("SELECT ge FROM GradeEntry ge JOIN ge.assessment a WHERE a.term.id = :termId AND a.schoolClass.id = :classId")
    List<GradeEntry> findByTermIdAndClassId(@Param("termId") Long termId, @Param("classId") Long classId);
}
