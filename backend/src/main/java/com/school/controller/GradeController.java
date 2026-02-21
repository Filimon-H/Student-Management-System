package com.school.controller;

import com.school.dto.GradeDTO;
import com.school.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GradeDTO>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradeService.getGradesByStudent(studentId));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<GradeDTO>> getBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(gradeService.getGradesBySubject(subjectId));
    }

    @GetMapping("/student/{studentId}/average")
    public ResponseEntity<Double> getStudentAverage(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradeService.getStudentAverage(studentId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TEACHER')")
    public ResponseEntity<GradeDTO> createGrade(@Valid @RequestBody GradeDTO dto) {
        return new ResponseEntity<>(gradeService.createGrade(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TEACHER')")
    public ResponseEntity<GradeDTO> updateGrade(@PathVariable Long id, @Valid @RequestBody GradeDTO dto) {
        return ResponseEntity.ok(gradeService.updateGrade(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TEACHER')")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.noContent().build();
    }
}
