package com.school.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSummaryDTO {
    private Long studentId;
    private String studentName;
    private int totalDays;
    private int presentDays;
    private int absentDays;
    private int lateDays;
    private double attendanceRate;
    private boolean lowAttendanceAlert;
}
