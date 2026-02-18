package com.school.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportCardDTO {
    private Long studentId;
    private String studentName;
    private String termName;
    private String academicYear;
    private String className;
    private Double gpa;
    private String overallGrade;
    private List<SubjectReportDTO> subjects;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubjectReportDTO {
        private Long subjectId;
        private String subjectName;
        private Integer credits;
        private Double finalPercentage;
        private String letterGrade;
        private Double gpaPoints;
        private List<AssessmentScoreDTO> assessments;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssessmentScoreDTO {
        private String assessmentName;
        private String assessmentType;
        private Double score;
        private Double maxScore;
        private Double percentage;
        private Double weight;
    }
}
