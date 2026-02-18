package com.school.service;

import com.school.dto.AttendanceDTO;
import com.school.dto.AttendanceSummaryDTO;
import com.school.entity.Attendance;
import com.school.entity.AttendanceStatus;
import com.school.entity.SchoolClass;
import com.school.entity.Student;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.AttendanceRepository;
import com.school.repository.SchoolClassRepository;
import com.school.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;

    public List<AttendanceDTO> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByClassAndDate(Long classId, LocalDate date) {
        return attendanceRepository.findBySchoolClassIdAndDate(classId, date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByStudentAndDateRange(Long studentId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO markAttendance(AttendanceDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        SchoolClass schoolClass = schoolClassRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + dto.getClassId()));

        if (attendanceRepository.existsByStudentIdAndDate(dto.getStudentId(), dto.getDate())) {
            throw new RuntimeException("Attendance already marked for this student on this date");
        }

        Attendance attendance = Attendance.builder()
                .student(student)
                .schoolClass(schoolClass)
                .date(dto.getDate())
                .status(dto.getStatus())
                .remarks(dto.getRemarks())
                .build();

        return toDTO(attendanceRepository.save(attendance));
    }

    @Transactional
    public List<AttendanceDTO> markBulkAttendance(List<AttendanceDTO> dtos) {
        return dtos.stream()
                .map(this::markAttendance)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO updateAttendance(Long id, AttendanceDTO dto) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));

        attendance.setStatus(dto.getStatus());
        attendance.setRemarks(dto.getRemarks());

        return toDTO(attendanceRepository.save(attendance));
    }

    public AttendanceSummaryDTO getStudentSummary(Long studentId, LocalDate startDate, LocalDate endDate) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        long total = attendanceRepository.countByStudentIdAndDateRange(studentId, startDate, endDate);
        long present = attendanceRepository.countByStudentIdAndStatusAndDateRange(studentId, AttendanceStatus.PRESENT, startDate, endDate);
        long absent = attendanceRepository.countByStudentIdAndStatusAndDateRange(studentId, AttendanceStatus.ABSENT, startDate, endDate);
        long late = attendanceRepository.countByStudentIdAndStatusAndDateRange(studentId, AttendanceStatus.LATE, startDate, endDate);
        double rate = total > 0 ? Math.round((present * 100.0 / total) * 100.0) / 100.0 : 0.0;
        return AttendanceSummaryDTO.builder()
                .studentId(studentId)
                .studentName(student.getFirstName() + " " + student.getLastName())
                .totalDays((int) total)
                .presentDays((int) present)
                .absentDays((int) absent)
                .lateDays((int) late)
                .attendanceRate(rate)
                .lowAttendanceAlert(rate < 75.0 && total > 0)
                .build();
    }

    public List<AttendanceSummaryDTO> getClassMonthlySummary(Long classId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        List<Student> students = studentRepository.findBySchoolClassId(classId);
        return students.stream()
                .map(s -> getStudentSummary(s.getId(), start, end))
                .collect(Collectors.toList());
    }

    public List<AttendanceSummaryDTO> getLowAttendanceAlerts(Long classId, int year, int month) {
        return getClassMonthlySummary(classId, year, month).stream()
                .filter(AttendanceSummaryDTO::isLowAttendanceAlert)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getByClassAndDateRange(Long classId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findBySchoolClassIdAndDateBetween(classId, startDate, endDate).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public byte[] exportClassAttendanceCsv(Long classId, int year, int month) {
        List<AttendanceSummaryDTO> summaries = getClassMonthlySummary(classId, year, month);
        StringBuilder sb = new StringBuilder();
        sb.append("Student Name,Total Days,Present,Absent,Late,Attendance Rate (%),Low Attendance Alert\n");
        for (AttendanceSummaryDTO s : summaries) {
            sb.append(String.format("\"%s\",%d,%d,%d,%d,%.2f,%s\n",
                    s.getStudentName(), s.getTotalDays(), s.getPresentDays(),
                    s.getAbsentDays(), s.getLateDays(), s.getAttendanceRate(),
                    s.isLowAttendanceAlert() ? "YES" : "NO"));
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private AttendanceDTO toDTO(Attendance attendance) {
        return AttendanceDTO.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudent().getId())
                .studentName(attendance.getStudent().getFirstName() + " " + attendance.getStudent().getLastName())
                .classId(attendance.getSchoolClass().getId())
                .className(attendance.getSchoolClass().getName())
                .date(attendance.getDate())
                .status(attendance.getStatus())
                .remarks(attendance.getRemarks())
                .build();
    }
}
