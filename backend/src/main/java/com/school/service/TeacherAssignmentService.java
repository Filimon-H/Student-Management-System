package com.school.service;

import com.school.dto.TeacherAssignmentDTO;
import com.school.entity.*;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherAssignmentService {

    private final TeacherAssignmentRepository assignmentRepository;
    private final TeacherRepository teacherRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final TermRepository termRepository;

    public List<TeacherAssignmentDTO> getByTerm(Long termId) {
        return assignmentRepository.findByTermId(termId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TeacherAssignmentDTO> getByTeacher(Long teacherId) {
        return assignmentRepository.findByTeacherId(teacherId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TeacherAssignmentDTO> getByTeacherAndTerm(Long teacherId, Long termId) {
        return assignmentRepository.findByTeacherIdAndTermId(teacherId, termId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public TeacherAssignmentDTO assign(TeacherAssignmentDTO dto) {
        if (assignmentRepository.existsByTeacherIdAndSchoolClassIdAndSubjectIdAndTermId(
                dto.getTeacherId(), dto.getClassId(), dto.getSubjectId(), dto.getTermId())) {
            throw new RuntimeException("This assignment already exists");
        }
        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + dto.getTeacherId()));
        SchoolClass schoolClass = schoolClassRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + dto.getClassId()));
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + dto.getSubjectId()));
        Term term = termRepository.findById(dto.getTermId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found: " + dto.getTermId()));

        TeacherAssignment assignment = TeacherAssignment.builder()
                .teacher(teacher).schoolClass(schoolClass).subject(subject).term(term).build();
        return toDTO(assignmentRepository.save(assignment));
    }

    @Transactional
    public void delete(Long id) {
        if (!assignmentRepository.existsById(id)) throw new ResourceNotFoundException("Assignment not found: " + id);
        assignmentRepository.deleteById(id);
    }

    private TeacherAssignmentDTO toDTO(TeacherAssignment a) {
        return TeacherAssignmentDTO.builder()
                .id(a.getId())
                .teacherId(a.getTeacher().getId())
                .teacherName(a.getTeacher().getFirstName() + " " + a.getTeacher().getLastName())
                .classId(a.getSchoolClass().getId())
                .className(a.getSchoolClass().getName())
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getName())
                .termId(a.getTerm().getId())
                .termName(a.getTerm().getName())
                .build();
    }
}
