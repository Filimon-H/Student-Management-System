package com.school.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolClassDTO {
    private Long id;

    @NotBlank(message = "Class name is required")
    private String name;

    private String grade;
    private String section;
    private Long homeroomTeacherId;
    private String homeroomTeacherName;
    private int studentCount;
    private List<StudentDTO> students;
}
