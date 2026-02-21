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
    private String sectionName;
    private String classTypeName;
    private Integer termNumber;

    private Double totalScoresObtained;
    private Double finalAverage;
    private Double classAverage;
    private Integer position;
    private Integer totalStudentsInClass;
    private String overallGrade;
    private Double gpa;

    private List<SubjectMarkDTO> subjects;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubjectMarkDTO {
        private Long subjectId;
        private String subjectName;
        private Double ca1;
        private Double ca1Max;
        private Double ca2;
        private Double ca2Max;
        private Double caTotal;
        private Double caTotalMax;
        private Double exam;
        private Double examMax;
        private Double total;
        private String grade;
        private Integer subjectPosition;
        private String remarks;
    }
}
