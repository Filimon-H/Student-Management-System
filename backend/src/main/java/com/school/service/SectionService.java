package com.school.service;

import com.school.dto.SectionDTO;
import com.school.entity.SchoolClass;
import com.school.entity.Section;
import com.school.entity.Teacher;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.SchoolClassRepository;
import com.school.repository.SectionRepository;
import com.school.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository sectionRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final TeacherRepository teacherRepository;

    public List<SectionDTO> getAll() {
        return sectionRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SectionDTO> getByClassId(Long classId) {
        return sectionRepository.findBySchoolClassId(classId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SectionDTO> getActiveByClassId(Long classId) {
        return sectionRepository.findBySchoolClassIdAndActiveTrue(classId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SectionDTO getById(Long id) {
        return toDTO(sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + id)));
    }

    @Transactional
    public SectionDTO create(SectionDTO dto) {
        SchoolClass sc = schoolClassRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + dto.getClassId()));

        if (sectionRepository.existsByNameAndSchoolClassId(dto.getName(), dto.getClassId())) {
            throw new RuntimeException("Section name already exists in this class");
        }

        Section section = Section.builder()
                .name(dto.getName())
                .schoolClass(sc)
                .active(true)
                .build();

        if (dto.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + dto.getTeacherId()));
            section.setTeacher(teacher);
        }

        return toDTO(sectionRepository.save(section));
    }

    @Transactional
    public SectionDTO update(Long id, SectionDTO dto) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + id));

        section.setName(dto.getName());
        section.setActive(dto.isActive());

        if (dto.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + dto.getTeacherId()));
            section.setTeacher(teacher);
        } else {
            section.setTeacher(null);
        }

        if (dto.getClassId() != null) {
            SchoolClass sc = schoolClassRepository.findById(dto.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + dto.getClassId()));
            section.setSchoolClass(sc);
        }

        return toDTO(sectionRepository.save(section));
    }

    @Transactional
    public void delete(Long id) {
        if (!sectionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Section not found with id: " + id);
        }
        sectionRepository.deleteById(id);
    }

    private SectionDTO toDTO(Section s) {
        return SectionDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .classId(s.getSchoolClass().getId())
                .className(s.getSchoolClass().getName())
                .teacherId(s.getTeacher() != null ? s.getTeacher().getId() : null)
                .teacherName(s.getTeacher() != null ?
                        s.getTeacher().getFirstName() + " " + s.getTeacher().getLastName() : null)
                .active(s.isActive())
                .studentCount(s.getStudents() != null ? s.getStudents().size() : 0)
                .build();
    }
}
