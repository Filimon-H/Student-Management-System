package com.school.controller;

import com.school.dto.DashboardDTO;
import com.school.service.SchoolClassService;
import com.school.service.StudentService;
import com.school.service.SubjectService;
import com.school.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final StudentService studentService;
    private final TeacherService teacherService;
    private final SchoolClassService schoolClassService;
    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboardStats() {
        DashboardDTO dashboard = DashboardDTO.builder()
                .totalStudents(studentService.getStudentCount())
                .totalTeachers(teacherService.getTeacherCount())
                .totalClasses(schoolClassService.getClassCount())
                .totalSubjects(subjectService.getSubjectCount())
                .build();
        return ResponseEntity.ok(dashboard);
    }
}
