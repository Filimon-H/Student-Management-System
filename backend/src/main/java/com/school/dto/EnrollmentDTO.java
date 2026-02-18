package com.school.dto;

import com.school.entity.EnrollmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentDTO {
    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;
    private String studentName;

    @NotNull(message = "Class ID is required")
    private Long classId;
    private String className;

    @NotNull(message = "Term ID is required")
    private Long termId;
    private String termName;

    private EnrollmentStatus status;
}
