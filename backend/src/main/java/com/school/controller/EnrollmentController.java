package com.school.controller;

import com.school.dto.EnrollmentDTO;
import com.school.entity.EnrollmentStatus;
import com.school.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping("/term/{termId}")
    public ResponseEntity<List<EnrollmentDTO>> getByTerm(@PathVariable Long termId) {
        return ResponseEntity.ok(enrollmentService.getByTerm(termId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentDTO>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getByStudent(studentId));
    }

    @GetMapping("/class/{classId}/term/{termId}")
    public ResponseEntity<List<EnrollmentDTO>> getByClassAndTerm(@PathVariable Long classId, @PathVariable Long termId) {
        return ResponseEntity.ok(enrollmentService.getByClassAndTerm(classId, termId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnrollmentDTO> enroll(@Valid @RequestBody EnrollmentDTO dto) {
        return new ResponseEntity<>(enrollmentService.enroll(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnrollmentDTO> updateStatus(@PathVariable Long id, @RequestParam EnrollmentStatus status) {
        return ResponseEntity.ok(enrollmentService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        enrollmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
