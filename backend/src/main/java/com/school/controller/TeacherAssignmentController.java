package com.school.controller;

import com.school.dto.TeacherAssignmentDTO;
import com.school.service.TeacherAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class TeacherAssignmentController {

    private final TeacherAssignmentService assignmentService;

    @GetMapping("/term/{termId}")
    public ResponseEntity<List<TeacherAssignmentDTO>> getByTerm(@PathVariable Long termId) {
        return ResponseEntity.ok(assignmentService.getByTerm(termId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<TeacherAssignmentDTO>> getByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(assignmentService.getByTeacher(teacherId));
    }

    @GetMapping("/teacher/{teacherId}/term/{termId}")
    public ResponseEntity<List<TeacherAssignmentDTO>> getByTeacherAndTerm(@PathVariable Long teacherId, @PathVariable Long termId) {
        return ResponseEntity.ok(assignmentService.getByTeacherAndTerm(teacherId, termId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherAssignmentDTO> assign(@Valid @RequestBody TeacherAssignmentDTO dto) {
        return new ResponseEntity<>(assignmentService.assign(dto), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
