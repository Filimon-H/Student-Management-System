package com.school.dto;

import com.school.entity.AssessmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentDTO {
    private Long id;

    @NotBlank(message = "Assessment name is required")
    private String name;

    @NotNull(message = "Assessment type is required")
    private AssessmentType type;

    @NotNull(message = "Weight is required")
    private Double weight;

    @NotNull(message = "Max score is required")
    private Double maxScore;

    private LocalDate date;

    @NotNull(message = "Term ID is required")
    private Long termId;
    private String termName;

    @NotNull(message = "Class ID is required")
    private Long classId;
    private String className;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    private String subjectName;

    private Long teacherId;
    private String teacherName;
}
