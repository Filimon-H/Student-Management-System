package com.school.service;

import com.school.dto.SubjectDTO;
import com.school.entity.Subject;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SubjectDTO getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        return toDTO(subject);
    }

    @Transactional
    public SubjectDTO createSubject(SubjectDTO dto) {
        if (subjectRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Subject name already exists");
        }

        Subject subject = Subject.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .description(dto.getDescription())
                .credits(dto.getCredits() != null ? dto.getCredits() : 3)
                .build();

        return toDTO(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectDTO updateSubject(Long id, SubjectDTO dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        subject.setName(dto.getName());
        subject.setCode(dto.getCode());
        subject.setDescription(dto.getDescription());
        if (dto.getCredits() != null) subject.setCredits(dto.getCredits());

        return toDTO(subjectRepository.save(subject));
    }

    @Transactional
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Subject not found with id: " + id);
        }
        subjectRepository.deleteById(id);
    }

    public long getSubjectCount() {
        return subjectRepository.count();
    }

    private SubjectDTO toDTO(Subject subject) {
        return SubjectDTO.builder()
                .id(subject.getId())
                .name(subject.getName())
                .code(subject.getCode())
                .description(subject.getDescription())
                .credits(subject.getCredits())
                .build();
    }
}
