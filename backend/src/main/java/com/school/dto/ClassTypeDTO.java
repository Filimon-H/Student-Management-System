package com.school.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassTypeDTO {
    private Long id;

    @NotBlank(message = "Class type name is required")
    private String name;

    @NotBlank(message = "Class type code is required")
    @Size(max = 5, message = "Code must be at most 5 characters")
    private String code;
}
