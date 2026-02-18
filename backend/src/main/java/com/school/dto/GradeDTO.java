package com.school.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeDTO {
    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentName;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    private String subjectName;

    @NotNull(message = "Score is required")
    private Double score;

    private Double maxScore;
    private String examName;
    private LocalDate examDate;
    private String remarks;
    private Double percentage;
}
