export interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  token: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  classId?: number;
  className?: string;
}

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  subjectIds?: number[];
  subjectNames?: string[];
}

export interface SchoolClass {
  id: number;
  name: string;
  grade?: string;
  section?: string;
  homeroomTeacherId?: number;
  homeroomTeacherName?: string;
  studentCount: number;
  students?: Student[];
}

export interface Subject {
  id: number;
  name: string;
  code?: string;
  description?: string;
  credits?: number;
}

export interface Term {
  id: number;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Enrollment {
  id: number;
  studentId: number;
  studentName?: string;
  classId: number;
  className?: string;
  termId: number;
  termName?: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'DROPPED' | 'COMPLETED';
}

export interface TeacherAssignment {
  id: number;
  teacherId: number;
  teacherName?: string;
  classId: number;
  className?: string;
  subjectId: number;
  subjectName?: string;
  termId: number;
  termName?: string;
}

export type AssessmentType = 'QUIZ' | 'ASSIGNMENT' | 'MIDTERM' | 'FINAL' | 'PROJECT' | 'OTHER';

export interface Assessment {
  id: number;
  name: string;
  type: AssessmentType;
  weight: number;
  maxScore: number;
  date?: string;
  termId: number;
  termName?: string;
  classId: number;
  className?: string;
  subjectId: number;
  subjectName?: string;
  teacherId?: number;
  teacherName?: string;
}

export interface GradeEntry {
  id: number;
  assessmentId: number;
  assessmentName?: string;
  assessmentWeight?: number;
  assessmentMaxScore?: number;
  studentId: number;
  studentName?: string;
  score: number;
  percentage?: number;
  letterGrade?: string;
  remarks?: string;
}

export interface AssessmentScore {
  assessmentName: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
}

export interface SubjectReport {
  subjectId: number;
  subjectName: string;
  credits: number;
  finalPercentage: number;
  letterGrade: string;
  gpaPoints: number;
  assessments: AssessmentScore[];
}

export interface ReportCard {
  studentId: number;
  studentName: string;
  termName: string;
  academicYear: string;
  className: string;
  gpa: number;
  overallGrade: string;
  subjects: SubjectReport[];
}

export interface AttendanceSummary {
  studentId: number;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
  lowAttendanceAlert: boolean;
}

export interface Attendance {
  id: number;
  studentId: number;
  studentName?: string;
  classId: number;
  className?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface Grade {
  id: number;
  studentId: number;
  studentName?: string;
  subjectId: number;
  subjectName?: string;
  score: number;
  maxScore?: number;
  examName?: string;
  examDate?: string;
  remarks?: string;
  percentage?: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
}
