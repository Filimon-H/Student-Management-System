package com.school.service;

import com.school.dto.TermDTO;
import com.school.entity.Term;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.TermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TermService {

    private final TermRepository termRepository;

    public List<TermDTO> getAll() {
        return termRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TermDTO getById(Long id) {
        return toDTO(termRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Term not found: " + id)));
    }

    public TermDTO getActiveTerm() {
        return termRepository.findFirstByIsActiveTrueOrderByStartDateDesc()
                .map(this::toDTO)
                .orElse(null);
    }

    @Transactional
    public TermDTO create(TermDTO dto) {
        Term term = Term.builder()
                .name(dto.getName())
                .academicYear(dto.getAcademicYear())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : false)
                .build();
        return toDTO(termRepository.save(term));
    }

    @Transactional
    public TermDTO update(Long id, TermDTO dto) {
        Term term = termRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Term not found: " + id));
        term.setName(dto.getName());
        term.setAcademicYear(dto.getAcademicYear());
        term.setStartDate(dto.getStartDate());
        term.setEndDate(dto.getEndDate());
        term.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : false);
        return toDTO(termRepository.save(term));
    }

    @Transactional
    public TermDTO setActive(Long id) {
        termRepository.findAll().forEach(t -> { t.setIsActive(false); termRepository.save(t); });
        Term term = termRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Term not found: " + id));
        term.setIsActive(true);
        return toDTO(termRepository.save(term));
    }

    @Transactional
    public void delete(Long id) {
        if (!termRepository.existsById(id)) throw new ResourceNotFoundException("Term not found: " + id);
        termRepository.deleteById(id);
    }

    private TermDTO toDTO(Term t) {
        return TermDTO.builder()
                .id(t.getId())
                .name(t.getName())
                .academicYear(t.getAcademicYear())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .isActive(t.getIsActive())
                .build();
    }
}
