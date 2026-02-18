import { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, ChevronDown, ChevronRight, AlertCircle, Award, BookOpen } from 'lucide-react';
import { assessmentApi, termApi, classApi, subjectApi, studentApi } from '../api/services';
import { Assessment, GradeEntry, ReportCard, Term, SchoolClass, Subject, Student, AssessmentType } from '../types';
import { useAuth } from '../context/AuthContext';

const LETTER_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-red-100 text-red-700',
};

const ASSESSMENT_TYPES: AssessmentType[] = ['QUIZ', 'ASSIGNMENT', 'MIDTERM', 'FINAL', 'PROJECT', 'OTHER'];

export default function SmartGrades() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedTerm, setSelectedTerm] = useState<number | ''>('');
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [expandedAssessment, setExpandedAssessment] = useState<number | null>(null);
  const [gradeEntries, setGradeEntries] = useState<Record<number, GradeEntry[]>>({});

  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    name: '', type: 'QUIZ' as AssessmentType, weight: '', maxScore: '100', date: '',
  });

  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [reportStudentId, setReportStudentId] = useState<number | ''>('');
  const [showReport, setShowReport] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([termApi.getAll(), classApi.getAll(), subjectApi.getAll(), studentApi.getAll()])
      .then(([t, c, s, st]) => {
        setTerms(t.data);
        setClasses(c.data);
        setSubjects(s.data);
        setStudents(st.data);
        const active = t.data.find(x => x.isActive);
        if (active) setSelectedTerm(active.id);
      })
      .catch(() => setError('Failed to load data'));
  }, []);

  useEffect(() => {
    if (selectedTerm && selectedClass && selectedSubject) {
      loadAssessments();
    } else {
      setAssessments([]);
    }
  }, [selectedTerm, selectedClass, selectedSubject]);

  async function loadAssessments() {
    setLoading(true);
    try {
      const res = await assessmentApi.getByTermClassSubject(
        Number(selectedTerm), Number(selectedClass), Number(selectedSubject)
      );
      setAssessments(res.data);
      setGradeEntries({});
    } catch { setError('Failed to load assessments'); }
    finally { setLoading(false); }
  }

  async function toggleAssessment(id: number) {
    if (expandedAssessment === id) { setExpandedAssessment(null); return; }
    setExpandedAssessment(id);
    if (!gradeEntries[id]) {
      try {
        const res = await assessmentApi.getGradeEntries(id);
        setGradeEntries(prev => ({ ...prev, [id]: res.data }));
      } catch { setError('Failed to load grades'); }
    }
  }

  async function handleCreateAssessment(e: React.FormEvent) {
    e.preventDefault();
    try {
      await assessmentApi.create({
        name: assessmentForm.name,
        type: assessmentForm.type,
        weight: Number(assessmentForm.weight),
        maxScore: Number(assessmentForm.maxScore),
        date: assessmentForm.date || undefined,
        termId: Number(selectedTerm),
        classId: Number(selectedClass),
        subjectId: Number(selectedSubject),
      });
      setShowAssessmentForm(false);
      setAssessmentForm({ name: '', type: 'QUIZ', weight: '', maxScore: '100', date: '' });
      loadAssessments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assessment');
    }
  }

  async function handleDeleteAssessment(id: number) {
    if (!confirm('Delete this assessment and all its grades?')) return;
    try {
      await assessmentApi.delete(id);
      loadAssessments();
    } catch { setError('Failed to delete assessment'); }
  }

  async function handleSaveScore(assessmentId: number, studentId: number, score: string) {
    const num = parseFloat(score);
    if (isNaN(num)) return;
    try {
      await assessmentApi.saveGradeEntry({ assessmentId, studentId, score: num });
      const res = await assessmentApi.getGradeEntries(assessmentId);
      setGradeEntries(prev => ({ ...prev, [assessmentId]: res.data }));
    } catch { setError('Failed to save score'); }
  }

  async function loadReportCard() {
    if (!reportStudentId || !selectedTerm) return;
    try {
      const res = await assessmentApi.getReportCard(Number(reportStudentId), Number(selectedTerm));
      setReportCard(res.data);
      setShowReport(true);
    } catch { setError('Failed to generate report card'); }
  }

  const classStudents = students.filter(s => s.classId === Number(selectedClass));
  const totalWeight = assessments.reduce((sum, a) => sum + a.weight, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Grades</h1>
          <p className="text-sm text-gray-500 mt-1">Weighted assessments, letter grades & GPA</p>
        </div>
        {canEdit && selectedTerm && selectedClass && selectedSubject && (
          <button onClick={() => setShowAssessmentForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add Assessment
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle size={16} />{error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Term</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedTerm} onChange={e => setSelectedTerm(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select term</option>
              {terms.map(t => <option key={t.id} value={t.id}>{t.name}{t.isActive ? ' ★' : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedClass} onChange={e => setSelectedClass(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSubject} onChange={e => setSelectedSubject(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Report Card Generator */}
      {selectedTerm && selectedClass && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Award size={18} />
              <span className="font-medium text-sm">Generate Report Card</span>
            </div>
            <select className="border border-blue-200 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={reportStudentId} onChange={e => setReportStudentId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select student</option>
              {classStudents.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
            <button onClick={loadReportCard} disabled={!reportStudentId}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <FileText size={14} /> Generate
            </button>
          </div>
        </div>
      )}

      {/* Weight summary */}
      {assessments.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Total weight:</span>
          <span className={`font-semibold ${Math.abs(totalWeight - 100) < 0.01 ? 'text-green-600' : 'text-orange-500'}`}>
            {totalWeight}%
          </span>
          {Math.abs(totalWeight - 100) > 0.01 && (
            <span className="text-orange-500 text-xs">(should sum to 100%)</span>
          )}
        </div>
      )}

      {/* Assessments list */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : assessments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 text-center py-16 text-gray-400">
          {selectedTerm && selectedClass && selectedSubject
            ? 'No assessments yet. Add your first assessment.'
            : 'Select a term, class, and subject to manage grades.'}
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map(a => {
            const entries = gradeEntries[a.id] || [];
            const isExpanded = expandedAssessment === a.id;
            return (
              <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleAssessment(a.id)}>
                  <button className="text-gray-400">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{a.name}</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{a.type}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Weight: {a.weight}%</span>
                      <span className="text-xs text-gray-400">Max: {a.maxScore}</span>
                      {a.date && <span className="text-xs text-gray-400">{a.date}</span>}
                    </div>
                  </div>
                  {canEdit && (
                    <button onClick={e => { e.stopPropagation(); handleDeleteAssessment(a.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {classStudents.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-gray-400">No students in this class.</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-5 py-2 font-medium text-gray-500">Student</th>
                            <th className="text-left px-5 py-2 font-medium text-gray-500">Score / {a.maxScore}</th>
                            <th className="text-left px-5 py-2 font-medium text-gray-500">%</th>
                            <th className="text-left px-5 py-2 font-medium text-gray-500">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {classStudents.map(s => {
                            const entry = entries.find(e => e.studentId === s.id);
                            return (
                              <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-5 py-2 font-medium text-gray-800">{s.firstName} {s.lastName}</td>
                                <td className="px-5 py-2">
                                  {canEdit ? (
                                    <input
                                      type="number" min="0" max={a.maxScore} step="0.5"
                                      defaultValue={entry?.score ?? ''}
                                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      onBlur={e => handleSaveScore(a.id, s.id, e.target.value)}
                                    />
                                  ) : (
                                    <span>{entry?.score ?? '—'}</span>
                                  )}
                                </td>
                                <td className="px-5 py-2 text-gray-600">{entry?.percentage != null ? `${entry.percentage}%` : '—'}</td>
                                <td className="px-5 py-2">
                                  {entry?.letterGrade ? (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LETTER_COLORS[entry.letterGrade] || 'bg-gray-100 text-gray-600'}`}>
                                      {entry.letterGrade}
                                    </span>
                                  ) : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Assessment Form Modal */}
      {showAssessmentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Assessment</h2>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={assessmentForm.name} onChange={e => setAssessmentForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Midterm Exam" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={assessmentForm.type} onChange={e => setAssessmentForm(f => ({ ...f, type: e.target.value as AssessmentType }))}>
                    {ASSESSMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                  <input type="number" min="1" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={assessmentForm.weight} onChange={e => setAssessmentForm(f => ({ ...f, weight: e.target.value }))}
                    placeholder="e.g. 30" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                  <input type="number" min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={assessmentForm.maxScore} onChange={e => setAssessmentForm(f => ({ ...f, maxScore: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date (optional)</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={assessmentForm.date} onChange={e => setAssessmentForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAssessmentForm(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Card Modal */}
      {showReport && reportCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Report Card</h2>
                  <p className="text-blue-100 text-sm mt-0.5">{reportCard.termName} · {reportCard.academicYear}</p>
                </div>
                <button onClick={() => setShowReport(false)} className="text-blue-200 hover:text-white text-xl font-bold">✕</button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-blue-200 text-xs">Student</p>
                  <p className="font-semibold">{reportCard.studentName}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs">Class</p>
                  <p className="font-semibold">{reportCard.className}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs">GPA</p>
                  <p className="font-bold text-2xl">{reportCard.gpa.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {reportCard.subjects.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No graded subjects for this term.</p>
              ) : reportCard.subjects.map(sub => (
                <div key={sub.subjectId} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-500" />
                      <span className="font-semibold text-gray-900">{sub.subjectName}</span>
                      <span className="text-xs text-gray-400">{sub.credits} cr</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{sub.finalPercentage}%</span>
                      <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${LETTER_COLORS[sub.letterGrade] || 'bg-gray-100 text-gray-600'}`}>
                        {sub.letterGrade}
                      </span>
                      <span className="text-xs text-gray-400">{sub.gpaPoints.toFixed(1)} pts</span>
                    </div>
                  </div>
                  <table className="w-full text-xs">
                    <thead className="bg-white border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-2 text-gray-400 font-medium">Assessment</th>
                        <th className="text-left px-4 py-2 text-gray-400 font-medium">Type</th>
                        <th className="text-right px-4 py-2 text-gray-400 font-medium">Score</th>
                        <th className="text-right px-4 py-2 text-gray-400 font-medium">%</th>
                        <th className="text-right px-4 py-2 text-gray-400 font-medium">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sub.assessments.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-700">{a.assessmentName}</td>
                          <td className="px-4 py-2 text-gray-500">{a.assessmentType}</td>
                          <td className="px-4 py-2 text-right text-gray-700">{a.score}/{a.maxScore}</td>
                          <td className="px-4 py-2 text-right text-gray-700">{a.percentage}%</td>
                          <td className="px-4 py-2 text-right text-gray-500">{a.weight}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">Overall Grade</span>
                <div className="flex items-center gap-3">
                  <span className={`font-bold px-3 py-1 rounded-full ${LETTER_COLORS[reportCard.overallGrade] || 'bg-gray-100 text-gray-600'}`}>
                    {reportCard.overallGrade}
                  </span>
                  <span className="text-lg font-bold text-gray-900">GPA: {reportCard.gpa.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
