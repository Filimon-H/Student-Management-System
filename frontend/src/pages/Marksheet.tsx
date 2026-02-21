import { useEffect, useState, useRef } from 'react';
import { assessmentApi, studentApi, termApi, classApi } from '../api/services';
import { ReportCard, Student, Term, SchoolClass } from '../types';
import { useAuth } from '../context/AuthContext';
import { Printer, FileText, Search } from 'lucide-react';

function getSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return n + 'th';
  switch (n % 10) {
    case 1: return n + 'st';
    case 2: return n + 'nd';
    case 3: return n + 'rd';
    default: return n + 'th';
  }
}

export default function Marksheet() {
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [report, setReport] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    termApi.getAll().then((r) => setTerms(r.data));
    classApi.getAll().then((r) => setClasses(r.data));
    if (!isStudent) {
      studentApi.getAll().then((r) => setStudents(r.data));
    }
  }, []);

  useEffect(() => {
    if (selectedClass) {
      studentApi.getByClass(Number(selectedClass)).then((r) => setStudents(r.data));
    }
  }, [selectedClass]);

  const fetchReport = async () => {
    const sid = isStudent ? user?.studentId : Number(selectedStudent);
    const tid = Number(selectedTerm);
    if (!sid || !tid) return;

    setLoading(true);
    setError('');
    setReport(null);
    try {
      const res = await assessmentApi.getReportCard(sid, tid);
      setReport(res.data);
    } catch {
      setError('No marksheet data found for this student/term.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Add print-only styles temporarily
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        .print-container, .print-container * { visibility: visible; }
        .print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 10px;
          background: white;
        }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Clean up
    setTimeout(() => {
      const existing = document.getElementById('print-styles');
      if (existing) existing.remove();
    }, 100);
  };

  return (
    <div>
      {/* Selector Bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText size={24} /> Student Marksheet
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Term / Exam</label>
            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Term</option>
              {terms.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.academicYear})</option>)}
            </select>
          </div>

          {!isStudent && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary">
                  <option value="">All Classes</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select Student</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                </select>
              </div>
            </>
          )}

          <div>
            <button onClick={fetchReport} disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 w-full justify-center">
              <Search size={16} /> {loading ? 'Loading...' : 'View Sheet'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">{error}</div>
      )}

      {/* Report Card Preview */}
      {report && (
        <>
          {/* Print Button */}
          <div className="no-print flex justify-center mb-4 gap-3">
            <button onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
              <Printer size={16} /> Print Marksheet
            </button>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden print-container">
            <div ref={printRef} className="p-8 print:p-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>

              {/* Header */}
              <div className="report-header" style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h1 style={{ fontSize: '22px', color: '#1b0c80', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
                  School Management System
                </h1>
                <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#333', margin: '2px 0' }}>
                  Academic Excellence Through Discipline
                </p>
                {report.classTypeName && (
                  <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
                    REPORT SHEET ({report.classTypeName.toUpperCase()})
                  </p>
                )}
              </div>

              {/* Student Info */}
              <table style={{ width: '100%', marginBottom: '12px', fontSize: '13px' }}>
                <tbody>
                  <tr>
                    <td><strong>NAME:</strong> {report.studentName.toUpperCase()}</td>
                    <td><strong>CLASS:</strong> {report.className} {report.sectionName}</td>
                    <td><strong>ACADEMIC YEAR:</strong> {report.academicYear}</td>
                  </tr>
                  <tr>
                    <td><strong>REPORT SHEET FOR</strong> {getSuffix(report.termNumber)} TERM</td>
                    <td><strong>POSITION:</strong> {getSuffix(report.position)} of {report.totalStudentsInClass}</td>
                    <td><strong>OVERALL GRADE:</strong> {report.overallGrade}</td>
                  </tr>
                </tbody>
              </table>

              {/* Marks Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '10px 0', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px 6px', background: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>SUBJECTS</th>
                    <th colSpan={3} style={{ border: '1px solid #000', padding: '5px 6px', background: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>CONTINUOUS ASSESSMENT</th>
                    <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px 6px', background: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>EXAM<br />(60)</th>
                    <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px 6px', background: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>FINAL MARKS<br />(100%)</th>
                    <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px 6px', background: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>GRADE</th>
                    <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px 6px', background: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>SUBJECT<br />POSITION</th>
                    <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px 6px', background: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>REMARKS</th>
                  </tr>
                  <tr>
                    <th style={{ border: '1px solid #000', padding: '5px 6px', background: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>CA1(20)</th>
                    <th style={{ border: '1px solid #000', padding: '5px 6px', background: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>CA2(20)</th>
                    <th style={{ border: '1px solid #000', padding: '5px 6px', background: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>TOTAL(40)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.subjects.map((s, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'left', fontWeight: 'bold' }}>{s.subjectName}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>{s.ca1 || '-'}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>{s.ca2 || '-'}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>{s.caTotal || '-'}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>{s.exam || '-'}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center', fontWeight: 'bold' }}>{s.total}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>{s.grade}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>{getSuffix(s.subjectPosition)}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>{s.remarks}</td>
                    </tr>
                  ))}
                  {/* Summary Row */}
                  <tr>
                    <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold' }}>
                      TOTAL SCORES OBTAINED: {report.totalScoresObtained}
                    </td>
                    <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold' }}>
                      FINAL AVERAGE: {report.finalAverage}
                    </td>
                    <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold' }}>
                      CLASS AVERAGE: {report.classAverage}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Grading Key */}
              <div style={{ marginTop: '16px', fontSize: '11px' }}>
                <table style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #000', padding: '3px 10px', background: '#f5f5f5' }}>KEY</th>
                      <th style={{ border: '1px solid #000', padding: '3px 10px', background: '#f5f5f5' }}>RANGE</th>
                      <th style={{ border: '1px solid #000', padding: '3px 10px', background: '#f5f5f5' }}>REMARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { g: 'A', r: '70 - 100', rm: 'Excellent' },
                      { g: 'B', r: '60 - 69', rm: 'Very Good' },
                      { g: 'C', r: '50 - 59', rm: 'Good' },
                      { g: 'D', r: '45 - 49', rm: 'Pass' },
                      { g: 'E', r: '40 - 44', rm: 'Poor' },
                      { g: 'F', r: '0 - 39', rm: 'Fail' },
                    ].map((row) => (
                      <tr key={row.g}>
                        <td style={{ border: '1px solid #000', padding: '2px 10px', textAlign: 'center', fontWeight: 'bold' }}>{row.g}</td>
                        <td style={{ border: '1px solid #000', padding: '2px 10px', textAlign: 'center' }}>{row.r}</td>
                        <td style={{ border: '1px solid #000', padding: '2px 10px' }}>{row.rm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Comments Section */}
              <div style={{ marginTop: '20px', fontSize: '13px' }}>
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '5px 0' }}><strong>CLASS TEACHER&apos;S COMMENT:</strong></td>
                      <td style={{ padding: '5px 0', borderBottom: '1px solid #000', width: '70%' }}></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 0' }}><strong>PRINCIPAL&apos;S COMMENT:</strong></td>
                      <td style={{ padding: '5px 0', borderBottom: '1px solid #000', width: '70%' }}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
