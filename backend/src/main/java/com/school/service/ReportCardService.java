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

        SchoolClass schoolClass = enrollment != null ? enrollment.getSchoolClass() : student.getSchoolClass();
        String className = schoolClass != null ? schoolClass.getName() : "N/A";
        String sectionName = student.getSection() != null ? student.getSection().getName() : "";
        String classTypeName = (schoolClass != null && schoolClass.getClassType() != null)
                ? schoolClass.getClassType().getName() : "";

        Long classId = schoolClass != null ? schoolClass.getId() : 0L;

        // Get this student's grade entries for the term
        List<GradeEntry> studentEntries = gradeEntryRepository.findByTermIdAndStudentId(termId, studentId);

        // Get ALL grade entries for the class+term (for computing positions & class avg)
        List<GradeEntry> allClassEntries = gradeEntryRepository.findByTermIdAndClassId(termId, classId);

        // Group this student's entries by subject
        Map<Long, List<GradeEntry>> bySubject = studentEntries.stream()
                .collect(Collectors.groupingBy(ge -> ge.getAssessment().getSubject().getId()));

        // Group all class entries by student -> subject for position calculations
        // studentId -> subjectId -> total
        Map<Long, Map<Long, Double>> allStudentSubjectTotals = new HashMap<>();
        // studentId -> grandTotal
        Map<Long, Double> allStudentGrandTotals = new HashMap<>();

        for (GradeEntry ge : allClassEntries) {
            Long sid = ge.getStudent().getId();
            Long subId = ge.getAssessment().getSubject().getId();
            allStudentSubjectTotals
                    .computeIfAbsent(sid, k -> new HashMap<>())
                    .merge(subId, ge.getScore(), Double::sum);
            allStudentGrandTotals.merge(sid, ge.getScore(), Double::sum);
        }

        int totalStudentsInClass = allStudentSubjectTotals.size();

        List<ReportCardDTO.SubjectMarkDTO> subjectMarks = new ArrayList<>();
        double grandTotal = 0;

        for (Map.Entry<Long, List<GradeEntry>> entry : bySubject.entrySet()) {
            List<GradeEntry> entries = entry.getValue();
            Subject subject = entries.get(0).getAssessment().getSubject();

            // Categorize assessments: CA-type vs EXAM-type
            double ca1 = 0, ca1Max = 0, ca2 = 0, ca2Max = 0, examScore = 0, examMax = 0;
            int caCount = 0;

            for (GradeEntry ge : entries) {
                Assessment a = ge.getAssessment();
                AssessmentType type = a.getType();

                if (type == AssessmentType.FINAL || type == AssessmentType.MIDTERM) {
                    examScore += ge.getScore();
                    examMax += a.getMaxScore();
                } else {
                    // CA types: QUIZ, ASSIGNMENT, PROJECT, OTHER
                    caCount++;
                    if (caCount == 1) {
                        ca1 = ge.getScore();
                        ca1Max = a.getMaxScore();
                    } else if (caCount == 2) {
                        ca2 = ge.getScore();
                        ca2Max = a.getMaxScore();
                    } else {
                        // Additional CAs go into ca2 bucket
                        ca2 += ge.getScore();
                        ca2Max += a.getMaxScore();
                    }
                }
            }

            double caTotal = ca1 + ca2;
            double caTotalMax = ca1Max + ca2Max;
            double subjectTotal = caTotal + examScore;

            grandTotal += subjectTotal;

            // Compute subject position
            Long subjectId = subject.getId();
            List<Double> allTotalsForSubject = allStudentSubjectTotals.values().stream()
                    .map(m -> m.getOrDefault(subjectId, 0.0))
                    .filter(t -> t > 0)
                    .sorted(Comparator.reverseOrder())
                    .collect(Collectors.toList());

            int subPos = 0;
            for (int i = 0; i < allTotalsForSubject.size(); i++) {
                if (allTotalsForSubject.get(i) <= subjectTotal) {
                    subPos = i + 1;
                    break;
                }
            }
            if (subPos == 0 && !allTotalsForSubject.isEmpty()) {
                subPos = allTotalsForSubject.size();
            }

            String grade = gradingEngine.toLetter(subjectTotal);
            String remarks = gradingEngine.toRemark(subjectTotal);

            subjectMarks.add(ReportCardDTO.SubjectMarkDTO.builder()
                    .subjectId(subjectId)
                    .subjectName(subject.getName())
                    .ca1(ca1)
                    .ca1Max(ca1Max)
                    .ca2(ca2)
                    .ca2Max(ca2Max)
                    .caTotal(caTotal)
                    .caTotalMax(caTotalMax)
                    .exam(examScore)
                    .examMax(examMax)
                    .total(subjectTotal)
                    .grade(grade)
                    .subjectPosition(subPos)
                    .remarks(remarks)
                    .build());
        }

        // Compute overall position
        List<Double> allGrandTotals = allStudentGrandTotals.values().stream()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        int position = 1;
        for (int i = 0; i < allGrandTotals.size(); i++) {
            if (allGrandTotals.get(i) <= grandTotal) {
                position = i + 1;
                break;
            }
        }

        // Compute averages
        int numSubjects = subjectMarks.size();
        double finalAverage = numSubjects > 0 ? gradingEngine.round1(grandTotal / numSubjects) : 0;

        double classAvg = 0;
        if (!allStudentGrandTotals.isEmpty()) {
            double sumOfAverages = allStudentGrandTotals.values().stream()
                    .mapToDouble(total -> {
                        // Each student's average = their total / number of subjects they took
                        // For simplicity, use the same numSubjects
                        return numSubjects > 0 ? total / numSubjects : 0;
                    }).sum();
            classAvg = gradingEngine.round1(sumOfAverages / allStudentGrandTotals.size());
        }

        double gpa = numSubjects > 0 ? gradingEngine.round2(
                subjectMarks.stream().mapToDouble(s -> gradingEngine.toGpaPoints(s.getGrade())).sum() / numSubjects
        ) : 0;

        String overallGrade = numSubjects > 0 ? gradingEngine.toLetter(finalAverage) : "N/A";

        // Parse term number from term name (e.g. "1st Term" -> 1)
        Integer termNumber = parseTermNumber(term.getName());

        return ReportCardDTO.builder()
                .studentId(studentId)
                .studentName(student.getFirstName() + " " + student.getLastName())
                .termName(term.getName())
                .academicYear(term.getAcademicYear())
                .className(className)
                .sectionName(sectionName)
                .classTypeName(classTypeName)
                .termNumber(termNumber)
                .totalScoresObtained(grandTotal)
                .finalAverage(finalAverage)
                .classAverage(classAvg)
                .position(position)
                .totalStudentsInClass(totalStudentsInClass)
                .overallGrade(overallGrade)
                .gpa(gpa)
                .subjects(subjectMarks)
                .build();
    }

    private Integer parseTermNumber(String termName) {
        if (termName == null) return 1;
        String lower = termName.toLowerCase();
        if (lower.contains("1") || lower.contains("first")) return 1;
        if (lower.contains("2") || lower.contains("second")) return 2;
        if (lower.contains("3") || lower.contains("third")) return 3;
        return 1;
    }
}
