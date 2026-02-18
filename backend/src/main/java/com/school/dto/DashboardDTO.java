package com.school.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private long totalStudents;
    private long totalTeachers;
    private long totalClasses;
    private long totalSubjects;
}
