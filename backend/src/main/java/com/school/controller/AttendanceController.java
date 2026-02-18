package com.school.controller;

import com.school.dto.AttendanceDTO;
import com.school.dto.AttendanceSummaryDTO;
import com.school.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDTO>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<AttendanceDTO>> getByClassAndDate(
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByClassAndDate(classId, date));
    }

    @GetMapping("/student/{studentId}/range")
    public ResponseEntity<List<AttendanceDTO>> getByStudentAndDateRange(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudentAndDateRange(studentId, startDate, endDate));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<AttendanceDTO> markAttendance(@Valid @RequestBody AttendanceDTO dto) {
        return new ResponseEntity<>(attendanceService.markAttendance(dto), HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<AttendanceDTO>> markBulkAttendance(@Valid @RequestBody List<AttendanceDTO> dtos) {
        return new ResponseEntity<>(attendanceService.markBulkAttendance(dtos), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<AttendanceDTO> updateAttendance(@PathVariable Long id, @Valid @RequestBody AttendanceDTO dto) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, dto));
    }

    @GetMapping("/class/{classId}/monthly")
    public ResponseEntity<List<AttendanceSummaryDTO>> getMonthlySummary(
            @PathVariable Long classId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(attendanceService.getClassMonthlySummary(classId, year, month));
    }

    @GetMapping("/class/{classId}/alerts")
    public ResponseEntity<List<AttendanceSummaryDTO>> getLowAttendanceAlerts(
            @PathVariable Long classId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(attendanceService.getLowAttendanceAlerts(classId, year, month));
    }

    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<AttendanceSummaryDTO> getStudentSummary(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getStudentSummary(studentId, startDate, endDate));
    }

    @GetMapping("/class/{classId}/range")
    public ResponseEntity<List<AttendanceDTO>> getByClassAndDateRange(
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getByClassAndDateRange(classId, startDate, endDate));
    }

    @GetMapping("/class/{classId}/export")
    public ResponseEntity<byte[]> exportClassAttendanceCsv(
            @PathVariable Long classId,
            @RequestParam int year,
            @RequestParam int month) {
        byte[] csv = attendanceService.exportClassAttendanceCsv(classId, year, month);
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=attendance_" + year + "_" + month + ".csv")
                .body(csv);
    }
}
