package com.school.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private long totalStudents;
    private long totalTeachers;
    private long totalClasses;
    private long totalSubjects;
    private double attendanceRate;
    private long totalEnrollments;
    private long totalAssessments;
    private List<RecentStudentDTO> recentStudents;
    private List<Double> weeklyAttendance;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentStudentDTO {
        private Long id;
        private String name;
        private String className;
        private String email;
    }
}
