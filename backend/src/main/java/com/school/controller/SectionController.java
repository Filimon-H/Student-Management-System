package com.school.controller;

import com.school.dto.SectionDTO;
import com.school.service.SectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;

    @GetMapping
    public ResponseEntity<List<SectionDTO>> getAll() {
        return ResponseEntity.ok(sectionService.getAll());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<SectionDTO>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(sectionService.getByClassId(classId));
    }

    @GetMapping("/class/{classId}/active")
    public ResponseEntity<List<SectionDTO>> getActiveByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(sectionService.getActiveByClassId(classId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SectionDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sectionService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<SectionDTO> create(@Valid @RequestBody SectionDTO dto) {
        return new ResponseEntity<>(sectionService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<SectionDTO> update(@PathVariable Long id, @Valid @RequestBody SectionDTO dto) {
        return ResponseEntity.ok(sectionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sectionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
