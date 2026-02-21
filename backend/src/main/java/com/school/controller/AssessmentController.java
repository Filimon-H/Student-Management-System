package com.school.controller;

import com.school.dto.AssessmentDTO;
import com.school.dto.GradeEntryDTO;
import com.school.dto.ReportCardDTO;
import com.school.service.AssessmentService;
import com.school.service.ReportCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final ReportCardService reportCardService;

    @GetMapping("/term/{termId}/class/{classId}/subject/{subjectId}")
    public ResponseEntity<List<AssessmentDTO>> getByTermClassSubject(
            @PathVariable Long termId, @PathVariable Long classId, @PathVariable Long subjectId) {
        return ResponseEntity.ok(assessmentService.getByTermClassSubject(termId, classId, subjectId));
    }

    @GetMapping("/term/{termId}/class/{classId}")
    public ResponseEntity<List<AssessmentDTO>> getByTermAndClass(
            @PathVariable Long termId, @PathVariable Long classId) {
        return ResponseEntity.ok(assessmentService.getByTermAndClass(termId, classId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TEACHER')")
    public ResponseEntity<AssessmentDTO> create(@Valid @RequestBody AssessmentDTO dto) {
        return new ResponseEntity<>(assessmentService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TEACHER')")
    public ResponseEntity<AssessmentDTO> update(@PathVariable Long id, @Valid @RequestBody AssessmentDTO dto) {
        return ResponseEntity.ok(assessmentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TEACHER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assessmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{assessmentId}/grades")
    public ResponseEntity<List<GradeEntryDTO>> getGradeEntries(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.getGradeEntries(assessmentId));
    }

    @PostMapping("/grades")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TEACHER')")
    public ResponseEntity<GradeEntryDTO> saveGradeEntry(@Valid @RequestBody GradeEntryDTO dto) {
        return new ResponseEntity<>(assessmentService.saveGradeEntry(dto), HttpStatus.CREATED);
    }

    @DeleteMapping("/grades/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TEACHER')")
    public ResponseEntity<Void> deleteGradeEntry(@PathVariable Long id) {
        assessmentService.deleteGradeEntry(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/report-card/student/{studentId}/term/{termId}")
    public ResponseEntity<ReportCardDTO> getReportCard(
            @PathVariable Long studentId, @PathVariable Long termId) {
        return ResponseEntity.ok(reportCardService.generate(studentId, termId));
    }
}
