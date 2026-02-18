package com.school.dto;

import com.school.entity.AttendanceStatus;
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
public class AttendanceDTO {
    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentName;

    @NotNull(message = "Class ID is required")
    private Long classId;

    private String className;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    private String remarks;
}
