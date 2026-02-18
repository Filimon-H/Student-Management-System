package com.school.service;

import com.school.dto.AssessmentDTO;
import com.school.dto.GradeEntryDTO;
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
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final GradeEntryRepository gradeEntryRepository;
    private final TermRepository termRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final GradingEngine gradingEngine;

    public List<AssessmentDTO> getByTermClassSubject(Long termId, Long classId, Long subjectId) {
        return assessmentRepository.findByTermIdAndSchoolClassIdAndSubjectId(termId, classId, subjectId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AssessmentDTO> getByTermAndClass(Long termId, Long classId) {
        return assessmentRepository.findByTermIdAndSchoolClassId(termId, classId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public AssessmentDTO create(AssessmentDTO dto) {
        Term term = termRepository.findById(dto.getTermId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found: " + dto.getTermId()));
        SchoolClass schoolClass = schoolClassRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + dto.getClassId()));
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + dto.getSubjectId()));
        Teacher teacher = dto.getTeacherId() != null
                ? teacherRepository.findById(dto.getTeacherId()).orElse(null) : null;

        Assessment assessment = Assessment.builder()
                .name(dto.getName()).type(dto.getType()).weight(dto.getWeight())
                .maxScore(dto.getMaxScore()).date(dto.getDate())
                .term(term).schoolClass(schoolClass).subject(subject).teacher(teacher)
                .build();
        return toDTO(assessmentRepository.save(assessment));
    }

    @Transactional
    public AssessmentDTO update(Long id, AssessmentDTO dto) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found: " + id));
        assessment.setName(dto.getName());
        assessment.setType(dto.getType());
        assessment.setWeight(dto.getWeight());
        assessment.setMaxScore(dto.getMaxScore());
        assessment.setDate(dto.getDate());
        return toDTO(assessmentRepository.save(assessment));
    }

    @Transactional
    public void delete(Long id) {
        if (!assessmentRepository.existsById(id)) throw new ResourceNotFoundException("Assessment not found: " + id);
        assessmentRepository.deleteById(id);
    }

    public List<GradeEntryDTO> getGradeEntries(Long assessmentId) {
        return gradeEntryRepository.findByAssessmentId(assessmentId)
                .stream().map(this::toEntryDTO).collect(Collectors.toList());
    }

    @Transactional
    public GradeEntryDTO saveGradeEntry(GradeEntryDTO dto) {
        Assessment assessment = assessmentRepository.findById(dto.getAssessmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found: " + dto.getAssessmentId()));
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + dto.getStudentId()));

        GradeEntry entry = gradeEntryRepository
                .findByAssessmentIdAndStudentId(dto.getAssessmentId(), dto.getStudentId())
                .orElse(GradeEntry.builder().assessment(assessment).student(student).build());

        entry.setScore(dto.getScore());
        entry.setRemarks(dto.getRemarks());
        return toEntryDTO(gradeEntryRepository.save(entry));
    }

    @Transactional
    public void deleteGradeEntry(Long id) {
        if (!gradeEntryRepository.existsById(id)) throw new ResourceNotFoundException("Grade entry not found: " + id);
        gradeEntryRepository.deleteById(id);
    }

    private AssessmentDTO toDTO(Assessment a) {
        return AssessmentDTO.builder()
                .id(a.getId()).name(a.getName()).type(a.getType())
                .weight(a.getWeight()).maxScore(a.getMaxScore()).date(a.getDate())
                .termId(a.getTerm().getId()).termName(a.getTerm().getName())
                .classId(a.getSchoolClass().getId()).className(a.getSchoolClass().getName())
                .subjectId(a.getSubject().getId()).subjectName(a.getSubject().getName())
                .teacherId(a.getTeacher() != null ? a.getTeacher().getId() : null)
                .teacherName(a.getTeacher() != null ? a.getTeacher().getFirstName() + " " + a.getTeacher().getLastName() : null)
                .build();
    }

    private GradeEntryDTO toEntryDTO(GradeEntry ge) {
        double maxScore = ge.getAssessment().getMaxScore();
        double percentage = maxScore > 0 ? (ge.getScore() / maxScore) * 100 : 0;
        String letter = gradingEngine.toLetter(percentage);
        return GradeEntryDTO.builder()
                .id(ge.getId())
                .assessmentId(ge.getAssessment().getId())
                .assessmentName(ge.getAssessment().getName())
                .assessmentWeight(ge.getAssessment().getWeight())
                .assessmentMaxScore(maxScore)
                .studentId(ge.getStudent().getId())
                .studentName(ge.getStudent().getFirstName() + " " + ge.getStudent().getLastName())
                .score(ge.getScore())
                .percentage(gradingEngine.round2(percentage))
                .letterGrade(letter)
                .remarks(ge.getRemarks())
                .build();
    }
}
