package com.school.repository;

import com.school.entity.Attendance;
import com.school.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findBySchoolClassId(Long classId);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findBySchoolClassIdAndDate(Long classId, LocalDate date);
    List<Attendance> findBySchoolClassIdAndDateBetween(Long classId, LocalDate startDate, LocalDate endDate);
    boolean existsByStudentIdAndDate(Long studentId, LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.date BETWEEN :start AND :end")
    long countByStudentIdAndDateRange(@Param("studentId") Long studentId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = :status AND a.date BETWEEN :start AND :end")
    long countByStudentIdAndStatusAndDateRange(@Param("studentId") Long studentId, @Param("status") AttendanceStatus status, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
