import { useEffect, useState } from 'react';
import { gradeApi, studentApi, subjectApi } from '../api/services';
import { Grade, Student, Subject } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, X } from 'lucide-react';

export default function Grades() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ studentId: '', subjectId: '', score: '', maxScore: '100', examName: '', examDate: '', remarks: '' });

  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    if (isStudent && user?.studentId) {
      setSelectedStudent(String(user.studentId));
    } else {
      studentApi.getAll().then((res) => setStudents(res.data));
    }
    subjectApi.getAll().then((res) => setSubjects(res.data));
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      setLoading(true);
      Promise.all([
        gradeApi.getByStudent(Number(selectedStudent)),
        gradeApi.getStudentAverage(Number(selectedStudent)),
      ]).then(([gradesRes, avgRes]) => {
        setGrades(gradesRes.data);
        setAverage(avgRes.data);
      }).finally(() => setLoading(false));
    }
  }, [selectedStudent]);

  const fetchGrades = () => {
    if (!selectedStudent) return;
    gradeApi.getByStudent(Number(selectedStudent)).then((res) => setGrades(res.data));
    gradeApi.getStudentAverage(Number(selectedStudent)).then((res) => setAverage(res.data));
  };

  const openCreate = () => {
    setForm({ studentId: selectedStudent, subjectId: '', score: '', maxScore: '100', examName: '', examDate: '', remarks: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await gradeApi.create({
      studentId: Number(form.studentId),
      subjectId: Number(form.subjectId),
      score: Number(form.score),
      maxScore: Number(form.maxScore),
      examName: form.examName,
      examDate: form.examDate || undefined,
      remarks: form.remarks,
    });
    setShowModal(false);
    fetchGrades();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this grade?')) {
      await gradeApi.delete(id);
      fetchGrades();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{isStudent ? 'My Grades' : 'Grades'}</h1>
        <div className="flex gap-3 items-end">
          {!isStudent && (
            <div>
              <label className="block text-sm font-medium mb-1">Student</label>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary min-w-[200px]">
                <option value="">Select a student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
          )}
          {canEdit && selectedStudent && (
            <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition whitespace-nowrap">
              <Plus size={16} /> Add Grade
            </button>
          )}
        </div>
      </div>

      {!selectedStudent ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">Select a student to view grades.</div>
      ) : loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <>
          {average !== null && (
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Overall Average:</span>
              <span className={`text-2xl font-bold ${average >= 70 ? 'text-green-600' : average >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {average}%
              </span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Exam</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">%</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  {canEdit && <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{g.subjectName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{g.examName || '—'}</td>
                    <td className="px-4 py-3 text-center">{g.score}/{g.maxScore}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        (g.percentage ?? 0) >= 70 ? 'bg-green-50 text-green-700' :
                        (g.percentage ?? 0) >= 50 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {g.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{g.examDate || '—'}</td>
                    {canEdit && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(g.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-md"><Trash2 size={14} /></button>
                      </td>
                    )}
                  </tr>
                ))}
                {grades.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No grades recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Add Grade</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select required value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select subject</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Score</label>
                  <input required type="number" step="0.01" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Score</label>
                  <input required type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Exam Name</label>
                  <input value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Midterm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Exam Date</label>
                  <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-accent transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
