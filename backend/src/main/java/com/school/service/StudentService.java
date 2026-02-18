package com.school.service;

import com.school.dto.StudentDTO;
import com.school.entity.SchoolClass;
import com.school.entity.Student;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.SchoolClassRepository;
import com.school.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;

    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return toDTO(student);
    }

    public List<StudentDTO> searchStudents(String query) {
        return studentRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> getStudentsByClassId(Long classId) {
        return studentRepository.findBySchoolClassId(classId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentDTO createStudent(StudentDTO dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        Student student = Student.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .dateOfBirth(dto.getDateOfBirth())
                .address(dto.getAddress())
                .guardianName(dto.getGuardianName())
                .guardianPhone(dto.getGuardianPhone())
                .build();

        if (dto.getClassId() != null) {
            SchoolClass schoolClass = schoolClassRepository.findById(dto.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + dto.getClassId()));
            student.setSchoolClass(schoolClass);
        }

        return toDTO(studentRepository.save(student));
    }

    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setAddress(dto.getAddress());
        student.setGuardianName(dto.getGuardianName());
        student.setGuardianPhone(dto.getGuardianPhone());

        if (dto.getClassId() != null) {
            SchoolClass schoolClass = schoolClassRepository.findById(dto.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + dto.getClassId()));
            student.setSchoolClass(schoolClass);
        } else {
            student.setSchoolClass(null);
        }

        return toDTO(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    public long getStudentCount() {
        return studentRepository.count();
    }

    private StudentDTO toDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .dateOfBirth(student.getDateOfBirth())
                .address(student.getAddress())
                .guardianName(student.getGuardianName())
                .guardianPhone(student.getGuardianPhone())
                .classId(student.getSchoolClass() != null ? student.getSchoolClass().getId() : null)
                .className(student.getSchoolClass() != null ? student.getSchoolClass().getName() : null)
                .build();
    }
}
