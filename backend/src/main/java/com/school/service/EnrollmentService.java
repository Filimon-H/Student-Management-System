package com.school.service;

import com.school.dto.EnrollmentDTO;
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
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final TermRepository termRepository;

    public List<EnrollmentDTO> getByTerm(Long termId) {
        return enrollmentRepository.findByTermId(termId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<EnrollmentDTO> getByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<EnrollmentDTO> getByClassAndTerm(Long classId, Long termId) {
        return enrollmentRepository.findBySchoolClassIdAndTermId(classId, termId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public EnrollmentDTO enroll(EnrollmentDTO dto) {
        if (enrollmentRepository.existsByStudentIdAndSchoolClassIdAndTermId(dto.getStudentId(), dto.getClassId(), dto.getTermId())) {
            throw new RuntimeException("Student is already enrolled in this class for this term");
        }
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + dto.getStudentId()));
        SchoolClass schoolClass = schoolClassRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + dto.getClassId()));
        Term term = termRepository.findById(dto.getTermId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found: " + dto.getTermId()));

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .schoolClass(schoolClass)
                .term(term)
                .status(dto.getStatus() != null ? dto.getStatus() : EnrollmentStatus.ACTIVE)
                .build();
        return toDTO(enrollmentRepository.save(enrollment));
    }

    @Transactional
    public EnrollmentDTO updateStatus(Long id, EnrollmentStatus status) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + id));
        enrollment.setStatus(status);
        return toDTO(enrollmentRepository.save(enrollment));
    }

    @Transactional
    public void delete(Long id) {
        if (!enrollmentRepository.existsById(id)) throw new ResourceNotFoundException("Enrollment not found: " + id);
        enrollmentRepository.deleteById(id);
    }

    private EnrollmentDTO toDTO(Enrollment e) {
        return EnrollmentDTO.builder()
                .id(e.getId())
                .studentId(e.getStudent().getId())
                .studentName(e.getStudent().getFirstName() + " " + e.getStudent().getLastName())
                .classId(e.getSchoolClass().getId())
                .className(e.getSchoolClass().getName())
                .termId(e.getTerm().getId())
                .termName(e.getTerm().getName())
                .status(e.getStatus())
                .build();
    }
}
