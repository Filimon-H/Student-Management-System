package com.school.service;

import com.school.dto.GradeDTO;
import com.school.entity.Grade;
import com.school.entity.Student;
import com.school.entity.Subject;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.GradeRepository;
import com.school.repository.StudentRepository;
import com.school.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public List<GradeDTO> getGradesByStudent(Long studentId) {
        return gradeRepository.findByStudentId(studentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<GradeDTO> getGradesBySubject(Long subjectId) {
        return gradeRepository.findBySubjectId(subjectId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Double getStudentAverage(Long studentId) {
        Double avg = gradeRepository.calculateAverageByStudentId(studentId);
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }

    @Transactional
    public GradeDTO createGrade(GradeDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + dto.getSubjectId()));

        Grade grade = Grade.builder()
                .student(student)
                .subject(subject)
                .score(dto.getScore())
                .maxScore(dto.getMaxScore() != null ? dto.getMaxScore() : 100.0)
                .examName(dto.getExamName())
                .examDate(dto.getExamDate())
                .remarks(dto.getRemarks())
                .build();

        return toDTO(gradeRepository.save(grade));
    }

    @Transactional
    public GradeDTO updateGrade(Long id, GradeDTO dto) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade not found with id: " + id));

        grade.setScore(dto.getScore());
        grade.setMaxScore(dto.getMaxScore());
        grade.setExamName(dto.getExamName());
        grade.setExamDate(dto.getExamDate());
        grade.setRemarks(dto.getRemarks());

        return toDTO(gradeRepository.save(grade));
    }

    @Transactional
    public void deleteGrade(Long id) {
        if (!gradeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Grade not found with id: " + id);
        }
        gradeRepository.deleteById(id);
    }

    private GradeDTO toDTO(Grade grade) {
        double maxScore = grade.getMaxScore() != null ? grade.getMaxScore() : 100.0;
        double percentage = maxScore > 0 ? (grade.getScore() / maxScore) * 100 : 0;

        return GradeDTO.builder()
                .id(grade.getId())
                .studentId(grade.getStudent().getId())
                .studentName(grade.getStudent().getFirstName() + " " + grade.getStudent().getLastName())
                .subjectId(grade.getSubject().getId())
                .subjectName(grade.getSubject().getName())
                .score(grade.getScore())
                .maxScore(grade.getMaxScore())
                .examName(grade.getExamName())
                .examDate(grade.getExamDate())
                .remarks(grade.getRemarks())
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .build();
    }
}
