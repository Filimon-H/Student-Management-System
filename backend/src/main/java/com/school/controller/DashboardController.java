package com.school.controller;

import com.school.dto.DashboardDTO;
import com.school.dto.StudentDTO;
import com.school.entity.AttendanceStatus;
import com.school.repository.AttendanceRepository;
import com.school.repository.AssessmentRepository;
import com.school.repository.EnrollmentRepository;
import com.school.repository.StudentRepository;
import com.school.service.SchoolClassService;
import com.school.service.StudentService;
import com.school.service.SubjectService;
import com.school.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final StudentService studentService;
    private final TeacherService teacherService;
    private final SchoolClassService schoolClassService;
    private final SubjectService subjectService;
    private final AttendanceRepository attendanceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentRepository assessmentRepository;
    private final StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboardStats() {
        // Basic counts
        long totalStudents = studentService.getStudentCount();
        long totalTeachers = teacherService.getTeacherCount();
        long totalClasses = schoolClassService.getClassCount();
        long totalSubjects = subjectService.getSubjectCount();
        long totalEnrollments = enrollmentRepository.count();
        long totalAssessments = assessmentRepository.count();

        // Overall attendance rate (last 30 days)
        LocalDate now = LocalDate.now();
        LocalDate thirtyDaysAgo = now.minusDays(30);
        long totalRecords = attendanceRepository.countByDateRange(thirtyDaysAgo, now);
        long presentRecords = attendanceRepository.countByStatusAndDateRange(AttendanceStatus.PRESENT, thirtyDaysAgo, now);
        double attendanceRate = totalRecords > 0 ? Math.round((presentRecords * 1000.0 / totalRecords)) / 10.0 : 0.0;

        // Weekly attendance (Mon-Sun of current week)
        LocalDate monday = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<Double> weeklyAttendance = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate day = monday.plusDays(i);
            long dayTotal = attendanceRepository.countByDate(day);
            long dayPresent = attendanceRepository.countByDateAndStatus(day, AttendanceStatus.PRESENT);
            double dayRate = dayTotal > 0 ? Math.round((dayPresent * 1000.0 / dayTotal)) / 10.0 : 0.0;
            weeklyAttendance.add(dayRate);
        }

        // Recent students (last 5)
        List<DashboardDTO.RecentStudentDTO> recentStudents = studentRepository.findAll()
                .stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .limit(5)
                .map(s -> DashboardDTO.RecentStudentDTO.builder()
                        .id(s.getId())
                        .name(s.getFirstName() + " " + s.getLastName())
                        .className(s.getSchoolClass() != null ? s.getSchoolClass().getName() : "Unassigned")
                        .email(s.getEmail())
                        .build())
                .collect(Collectors.toList());

        DashboardDTO dashboard = DashboardDTO.builder()
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .totalClasses(totalClasses)
                .totalSubjects(totalSubjects)
                .attendanceRate(attendanceRate)
                .totalEnrollments(totalEnrollments)
                .totalAssessments(totalAssessments)
                .recentStudents(recentStudents)
                .weeklyAttendance(weeklyAttendance)
                .build();
        return ResponseEntity.ok(dashboard);
    }
}
