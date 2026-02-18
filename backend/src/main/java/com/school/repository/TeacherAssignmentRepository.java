package com.school.repository;

import com.school.entity.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {
    List<TeacherAssignment> findByTeacherId(Long teacherId);
    List<TeacherAssignment> findByTermId(Long termId);
    List<TeacherAssignment> findByTeacherIdAndTermId(Long teacherId, Long termId);
    List<TeacherAssignment> findBySchoolClassIdAndTermId(Long classId, Long termId);
    boolean existsByTeacherIdAndSchoolClassIdAndSubjectIdAndTermId(Long teacherId, Long classId, Long subjectId, Long termId);
}
