package com.school.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionDTO {
    private Long id;

    @NotBlank(message = "Section name is required")
    private String name;

    @NotNull(message = "Class ID is required")
    private Long classId;

    private String className;
    private Long teacherId;
    private String teacherName;
    private boolean active;
    private int studentCount;
}
