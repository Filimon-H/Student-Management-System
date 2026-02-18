package com.school.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeEntryDTO {
    private Long id;

    @NotNull(message = "Assessment ID is required")
    private Long assessmentId;
    private String assessmentName;
    private Double assessmentWeight;
    private Double assessmentMaxScore;

    @NotNull(message = "Student ID is required")
    private Long studentId;
    private String studentName;

    @NotNull(message = "Score is required")
    private Double score;

    private Double percentage;
    private String letterGrade;
    private String remarks;
}
