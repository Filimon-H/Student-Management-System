package com.school.service;

import com.school.dto.ReportCardDTO;
import com.school.entity.*;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportCardService {

    private final StudentRepository studentRepository;
    private final TermRepository termRepository;
    private final AssessmentRepository assessmentRepository;
    private final GradeEntryRepository gradeEntryRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GradingEngine gradingEngine;

    public ReportCardDTO generate(Long studentId, Long termId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        Term term = termRepository.findById(termId)
                .orElseThrow(() -> new ResourceNotFoundException("Term not found: " + termId));

        Enrollment enrollment = enrollmentRepository.findByStudentId(studentId).stream()
                .filter(e -> e.getTerm().getId().equals(termId))
                .findFirst().orElse(null);

        String className = enrollment != null ? enrollment.getSchoolClass().getName() : "N/A";

        List<GradeEntry> allEntries = gradeEntryRepository.findByTermIdAndStudentId(termId, studentId);

        Map<Long, List<GradeEntry>> bySubject = allEntries.stream()
                .collect(Collectors.groupingBy(ge -> ge.getAssessment().getSubject().getId()));

        List<ReportCardDTO.SubjectReportDTO> subjectReports = new ArrayList<>();
        double totalWeightedPoints = 0;
        int totalCredits = 0;

        for (Map.Entry<Long, List<GradeEntry>> entry : bySubject.entrySet()) {
            List<GradeEntry> entries = entry.getValue();
            Subject subject = entries.get(0).getAssessment().getSubject();
            int credits = subject.getCredits() != null ? subject.getCredits() : 3;

            List<Assessment> assessments = assessmentRepository
                    .findByTermIdAndSchoolClassIdAndSubjectId(termId,
                            enrollment != null ? enrollment.getSchoolClass().getId() : 0L,
                            subject.getId());

            double totalWeight = assessments.stream().mapToDouble(Assessment::getWeight).sum();

            List<ReportCardDTO.AssessmentScoreDTO> assessmentScores = new ArrayList<>();
            double weightedPercent = 0;

            for (GradeEntry ge : entries) {
                Assessment a = ge.getAssessment();
                double maxScore = a.getMaxScore();
                double pct = maxScore > 0 ? (ge.getScore() / maxScore) * 100 : 0;
                double effectiveWeight = totalWeight > 0 ? a.getWeight() / totalWeight : 1.0 / entries.size();
                weightedPercent += pct * effectiveWeight;

                assessmentScores.add(ReportCardDTO.AssessmentScoreDTO.builder()
                        .assessmentName(a.getName())
                        .assessmentType(a.getType().name())
                        .score(ge.getScore())
                        .maxScore(maxScore)
                        .percentage(gradingEngine.round2(pct))
                        .weight(a.getWeight())
                        .build());
            }

            double finalPct = gradingEngine.round2(weightedPercent);
            String letter = gradingEngine.toLetter(finalPct);
            double gpaPoints = gradingEngine.toGpaPoints(letter);

            totalWeightedPoints += gpaPoints * credits;
            totalCredits += credits;

            subjectReports.add(ReportCardDTO.SubjectReportDTO.builder()
                    .subjectId(subject.getId())
                    .subjectName(subject.getName())
                    .credits(credits)
                    .finalPercentage(finalPct)
                    .letterGrade(letter)
                    .gpaPoints(gpaPoints)
                    .assessments(assessmentScores)
                    .build());
        }

        double gpa = totalCredits > 0 ? gradingEngine.round2(totalWeightedPoints / totalCredits) : 0.0;
        String overallLetter = subjectReports.isEmpty() ? "N/A" :
                gradingEngine.toLetter(subjectReports.stream()
                        .mapToDouble(ReportCardDTO.SubjectReportDTO::getFinalPercentage).average().orElse(0));

        return ReportCardDTO.builder()
                .studentId(studentId)
                .studentName(student.getFirstName() + " " + student.getLastName())
                .termName(term.getName())
                .academicYear(term.getAcademicYear())
                .className(className)
                .gpa(gpa)
                .overallGrade(overallLetter)
                .subjects(subjectReports)
                .build();
    }
}
