package com.school.service;

import com.school.dto.ClassTypeDTO;
import com.school.entity.ClassType;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.ClassTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassTypeService {

    private final ClassTypeRepository classTypeRepository;

    public List<ClassTypeDTO> getAll() {
        return classTypeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ClassTypeDTO getById(Long id) {
        return toDTO(classTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClassType not found with id: " + id)));
    }

    @Transactional
    public ClassTypeDTO create(ClassTypeDTO dto) {
        if (classTypeRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException("Class type code already exists");
        }
        if (classTypeRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Class type name already exists");
        }
        ClassType ct = ClassType.builder()
                .name(dto.getName())
                .code(dto.getCode().toUpperCase())
                .build();
        return toDTO(classTypeRepository.save(ct));
    }

    @Transactional
    public ClassTypeDTO update(Long id, ClassTypeDTO dto) {
        ClassType ct = classTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClassType not found with id: " + id));
        ct.setName(dto.getName());
        ct.setCode(dto.getCode().toUpperCase());
        return toDTO(classTypeRepository.save(ct));
    }

    @Transactional
    public void delete(Long id) {
        if (!classTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("ClassType not found with id: " + id);
        }
        classTypeRepository.deleteById(id);
    }

    private ClassTypeDTO toDTO(ClassType ct) {
        return ClassTypeDTO.builder()
                .id(ct.getId())
                .name(ct.getName())
                .code(ct.getCode())
                .build();
    }
}
