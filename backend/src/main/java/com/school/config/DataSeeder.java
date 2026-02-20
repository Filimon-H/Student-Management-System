package com.school.config;

import com.school.entity.*;
import com.school.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final TermRepository termRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final AssessmentRepository assessmentRepository;
    private final GradeEntryRepository gradeEntryRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }
        log.info("Seeding demo data...");

        // --- Users ---
        User adminUser = userRepository.save(User.builder()
                .firstName("Admin").lastName("User")
                .email("admin@school.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN).build());

        User teacherUser1 = userRepository.save(User.builder()
                .firstName("Thomas").lastName("Johnson")
                .email("t.johnson@school.com")
                .password(passwordEncoder.encode("teacher123"))
                .role(Role.TEACHER).build());

        User teacherUser2 = userRepository.save(User.builder()
                .firstName("Sarah").lastName("Williams")
                .email("s.williams@school.com")
                .password(passwordEncoder.encode("teacher123"))
                .role(Role.TEACHER).build());

        User teacherUser3 = userRepository.save(User.builder()
                .firstName("Michael").lastName("Davis")
                .email("m.davis@school.com")
                .password(passwordEncoder.encode("teacher123"))
                .role(Role.TEACHER).build());

        User studentUser1 = userRepository.save(User.builder()
                .firstName("James").lastName("Smith")
                .email("j.smith@school.com")
                .password(passwordEncoder.encode("student123"))
                .role(Role.STUDENT).build());

        User studentUser2 = userRepository.save(User.builder()
                .firstName("Elena").lastName("Rodriguez")
                .email("e.rodriguez@school.com")
                .password(passwordEncoder.encode("student123"))
                .role(Role.STUDENT).build());

        User studentUser3 = userRepository.save(User.builder()
                .firstName("Alex").lastName("Chen")
                .email("a.chen@school.com")
                .password(passwordEncoder.encode("student123"))
                .role(Role.STUDENT).build());

        User studentUser4 = userRepository.save(User.builder()
                .firstName("Kemi").lastName("Okafor")
                .email("k.okafor@school.com")
                .password(passwordEncoder.encode("student123"))
                .role(Role.STUDENT).build());

        User studentUser5 = userRepository.save(User.builder()
                .firstName("Lucia").lastName("Martinez")
                .email("l.martinez@school.com")
                .password(passwordEncoder.encode("student123"))
                .role(Role.STUDENT).build());

        // --- Subjects ---
        Subject math = subjectRepository.save(Subject.builder().name("Mathematics").code("MATH101").description("Algebra, Geometry, Calculus").credits(4).build());
        Subject english = subjectRepository.save(Subject.builder().name("English").code("ENG101").description("Literature and Composition").credits(3).build());
        Subject physics = subjectRepository.save(Subject.builder().name("Physics").code("PHY101").description("Mechanics, Thermodynamics, Optics").credits(4).build());
        Subject chemistry = subjectRepository.save(Subject.builder().name("Chemistry").code("CHEM101").description("Organic and Inorganic Chemistry").credits(3).build());
        Subject biology = subjectRepository.save(Subject.builder().name("Biology").code("BIO101").description("Cell Biology, Genetics, Ecology").credits(3).build());

        // --- Teachers ---
        Teacher teacher1 = teacherRepository.save(Teacher.builder()
                .firstName("Thomas").lastName("Johnson")
                .email("t.johnson@school.com").phone("+1-555-0101")
                .specialization("Mathematics & Physics")
                .subjects(new HashSet<>(Arrays.asList(math, physics)))
                .user(teacherUser1).build());

        Teacher teacher2 = teacherRepository.save(Teacher.builder()
                .firstName("Sarah").lastName("Williams")
                .email("s.williams@school.com").phone("+1-555-0102")
                .specialization("English & Biology")
                .subjects(new HashSet<>(Arrays.asList(english, biology)))
                .user(teacherUser2).build());

        Teacher teacher3 = teacherRepository.save(Teacher.builder()
                .firstName("Michael").lastName("Davis")
                .email("m.davis@school.com").phone("+1-555-0103")
                .specialization("Chemistry")
                .subjects(new HashSet<>(Collections.singletonList(chemistry)))
                .user(teacherUser3).build());

        // --- Classes ---
        SchoolClass class8A = schoolClassRepository.save(SchoolClass.builder()
                .name("Grade 8A").grade("8").section("A").homeroomTeacher(teacher1).build());
        SchoolClass class9A = schoolClassRepository.save(SchoolClass.builder()
                .name("Grade 9A").grade("9").section("A").homeroomTeacher(teacher2).build());
        SchoolClass class10A = schoolClassRepository.save(SchoolClass.builder()
                .name("Grade 10A").grade("10").section("A").homeroomTeacher(teacher3).build());

        // --- Students ---
        Student student1 = studentRepository.save(Student.builder()
                .firstName("James").lastName("Smith")
                .email("j.smith@school.com").dateOfBirth(LocalDate.of(2010, 3, 15))
                .address("123 Oak Street").guardianName("Robert Smith").guardianPhone("+1-555-1001")
                .schoolClass(class10A).user(studentUser1).build());

        Student student2 = studentRepository.save(Student.builder()
                .firstName("Elena").lastName("Rodriguez")
                .email("e.rodriguez@school.com").dateOfBirth(LocalDate.of(2011, 7, 22))
                .address("456 Pine Avenue").guardianName("Maria Rodriguez").guardianPhone("+1-555-1002")
                .schoolClass(class9A).user(studentUser2).build());

        Student student3 = studentRepository.save(Student.builder()
                .firstName("Alex").lastName("Chen")
                .email("a.chen@school.com").dateOfBirth(LocalDate.of(2010, 11, 8))
                .address("789 Maple Drive").guardianName("Wei Chen").guardianPhone("+1-555-1003")
                .schoolClass(class10A).user(studentUser3).build());

        Student student4 = studentRepository.save(Student.builder()
                .firstName("Kemi").lastName("Okafor")
                .email("k.okafor@school.com").dateOfBirth(LocalDate.of(2012, 1, 30))
                .address("321 Elm Road").guardianName("Chidi Okafor").guardianPhone("+1-555-1004")
                .schoolClass(class8A).user(studentUser4).build());

        Student student5 = studentRepository.save(Student.builder()
                .firstName("Lucia").lastName("Martinez")
                .email("l.martinez@school.com").dateOfBirth(LocalDate.of(2011, 5, 12))
                .address("654 Birch Lane").guardianName("Carlos Martinez").guardianPhone("+1-555-1005")
                .schoolClass(class9A).user(studentUser5).build());

        // --- Term ---
        Term term = termRepository.save(Term.builder()
                .name("Semester 1").academicYear("2024-2025")
                .startDate(LocalDate.of(2024, 9, 1)).endDate(LocalDate.of(2025, 1, 31))
                .isActive(true).build());

        // --- Enrollments ---
        enrollmentRepository.save(Enrollment.builder().student(student1).schoolClass(class10A).term(term).status(EnrollmentStatus.ACTIVE).build());
        enrollmentRepository.save(Enrollment.builder().student(student2).schoolClass(class9A).term(term).status(EnrollmentStatus.ACTIVE).build());
        enrollmentRepository.save(Enrollment.builder().student(student3).schoolClass(class10A).term(term).status(EnrollmentStatus.ACTIVE).build());
        enrollmentRepository.save(Enrollment.builder().student(student4).schoolClass(class8A).term(term).status(EnrollmentStatus.ACTIVE).build());
        enrollmentRepository.save(Enrollment.builder().student(student5).schoolClass(class9A).term(term).status(EnrollmentStatus.ACTIVE).build());

        // --- Teacher Assignments ---
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher1).schoolClass(class10A).subject(math).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher1).schoolClass(class10A).subject(physics).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher1).schoolClass(class8A).subject(math).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher2).schoolClass(class9A).subject(english).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher2).schoolClass(class9A).subject(biology).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher2).schoolClass(class8A).subject(english).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher3).schoolClass(class10A).subject(chemistry).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher3).schoolClass(class9A).subject(chemistry).term(term).build());

        // --- Assessments & Grades for Grade 10A Math ---
        Assessment midtermMath10 = assessmentRepository.save(Assessment.builder()
                .name("Midterm Exam").type(AssessmentType.MIDTERM).weight(30.0).maxScore(100.0)
                .date(LocalDate.of(2024, 10, 15)).term(term).schoolClass(class10A).subject(math).teacher(teacher1).build());
        Assessment quizMath10 = assessmentRepository.save(Assessment.builder()
                .name("Quiz 1").type(AssessmentType.QUIZ).weight(10.0).maxScore(50.0)
                .date(LocalDate.of(2024, 9, 20)).term(term).schoolClass(class10A).subject(math).teacher(teacher1).build());
        Assessment finalMath10 = assessmentRepository.save(Assessment.builder()
                .name("Final Exam").type(AssessmentType.FINAL).weight(40.0).maxScore(100.0)
                .date(LocalDate.of(2025, 1, 10)).term(term).schoolClass(class10A).subject(math).teacher(teacher1).build());
        Assessment assignmentMath10 = assessmentRepository.save(Assessment.builder()
                .name("Homework Set").type(AssessmentType.ASSIGNMENT).weight(20.0).maxScore(100.0)
                .term(term).schoolClass(class10A).subject(math).teacher(teacher1).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(midtermMath10).student(student1).score(85.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(midtermMath10).student(student3).score(72.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(quizMath10).student(student1).score(45.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(quizMath10).student(student3).score(38.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(finalMath10).student(student1).score(90.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(finalMath10).student(student3).score(68.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(assignmentMath10).student(student1).score(92.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(assignmentMath10).student(student3).score(80.0).build());

        // --- Assessments & Grades for Grade 10A Physics ---
        Assessment midtermPhys10 = assessmentRepository.save(Assessment.builder()
                .name("Midterm Exam").type(AssessmentType.MIDTERM).weight(30.0).maxScore(100.0)
                .date(LocalDate.of(2024, 10, 18)).term(term).schoolClass(class10A).subject(physics).teacher(teacher1).build());
        Assessment finalPhys10 = assessmentRepository.save(Assessment.builder()
                .name("Final Exam").type(AssessmentType.FINAL).weight(40.0).maxScore(100.0)
                .date(LocalDate.of(2025, 1, 12)).term(term).schoolClass(class10A).subject(physics).teacher(teacher1).build());
        Assessment labPhys10 = assessmentRepository.save(Assessment.builder()
                .name("Lab Report").type(AssessmentType.PROJECT).weight(30.0).maxScore(100.0)
                .term(term).schoolClass(class10A).subject(physics).teacher(teacher1).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(midtermPhys10).student(student1).score(78.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(midtermPhys10).student(student3).score(65.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(finalPhys10).student(student1).score(82.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(finalPhys10).student(student3).score(70.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(labPhys10).student(student1).score(88.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(labPhys10).student(student3).score(75.0).build());

        // --- Assessments & Grades for Grade 9A English ---
        Assessment midtermEng9 = assessmentRepository.save(Assessment.builder()
                .name("Midterm Essay").type(AssessmentType.MIDTERM).weight(30.0).maxScore(100.0)
                .date(LocalDate.of(2024, 10, 12)).term(term).schoolClass(class9A).subject(english).teacher(teacher2).build());
        Assessment finalEng9 = assessmentRepository.save(Assessment.builder()
                .name("Final Exam").type(AssessmentType.FINAL).weight(40.0).maxScore(100.0)
                .date(LocalDate.of(2025, 1, 8)).term(term).schoolClass(class9A).subject(english).teacher(teacher2).build());
        Assessment projectEng9 = assessmentRepository.save(Assessment.builder()
                .name("Book Report").type(AssessmentType.PROJECT).weight(30.0).maxScore(100.0)
                .term(term).schoolClass(class9A).subject(english).teacher(teacher2).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(midtermEng9).student(student2).score(91.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(midtermEng9).student(student5).score(76.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(finalEng9).student(student2).score(88.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(finalEng9).student(student5).score(82.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(projectEng9).student(student2).score(95.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(projectEng9).student(student5).score(70.0).build());

        // --- Assessments for Grade 10A Chemistry ---
        Assessment midtermChem10 = assessmentRepository.save(Assessment.builder()
                .name("Midterm Exam").type(AssessmentType.MIDTERM).weight(35.0).maxScore(100.0)
                .date(LocalDate.of(2024, 10, 20)).term(term).schoolClass(class10A).subject(chemistry).teacher(teacher3).build());
        Assessment finalChem10 = assessmentRepository.save(Assessment.builder()
                .name("Final Exam").type(AssessmentType.FINAL).weight(45.0).maxScore(100.0)
                .date(LocalDate.of(2025, 1, 14)).term(term).schoolClass(class10A).subject(chemistry).teacher(teacher3).build());
        Assessment labChem10 = assessmentRepository.save(Assessment.builder()
                .name("Lab Practical").type(AssessmentType.PROJECT).weight(20.0).maxScore(50.0)
                .term(term).schoolClass(class10A).subject(chemistry).teacher(teacher3).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(midtermChem10).student(student1).score(80.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(midtermChem10).student(student3).score(60.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(finalChem10).student(student1).score(85.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(finalChem10).student(student3).score(72.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(labChem10).student(student1).score(42.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(labChem10).student(student3).score(35.0).build());

        // --- Attendance (past 14 days, realistic mix) ---
        List<Student> allStudents = Arrays.asList(student1, student2, student3, student4, student5);
        Map<Student, SchoolClass> studentClassMap = new HashMap<>();
        studentClassMap.put(student1, class10A);
        studentClassMap.put(student2, class9A);
        studentClassMap.put(student3, class10A);
        studentClassMap.put(student4, class8A);
        studentClassMap.put(student5, class9A);

        Random random = new Random(42);
        LocalDate today = LocalDate.now();
        for (int dayOffset = 13; dayOffset >= 0; dayOffset--) {
            LocalDate date = today.minusDays(dayOffset);
            if (date.getDayOfWeek().getValue() > 5) continue; // skip weekends
            for (Student s : allStudents) {
                double roll = random.nextDouble();
                AttendanceStatus status;
                if (roll < 0.78) status = AttendanceStatus.PRESENT;
                else if (roll < 0.88) status = AttendanceStatus.LATE;
                else if (roll < 0.95) status = AttendanceStatus.ABSENT;
                else status = AttendanceStatus.EXCUSED;

                attendanceRepository.save(Attendance.builder()
                        .student(s)
                        .schoolClass(studentClassMap.get(s))
                        .date(date)
                        .status(status)
                        .build());
            }
        }

        log.info("Demo data seeded successfully: {} users, {} students, {} teachers, {} classes, {} subjects",
                userRepository.count(), studentRepository.count(), teacherRepository.count(),
                schoolClassRepository.count(), subjectRepository.count());
    }
}
