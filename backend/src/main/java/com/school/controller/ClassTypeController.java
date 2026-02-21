package com.school.controller;

import com.school.dto.ClassTypeDTO;
import com.school.service.ClassTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/class-types")
@RequiredArgsConstructor
public class ClassTypeController {

    private final ClassTypeService classTypeService;

    @GetMapping
    public ResponseEntity<List<ClassTypeDTO>> getAll() {
        return ResponseEntity.ok(classTypeService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassTypeDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(classTypeService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<ClassTypeDTO> create(@Valid @RequestBody ClassTypeDTO dto) {
        return new ResponseEntity<>(classTypeService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<ClassTypeDTO> update(@PathVariable Long id, @Valid @RequestBody ClassTypeDTO dto) {
        return ResponseEntity.ok(classTypeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
