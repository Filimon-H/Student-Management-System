package com.school.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherAssignmentDTO {
    private Long id;

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;
    private String teacherName;

    @NotNull(message = "Class ID is required")
    private Long classId;
    private String className;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    private String subjectName;

    @NotNull(message = "Term ID is required")
    private Long termId;
    private String termName;
}
