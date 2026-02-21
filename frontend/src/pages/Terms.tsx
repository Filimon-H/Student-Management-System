import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, Calendar } from 'lucide-react';
import { termApi } from '../api/services';
import { Term } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Terms() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Term | null>(null);
  const [form, setForm] = useState({ name: '', academicYear: '', startDate: '', endDate: '', isActive: false });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await termApi.getAll();
      setTerms(res.data);
    } catch { setError('Failed to load terms'); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', academicYear: '', startDate: '', endDate: '', isActive: false });
    setShowForm(true);
  }

  function openEdit(t: Term) {
    setEditing(t);
    setForm({ name: t.name, academicYear: t.academicYear, startDate: t.startDate, endDate: t.endDate, isActive: t.isActive });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await termApi.update(editing.id, form);
      } else {
        await termApi.create(form);
      }
      setShowForm(false);
      load();
    } catch { setError('Failed to save term'); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this term?')) return;
    try { await termApi.delete(id); load(); }
    catch { setError('Failed to delete term'); }
  }

  async function handleActivate(id: number) {
    try { await termApi.activate(id); load(); }
    catch { setError('Failed to activate term'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terms / Semesters</h1>
          <p className="text-sm text-gray-500 mt-1">Manage academic terms and semesters</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add Term
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {terms.map(t => (
          <div key={t.id} className={`bg-white rounded-xl shadow-sm border-2 p-5 ${t.isActive ? 'border-green-400' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" />
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  {t.isActive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1">{t.academicYear}</p>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between"><span className="text-gray-400">Start</span><span>{t.startDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">End</span><span>{t.endDate}</span></div>
            </div>
            {isAdmin && !t.isActive && (
              <button onClick={() => handleActivate(t.id)} className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-green-600 border border-green-200 rounded-lg py-1.5 hover:bg-green-50 transition-colors">
                <CheckCircle size={14} /> Set as Active
              </button>
            )}
          </div>
        ))}
        {terms.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">No terms found. Create your first term.</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit Term' : 'New Term'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term Name</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Semester 1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} placeholder="e.g. 2024-2025" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
                Set as active term
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
