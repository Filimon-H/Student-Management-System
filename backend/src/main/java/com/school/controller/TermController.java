package com.school.controller;

import com.school.dto.TermDTO;
import com.school.service.TermService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/terms")
@RequiredArgsConstructor
public class TermController {

    private final TermService termService;

    @GetMapping
    public ResponseEntity<List<TermDTO>> getAll() {
        return ResponseEntity.ok(termService.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<TermDTO> getActive() {
        return ResponseEntity.ok(termService.getActiveTerm());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TermDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(termService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<TermDTO> create(@Valid @RequestBody TermDTO dto) {
        return new ResponseEntity<>(termService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<TermDTO> update(@PathVariable Long id, @Valid @RequestBody TermDTO dto) {
        return ResponseEntity.ok(termService.update(id, dto));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<TermDTO> activate(@PathVariable Long id) {
        return ResponseEntity.ok(termService.setActive(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        termService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
