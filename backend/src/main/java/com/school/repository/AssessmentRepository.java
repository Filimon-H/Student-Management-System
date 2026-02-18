package com.school.repository;

import com.school.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByTermIdAndSchoolClassIdAndSubjectId(Long termId, Long classId, Long subjectId);
    List<Assessment> findByTermIdAndSchoolClassId(Long termId, Long classId);
    List<Assessment> findByTermId(Long termId);
}
