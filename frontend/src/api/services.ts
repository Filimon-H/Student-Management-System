import api from './axios';
import { AuthResponse, Student, Teacher, SchoolClass, Subject, Attendance, Grade, DashboardStats, Term, Enrollment, TeacherAssignment, Assessment, GradeEntry, ReportCard, AttendanceSummary, ClassType, Section } from '../types';

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (data: { firstName: string; lastName: string; email: string; password: string; role: string }) =>
    api.post<AuthResponse>('/auth/register', data),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard'),
};

// Students
export const studentApi = {
  getAll: () => api.get<Student[]>('/students'),
  getById: (id: number) => api.get<Student>(`/students/${id}`),
  getMe: () => api.get<Student>('/students/me'),
  search: (query: string) => api.get<Student[]>(`/students/search?query=${query}`),
  getByClass: (classId: number) => api.get<Student[]>(`/students/class/${classId}`),
  create: (data: Partial<Student>) => api.post<Student>('/students', data),
  update: (id: number, data: Partial<Student>) => api.put<Student>(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
};

// Teachers
export const teacherApi = {
  getAll: () => api.get<Teacher[]>('/teachers'),
  getById: (id: number) => api.get<Teacher>(`/teachers/${id}`),
  create: (data: Partial<Teacher>) => api.post<Teacher>('/teachers', data),
  update: (id: number, data: Partial<Teacher>) => api.put<Teacher>(`/teachers/${id}`, data),
  delete: (id: number) => api.delete(`/teachers/${id}`),
};

// Classes
export const classApi = {
  getAll: () => api.get<SchoolClass[]>('/classes'),
  getById: (id: number) => api.get<SchoolClass>(`/classes/${id}`),
  create: (data: Partial<SchoolClass>) => api.post<SchoolClass>('/classes', data),
  update: (id: number, data: Partial<SchoolClass>) => api.put<SchoolClass>(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`),
};

// Class Types
export const classTypeApi = {
  getAll: () => api.get<ClassType[]>('/class-types'),
  getById: (id: number) => api.get<ClassType>(`/class-types/${id}`),
  create: (data: Partial<ClassType>) => api.post<ClassType>('/class-types', data),
  update: (id: number, data: Partial<ClassType>) => api.put<ClassType>(`/class-types/${id}`, data),
  delete: (id: number) => api.delete(`/class-types/${id}`),
};

// Sections
export const sectionApi = {
  getAll: () => api.get<Section[]>('/sections'),
  getByClass: (classId: number) => api.get<Section[]>(`/sections/class/${classId}`),
  getActiveByClass: (classId: number) => api.get<Section[]>(`/sections/class/${classId}/active`),
  getById: (id: number) => api.get<Section>(`/sections/${id}`),
  create: (data: Partial<Section>) => api.post<Section>('/sections', data),
  update: (id: number, data: Partial<Section>) => api.put<Section>(`/sections/${id}`, data),
  delete: (id: number) => api.delete(`/sections/${id}`),
};

// Subjects
export const subjectApi = {
  getAll: () => api.get<Subject[]>('/subjects'),
  getById: (id: number) => api.get<Subject>(`/subjects/${id}`),
  create: (data: Partial<Subject>) => api.post<Subject>('/subjects', data),
  update: (id: number, data: Partial<Subject>) => api.put<Subject>(`/subjects/${id}`, data),
  delete: (id: number) => api.delete(`/subjects/${id}`),
};

// Attendance
export const attendanceApi = {
  getByStudent: (studentId: number) => api.get<Attendance[]>(`/attendance/student/${studentId}`),
  getByClassAndDate: (classId: number, date: string) =>
    api.get<Attendance[]>(`/attendance/class/${classId}?date=${date}`),
  getByStudentAndRange: (studentId: number, startDate: string, endDate: string) =>
    api.get<Attendance[]>(`/attendance/student/${studentId}/range?startDate=${startDate}&endDate=${endDate}`),
  mark: (data: Partial<Attendance>) => api.post<Attendance>('/attendance', data),
  markBulk: (data: Partial<Attendance>[]) => api.post<Attendance[]>('/attendance/bulk', data),
  update: (id: number, data: Partial<Attendance>) => api.put<Attendance>(`/attendance/${id}`, data),
};

// Grades
export const gradeApi = {
  getByStudent: (studentId: number) => api.get<Grade[]>(`/grades/student/${studentId}`),
  getBySubject: (subjectId: number) => api.get<Grade[]>(`/grades/subject/${subjectId}`),
  getStudentAverage: (studentId: number) => api.get<number>(`/grades/student/${studentId}/average`),
  create: (data: Partial<Grade>) => api.post<Grade>('/grades', data),
  update: (id: number, data: Partial<Grade>) => api.put<Grade>(`/grades/${id}`, data),
  delete: (id: number) => api.delete(`/grades/${id}`),
};

// Terms
export const termApi = {
  getAll: () => api.get<Term[]>('/terms'),
  getActive: () => api.get<Term>('/terms/active'),
  getById: (id: number) => api.get<Term>(`/terms/${id}`),
  create: (data: Partial<Term>) => api.post<Term>('/terms', data),
  update: (id: number, data: Partial<Term>) => api.put<Term>(`/terms/${id}`, data),
  activate: (id: number) => api.put<Term>(`/terms/${id}/activate`),
  delete: (id: number) => api.delete(`/terms/${id}`),
};

// Enrollments
export const enrollmentApi = {
  getByTerm: (termId: number) => api.get<Enrollment[]>(`/enrollments/term/${termId}`),
  getByStudent: (studentId: number) => api.get<Enrollment[]>(`/enrollments/student/${studentId}`),
  getByClassAndTerm: (classId: number, termId: number) =>
    api.get<Enrollment[]>(`/enrollments/class/${classId}/term/${termId}`),
  enroll: (data: Partial<Enrollment>) => api.post<Enrollment>('/enrollments', data),
  updateStatus: (id: number, status: string) =>
    api.put<Enrollment>(`/enrollments/${id}/status?status=${status}`),
  delete: (id: number) => api.delete(`/enrollments/${id}`),
};

// Teacher Assignments
export const assignmentApi = {
  getByTerm: (termId: number) => api.get<TeacherAssignment[]>(`/assignments/term/${termId}`),
  getByTeacher: (teacherId: number) => api.get<TeacherAssignment[]>(`/assignments/teacher/${teacherId}`),
  getByTeacherAndTerm: (teacherId: number, termId: number) =>
    api.get<TeacherAssignment[]>(`/assignments/teacher/${teacherId}/term/${termId}`),
  assign: (data: Partial<TeacherAssignment>) => api.post<TeacherAssignment>('/assignments', data),
  delete: (id: number) => api.delete(`/assignments/${id}`),
};

// Assessments & Grade Entries
export const assessmentApi = {
  getByTermClassSubject: (termId: number, classId: number, subjectId: number) =>
    api.get<Assessment[]>(`/assessments/term/${termId}/class/${classId}/subject/${subjectId}`),
  getByTermAndClass: (termId: number, classId: number) =>
    api.get<Assessment[]>(`/assessments/term/${termId}/class/${classId}`),
  create: (data: Partial<Assessment>) => api.post<Assessment>('/assessments', data),
  update: (id: number, data: Partial<Assessment>) => api.put<Assessment>(`/assessments/${id}`, data),
  delete: (id: number) => api.delete(`/assessments/${id}`),
  getGradeEntries: (assessmentId: number) =>
    api.get<GradeEntry[]>(`/assessments/${assessmentId}/grades`),
  saveGradeEntry: (data: Partial<GradeEntry>) => api.post<GradeEntry>('/assessments/grades', data),
  deleteGradeEntry: (id: number) => api.delete(`/assessments/grades/${id}`),
  getReportCard: (studentId: number, termId: number) =>
    api.get<ReportCard>(`/assessments/report-card/student/${studentId}/term/${termId}`),
};

// Attendance Summary & Export
export const attendanceSummaryApi = {
  getMonthlySummary: (classId: number, year: number, month: number) =>
    api.get<AttendanceSummary[]>(`/attendance/class/${classId}/monthly?year=${year}&month=${month}`),
  getLowAttendanceAlerts: (classId: number, year: number, month: number) =>
    api.get<AttendanceSummary[]>(`/attendance/class/${classId}/alerts?year=${year}&month=${month}`),
  getStudentSummary: (studentId: number, startDate: string, endDate: string) =>
    api.get<AttendanceSummary>(`/attendance/student/${studentId}/summary?startDate=${startDate}&endDate=${endDate}`),
  exportCsv: (classId: number, year: number, month: number) =>
    api.get(`/attendance/class/${classId}/export?year=${year}&month=${month}`, { responseType: 'blob' }),
};
