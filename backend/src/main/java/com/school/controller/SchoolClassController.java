package com.school.controller;

import com.school.dto.SchoolClassDTO;
import com.school.service.SchoolClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class SchoolClassController {

    private final SchoolClassService schoolClassService;

    @GetMapping
    public ResponseEntity<List<SchoolClassDTO>> getAllClasses() {
        return ResponseEntity.ok(schoolClassService.getAllClasses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchoolClassDTO> getClassById(@PathVariable Long id) {
        return ResponseEntity.ok(schoolClassService.getClassById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolClassDTO> createClass(@Valid @RequestBody SchoolClassDTO dto) {
        return new ResponseEntity<>(schoolClassService.createClass(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolClassDTO> updateClass(@PathVariable Long id, @Valid @RequestBody SchoolClassDTO dto) {
        return ResponseEntity.ok(schoolClassService.updateClass(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        schoolClassService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }
}
