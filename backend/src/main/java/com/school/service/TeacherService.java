package com.school.service;

import com.school.dto.TeacherDTO;
import com.school.entity.Subject;
import com.school.entity.Teacher;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.SubjectRepository;
import com.school.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;

    public List<TeacherDTO> getAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TeacherDTO getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
        return toDTO(teacher);
    }

    @Transactional
    public TeacherDTO createTeacher(TeacherDTO dto) {
        if (teacherRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        Teacher teacher = Teacher.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .specialization(dto.getSpecialization())
                .subjects(new HashSet<>())
                .build();

        if (dto.getSubjectIds() != null && !dto.getSubjectIds().isEmpty()) {
            Set<Subject> subjects = new HashSet<>(subjectRepository.findAllById(dto.getSubjectIds()));
            teacher.setSubjects(subjects);
        }

        return toDTO(teacherRepository.save(teacher));
    }

    @Transactional
    public TeacherDTO updateTeacher(Long id, TeacherDTO dto) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));

        teacher.setFirstName(dto.getFirstName());
        teacher.setLastName(dto.getLastName());
        teacher.setEmail(dto.getEmail());
        teacher.setPhone(dto.getPhone());
        teacher.setSpecialization(dto.getSpecialization());

        if (dto.getSubjectIds() != null) {
            Set<Subject> subjects = new HashSet<>(subjectRepository.findAllById(dto.getSubjectIds()));
            teacher.setSubjects(subjects);
        }

        return toDTO(teacherRepository.save(teacher));
    }

    @Transactional
    public void deleteTeacher(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new ResourceNotFoundException("Teacher not found with id: " + id);
        }
        teacherRepository.deleteById(id);
    }

    public long getTeacherCount() {
        return teacherRepository.count();
    }

    private TeacherDTO toDTO(Teacher teacher) {
        return TeacherDTO.builder()
                .id(teacher.getId())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .email(teacher.getEmail())
                .phone(teacher.getPhone())
                .specialization(teacher.getSpecialization())
                .subjectIds(teacher.getSubjects().stream().map(Subject::getId).collect(Collectors.toSet()))
                .subjectNames(teacher.getSubjects().stream().map(Subject::getName).collect(Collectors.toSet()))
                .build();
    }
}
