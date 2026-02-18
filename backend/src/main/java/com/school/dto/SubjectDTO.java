package com.school.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectDTO {
    private Long id;

    @NotBlank(message = "Subject name is required")
    private String name;

    private String code;
    private String description;
    private Integer credits;
}
