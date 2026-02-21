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
    private final ClassTypeRepository classTypeRepository;
    private final SectionRepository sectionRepository;
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
        User superAdminUser = userRepository.save(User.builder()
                .firstName("Super").lastName("Admin")
                .email("superadmin@school.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.SUPER_ADMIN).build());

        User adminUser = userRepository.save(User.builder()
                .firstName("Admin").lastName("User")
                .email("admin@school.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN).build());

        User parentUser = userRepository.save(User.builder()
                .firstName("Robert").lastName("Smith")
                .email("parent@school.com")
                .password(passwordEncoder.encode("parent123"))
                .role(Role.PARENT).build());

        User accountantUser = userRepository.save(User.builder()
                .firstName("Janet").lastName("Finance")
                .email("accountant@school.com")
                .password(passwordEncoder.encode("accountant123"))
                .role(Role.ACCOUNTANT).build());

        User librarianUser = userRepository.save(User.builder()
                .firstName("Mark").lastName("Books")
                .email("librarian@school.com")
                .password(passwordEncoder.encode("librarian123"))
                .role(Role.LIBRARIAN).build());

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

        // --- Class Types ---
        ClassType junior = classTypeRepository.save(ClassType.builder().name("Junior Secondary").code("J").build());
        ClassType senior = classTypeRepository.save(ClassType.builder().name("Senior Secondary").code("S").build());
        ClassType primary = classTypeRepository.save(ClassType.builder().name("Primary").code("P").build());

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
        SchoolClass class8 = schoolClassRepository.save(SchoolClass.builder()
                .name("Grade 8").grade("8").section("A").classType(junior).homeroomTeacher(teacher1).build());
        SchoolClass class9 = schoolClassRepository.save(SchoolClass.builder()
                .name("Grade 9").grade("9").section("A").classType(junior).homeroomTeacher(teacher2).build());
        SchoolClass class10 = schoolClassRepository.save(SchoolClass.builder()
                .name("Grade 10").grade("10").section("A").classType(senior).homeroomTeacher(teacher3).build());

        // --- Sections ---
        Section sec8A = sectionRepository.save(Section.builder().name("A").schoolClass(class8).teacher(teacher1).active(true).build());
        Section sec8B = sectionRepository.save(Section.builder().name("B").schoolClass(class8).active(true).build());
        Section sec9A = sectionRepository.save(Section.builder().name("A").schoolClass(class9).teacher(teacher2).active(true).build());
        Section sec10A = sectionRepository.save(Section.builder().name("A").schoolClass(class10).teacher(teacher3).active(true).build());
        Section sec10B = sectionRepository.save(Section.builder().name("B").schoolClass(class10).active(true).build());

        // --- Students ---
        Student student1 = studentRepository.save(Student.builder()
                .firstName("James").lastName("Smith")
                .email("j.smith@school.com").dateOfBirth(LocalDate.of(2010, 3, 15))
                .address("123 Oak Street").guardianName("Robert Smith").guardianPhone("+1-555-1001")
                .schoolClass(class10).section(sec10A).user(studentUser1).build());

        Student student2 = studentRepository.save(Student.builder()
                .firstName("Elena").lastName("Rodriguez")
                .email("e.rodriguez@school.com").dateOfBirth(LocalDate.of(2011, 7, 22))
                .address("456 Pine Avenue").guardianName("Maria Rodriguez").guardianPhone("+1-555-1002")
                .schoolClass(class9).section(sec9A).user(studentUser2).build());

        Student student3 = studentRepository.save(Student.builder()
                .firstName("Alex").lastName("Chen")
                .email("a.chen@school.com").dateOfBirth(LocalDate.of(2010, 11, 8))
                .address("789 Maple Drive").guardianName("Wei Chen").guardianPhone("+1-555-1003")
                .schoolClass(class10).section(sec10A).user(studentUser3).build());

        Student student4 = studentRepository.save(Student.builder()
                .firstName("Kemi").lastName("Okafor")
                .email("k.okafor@school.com").dateOfBirth(LocalDate.of(2012, 1, 30))
                .address("321 Elm Road").guardianName("Chidi Okafor").guardianPhone("+1-555-1004")
                .schoolClass(class8).section(sec8A).user(studentUser4).build());

        Student student5 = studentRepository.save(Student.builder()
                .firstName("Lucia").lastName("Martinez")
                .email("l.martinez@school.com").dateOfBirth(LocalDate.of(2011, 5, 12))
                .address("654 Birch Lane").guardianName("Carlos Martinez").guardianPhone("+1-555-1005")
                .schoolClass(class9).section(sec9A).user(studentUser5).build());

        // --- Term ---
        Term term = termRepository.save(Term.builder()
                .name("Semester 1").academicYear("2024-2025")
                .startDate(LocalDate.of(2024, 9, 1)).endDate(LocalDate.of(2025, 1, 31))
                .isActive(true).build());

        // --- Enrollments ---
        enrollmentRepository.save(Enrollment.builder().student(student1).schoolClass(class10).term(term).status(EnrollmentStatus.ACTIVE).build());
        enrollmentRepository.save(Enrollment.builder().student(student2).schoolClass(class9).term(term).status(EnrollmentStatus.ACTIVE).build());
        enrollmentRepository.save(Enrollment.builder().student(student3).schoolClass(class10).term(term).status(EnrollmentStatus.ACTIVE).build());
        enrollmentRepository.save(Enrollment.builder().student(student4).schoolClass(class8).term(term).status(EnrollmentStatus.ACTIVE).build());
        enrollmentRepository.save(Enrollment.builder().student(student5).schoolClass(class9).term(term).status(EnrollmentStatus.ACTIVE).build());

        // --- Teacher Assignments ---
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher1).schoolClass(class10).subject(math).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher1).schoolClass(class10).subject(physics).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher1).schoolClass(class8).subject(math).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher2).schoolClass(class9).subject(english).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher2).schoolClass(class9).subject(biology).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher2).schoolClass(class8).subject(english).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher3).schoolClass(class10).subject(chemistry).term(term).build());
        teacherAssignmentRepository.save(TeacherAssignment.builder().teacher(teacher3).schoolClass(class9).subject(chemistry).term(term).build());

        // --- Assessments: CA1(20) + CA2(20) + Exam(60) = 100 per subject ---

        // Grade 10 Math (teacher1) - students: student1, student3
        Assessment ca1Math10 = assessmentRepository.save(Assessment.builder()
                .name("CA1").type(AssessmentType.QUIZ).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 9, 20)).term(term).schoolClass(class10).subject(math).teacher(teacher1).build());
        Assessment ca2Math10 = assessmentRepository.save(Assessment.builder()
                .name("CA2").type(AssessmentType.ASSIGNMENT).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 10, 15)).term(term).schoolClass(class10).subject(math).teacher(teacher1).build());
        Assessment examMath10 = assessmentRepository.save(Assessment.builder()
                .name("Exam").type(AssessmentType.FINAL).weight(60.0).maxScore(60.0)
                .date(LocalDate.of(2025, 1, 10)).term(term).schoolClass(class10).subject(math).teacher(teacher1).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Math10).student(student1).score(15.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Math10).student(student1).score(17.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examMath10).student(student1).score(50.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Math10).student(student3).score(12.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Math10).student(student3).score(14.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examMath10).student(student3).score(38.0).build());

        // Grade 10 Physics (teacher1) - students: student1, student3
        Assessment ca1Phys10 = assessmentRepository.save(Assessment.builder()
                .name("CA1").type(AssessmentType.QUIZ).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 9, 25)).term(term).schoolClass(class10).subject(physics).teacher(teacher1).build());
        Assessment ca2Phys10 = assessmentRepository.save(Assessment.builder()
                .name("CA2").type(AssessmentType.ASSIGNMENT).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 10, 18)).term(term).schoolClass(class10).subject(physics).teacher(teacher1).build());
        Assessment examPhys10 = assessmentRepository.save(Assessment.builder()
                .name("Exam").type(AssessmentType.FINAL).weight(60.0).maxScore(60.0)
                .date(LocalDate.of(2025, 1, 12)).term(term).schoolClass(class10).subject(physics).teacher(teacher1).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Phys10).student(student1).score(18.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Phys10).student(student1).score(16.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examPhys10).student(student1).score(48.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Phys10).student(student3).score(14.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Phys10).student(student3).score(12.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examPhys10).student(student3).score(40.0).build());

        // Grade 10 Chemistry (teacher3) - students: student1, student3
        Assessment ca1Chem10 = assessmentRepository.save(Assessment.builder()
                .name("CA1").type(AssessmentType.QUIZ).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 9, 28)).term(term).schoolClass(class10).subject(chemistry).teacher(teacher3).build());
        Assessment ca2Chem10 = assessmentRepository.save(Assessment.builder()
                .name("CA2").type(AssessmentType.ASSIGNMENT).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 10, 20)).term(term).schoolClass(class10).subject(chemistry).teacher(teacher3).build());
        Assessment examChem10 = assessmentRepository.save(Assessment.builder()
                .name("Exam").type(AssessmentType.FINAL).weight(60.0).maxScore(60.0)
                .date(LocalDate.of(2025, 1, 14)).term(term).schoolClass(class10).subject(chemistry).teacher(teacher3).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Chem10).student(student1).score(16.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Chem10).student(student1).score(14.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examChem10).student(student1).score(45.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Chem10).student(student3).score(10.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Chem10).student(student3).score(11.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examChem10).student(student3).score(35.0).build());

        // Grade 10 English (teacher2) - students: student1, student3
        Assessment ca1Eng10 = assessmentRepository.save(Assessment.builder()
                .name("CA1").type(AssessmentType.QUIZ).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 9, 22)).term(term).schoolClass(class10).subject(english).teacher(teacher2).build());
        Assessment ca2Eng10 = assessmentRepository.save(Assessment.builder()
                .name("CA2").type(AssessmentType.ASSIGNMENT).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 10, 16)).term(term).schoolClass(class10).subject(english).teacher(teacher2).build());
        Assessment examEng10 = assessmentRepository.save(Assessment.builder()
                .name("Exam").type(AssessmentType.FINAL).weight(60.0).maxScore(60.0)
                .date(LocalDate.of(2025, 1, 11)).term(term).schoolClass(class10).subject(english).teacher(teacher2).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Eng10).student(student1).score(14.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Eng10).student(student1).score(16.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examEng10).student(student1).score(42.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Eng10).student(student3).score(11.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Eng10).student(student3).score(13.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examEng10).student(student3).score(35.0).build());

        // Grade 10 Biology (teacher2) - students: student1, student3
        Assessment ca1Bio10 = assessmentRepository.save(Assessment.builder()
                .name("CA1").type(AssessmentType.QUIZ).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 9, 24)).term(term).schoolClass(class10).subject(biology).teacher(teacher2).build());
        Assessment ca2Bio10 = assessmentRepository.save(Assessment.builder()
                .name("CA2").type(AssessmentType.ASSIGNMENT).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 10, 19)).term(term).schoolClass(class10).subject(biology).teacher(teacher2).build());
        Assessment examBio10 = assessmentRepository.save(Assessment.builder()
                .name("Exam").type(AssessmentType.FINAL).weight(60.0).maxScore(60.0)
                .date(LocalDate.of(2025, 1, 13)).term(term).schoolClass(class10).subject(biology).teacher(teacher2).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Bio10).student(student1).score(17.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Bio10).student(student1).score(15.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examBio10).student(student1).score(52.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Bio10).student(student3).score(13.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Bio10).student(student3).score(10.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examBio10).student(student3).score(30.0).build());

        // Grade 9 English (teacher2) - students: student2, student5
        Assessment ca1Eng9 = assessmentRepository.save(Assessment.builder()
                .name("CA1").type(AssessmentType.QUIZ).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 9, 20)).term(term).schoolClass(class9).subject(english).teacher(teacher2).build());
        Assessment ca2Eng9 = assessmentRepository.save(Assessment.builder()
                .name("CA2").type(AssessmentType.ASSIGNMENT).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 10, 12)).term(term).schoolClass(class9).subject(english).teacher(teacher2).build());
        Assessment examEng9 = assessmentRepository.save(Assessment.builder()
                .name("Exam").type(AssessmentType.FINAL).weight(60.0).maxScore(60.0)
                .date(LocalDate.of(2025, 1, 8)).term(term).schoolClass(class9).subject(english).teacher(teacher2).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Eng9).student(student2).score(18.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Eng9).student(student2).score(17.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examEng9).student(student2).score(50.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Eng9).student(student5).score(12.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Eng9).student(student5).score(14.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examEng9).student(student5).score(38.0).build());

        // Grade 9 Biology (teacher2) - students: student2, student5
        Assessment ca1Bio9 = assessmentRepository.save(Assessment.builder()
                .name("CA1").type(AssessmentType.QUIZ).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 9, 23)).term(term).schoolClass(class9).subject(biology).teacher(teacher2).build());
        Assessment ca2Bio9 = assessmentRepository.save(Assessment.builder()
                .name("CA2").type(AssessmentType.ASSIGNMENT).weight(20.0).maxScore(20.0)
                .date(LocalDate.of(2024, 10, 14)).term(term).schoolClass(class9).subject(biology).teacher(teacher2).build());
        Assessment examBio9 = assessmentRepository.save(Assessment.builder()
                .name("Exam").type(AssessmentType.FINAL).weight(60.0).maxScore(60.0)
                .date(LocalDate.of(2025, 1, 9)).term(term).schoolClass(class9).subject(biology).teacher(teacher2).build());

        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Bio9).student(student2).score(16.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Bio9).student(student2).score(15.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examBio9).student(student2).score(45.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca1Bio9).student(student5).score(10.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(ca2Bio9).student(student5).score(11.0).build());
        gradeEntryRepository.save(GradeEntry.builder().assessment(examBio9).student(student5).score(32.0).build());

        // --- Attendance (past 14 days, realistic mix) ---
        List<Student> allStudents = Arrays.asList(student1, student2, student3, student4, student5);
        Map<Student, SchoolClass> studentClassMap = new HashMap<>();
        studentClassMap.put(student1, class10);
        studentClassMap.put(student2, class9);
        studentClassMap.put(student3, class10);
        studentClassMap.put(student4, class8);
        studentClassMap.put(student5, class9);

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
