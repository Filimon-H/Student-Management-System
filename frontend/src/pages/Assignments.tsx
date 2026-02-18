import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { assignmentApi, termApi, teacherApi, classApi, subjectApi } from '../api/services';
import { TeacherAssignment, Term, Teacher, SchoolClass, Subject } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Assignments() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [terms, setTerms] = useState<Term[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ teacherId: '', classId: '', subjectId: '', termId: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([termApi.getAll(), teacherApi.getAll(), classApi.getAll(), subjectApi.getAll()])
      .then(([t, te, c, s]) => {
        setTerms(t.data);
        setTeachers(te.data);
        setClasses(c.data);
        setSubjects(s.data);
        const active = t.data.find(x => x.isActive);
        if (active) { setSelectedTerm(active.id); setForm(f => ({ ...f, termId: String(active.id) })); }
      })
      .catch(() => setError('Failed to load data'));
  }, []);

  useEffect(() => {
    if (selectedTerm) loadAssignments(Number(selectedTerm));
  }, [selectedTerm]);

  async function loadAssignments(termId: number) {
    setLoading(true);
    try {
      const res = await assignmentApi.getByTerm(termId);
      setAssignments(res.data);
    } catch { setError('Failed to load assignments'); }
    finally { setLoading(false); }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    try {
      await assignmentApi.assign({
        teacherId: Number(form.teacherId),
        classId: Number(form.classId),
        subjectId: Number(form.subjectId),
        termId: Number(form.termId),
      });
      setShowForm(false);
      if (selectedTerm) loadAssignments(Number(selectedTerm));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this assignment?')) return;
    try {
      await assignmentApi.delete(id);
      if (selectedTerm) loadAssignments(Number(selectedTerm));
    } catch { setError('Failed to remove assignment'); }
  }

  const filtered = assignments.filter(a =>
    !search ||
    a.teacherName?.toLowerCase().includes(search.toLowerCase()) ||
    a.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
    a.className?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Assign teachers to classes and subjects per term</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add Assignment
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
              placeholder="Search teacher, class, or subject..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
            <BookOpen size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">{filtered.length} assignment{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {selectedTerm ? 'No assignments for this term.' : 'Select a term to view assignments.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Teacher</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Class</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Subject</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Term</th>
                  {isAdmin && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{a.teacherName}</td>
                    <td className="px-5 py-3 text-gray-600">{a.className}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        <BookOpen size={11} />{a.subjectName}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{a.termName}</td>
                    {isAdmin && (
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Teacher Assignment</h2>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.termId} onChange={e => setForm(f => ({ ...f, termId: e.target.value }))} required>
                  <option value="">Select term</option>
                  {terms.map(t => <option key={t.id} value={t.id}>{t.name} ({t.academicYear})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))} required>
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} required>
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition-colors">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
