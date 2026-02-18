import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, AlertCircle } from 'lucide-react';
import { enrollmentApi, termApi, studentApi, classApi } from '../api/services';
import { Enrollment, Term, Student, SchoolClass } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Enrollments() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [terms, setTerms] = useState<Term[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', classId: '', termId: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([termApi.getAll(), studentApi.getAll(), classApi.getAll()])
      .then(([t, s, c]) => {
        setTerms(t.data);
        setStudents(s.data);
        setClasses(c.data);
        const active = t.data.find(x => x.isActive);
        if (active) { setSelectedTerm(active.id); setForm(f => ({ ...f, termId: String(active.id) })); }
      })
      .catch(() => setError('Failed to load data'));
  }, []);

  useEffect(() => {
    if (selectedTerm) loadEnrollments(Number(selectedTerm));
  }, [selectedTerm]);

  async function loadEnrollments(termId: number) {
    setLoading(true);
    try {
      const res = await enrollmentApi.getByTerm(termId);
      setEnrollments(res.data);
    } catch { setError('Failed to load enrollments'); }
    finally { setLoading(false); }
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!form.studentId || !form.classId || !form.termId) return;
    try {
      await enrollmentApi.enroll({
        studentId: Number(form.studentId),
        classId: Number(form.classId),
        termId: Number(form.termId),
        status: 'ACTIVE',
      });
      setShowForm(false);
      if (selectedTerm) loadEnrollments(Number(selectedTerm));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll student');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this enrollment?')) return;
    try {
      await enrollmentApi.delete(id);
      if (selectedTerm) loadEnrollments(Number(selectedTerm));
    } catch { setError('Failed to remove enrollment'); }
  }

  const filtered = enrollments.filter(e =>
    !search || e.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    e.className?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    TRANSFERRED: 'bg-yellow-100 text-yellow-700',
    DROPPED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage student class enrollments per term</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Enroll Student
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle size={16} />{error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Term</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedTerm} onChange={e => setSelectedTerm(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select a term</option>
              {terms.map(t => <option key={t.id} value={t.id}>{t.name} ({t.academicYear}){t.isActive ? ' ★' : ''}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search student or class..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
            <Users size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">{filtered.length} enrollment{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {selectedTerm ? 'No enrollments for this term.' : 'Select a term to view enrollments.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Student</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Class</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Term</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                  {isAdmin && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{e.studentName}</td>
                    <td className="px-5 py-3 text-gray-600">{e.className}</td>
                    <td className="px-5 py-3 text-gray-600">{e.termName}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[e.status] || 'bg-gray-100 text-gray-600'}`}>
                        {e.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enroll Student</h2>
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.termId} onChange={e => setForm(f => ({ ...f, termId: e.target.value }))} required>
                  <option value="">Select term</option>
                  {terms.map(t => <option key={t.id} value={t.id}>{t.name} ({t.academicYear})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} required>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} required>
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition-colors">Enroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
