package com.school.service;

import com.school.dto.SchoolClassDTO;
import com.school.dto.StudentDTO;
import com.school.entity.ClassType;
import com.school.entity.SchoolClass;
import com.school.entity.Teacher;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.ClassTypeRepository;
import com.school.repository.SchoolClassRepository;
import com.school.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolClassService {

    private final SchoolClassRepository schoolClassRepository;
    private final TeacherRepository teacherRepository;
    private final ClassTypeRepository classTypeRepository;

    public List<SchoolClassDTO> getAllClasses() {
        return schoolClassRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SchoolClassDTO getClassById(Long id) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));
        return toDetailDTO(schoolClass);
    }

    @Transactional
    public SchoolClassDTO createClass(SchoolClassDTO dto) {
        if (schoolClassRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Class name already exists");
        }

        SchoolClass schoolClass = SchoolClass.builder()
                .name(dto.getName())
                .grade(dto.getGrade())
                .section(dto.getSection())
                .build();

        if (dto.getClassTypeId() != null) {
            ClassType ct = classTypeRepository.findById(dto.getClassTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ClassType not found with id: " + dto.getClassTypeId()));
            schoolClass.setClassType(ct);
        }

        if (dto.getHomeroomTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(dto.getHomeroomTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + dto.getHomeroomTeacherId()));
            schoolClass.setHomeroomTeacher(teacher);
        }

        return toDTO(schoolClassRepository.save(schoolClass));
    }

    @Transactional
    public SchoolClassDTO updateClass(Long id, SchoolClassDTO dto) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));

        schoolClass.setName(dto.getName());
        schoolClass.setGrade(dto.getGrade());
        schoolClass.setSection(dto.getSection());

        if (dto.getClassTypeId() != null) {
            ClassType ct = classTypeRepository.findById(dto.getClassTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ClassType not found with id: " + dto.getClassTypeId()));
            schoolClass.setClassType(ct);
        } else {
            schoolClass.setClassType(null);
        }

        if (dto.getHomeroomTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(dto.getHomeroomTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + dto.getHomeroomTeacherId()));
            schoolClass.setHomeroomTeacher(teacher);
        } else {
            schoolClass.setHomeroomTeacher(null);
        }

        return toDTO(schoolClassRepository.save(schoolClass));
    }

    @Transactional
    public void deleteClass(Long id) {
        if (!schoolClassRepository.existsById(id)) {
            throw new ResourceNotFoundException("Class not found with id: " + id);
        }
        schoolClassRepository.deleteById(id);
    }

    public long getClassCount() {
        return schoolClassRepository.count();
    }

    private SchoolClassDTO toDTO(SchoolClass schoolClass) {
        return SchoolClassDTO.builder()
                .id(schoolClass.getId())
                .name(schoolClass.getName())
                .grade(schoolClass.getGrade())
                .section(schoolClass.getSection())
                .classTypeId(schoolClass.getClassType() != null ? schoolClass.getClassType().getId() : null)
                .classTypeName(schoolClass.getClassType() != null ? schoolClass.getClassType().getName() : null)
                .homeroomTeacherId(schoolClass.getHomeroomTeacher() != null ? schoolClass.getHomeroomTeacher().getId() : null)
                .homeroomTeacherName(schoolClass.getHomeroomTeacher() != null ?
                        schoolClass.getHomeroomTeacher().getFirstName() + " " + schoolClass.getHomeroomTeacher().getLastName() : null)
                .studentCount(schoolClass.getStudents() != null ? schoolClass.getStudents().size() : 0)
                .sectionCount(schoolClass.getSections() != null ? schoolClass.getSections().size() : 0)
                .build();
    }

    private SchoolClassDTO toDetailDTO(SchoolClass schoolClass) {
        SchoolClassDTO dto = toDTO(schoolClass);
        if (schoolClass.getStudents() != null) {
            dto.setStudents(schoolClass.getStudents().stream()
                    .map(s -> StudentDTO.builder()
                            .id(s.getId())
                            .firstName(s.getFirstName())
                            .lastName(s.getLastName())
                            .email(s.getEmail())
                            .build())
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
