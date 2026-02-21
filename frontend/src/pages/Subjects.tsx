import { useEffect, useState } from 'react';
import { subjectApi } from '../api/services';
import { Subject } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const fetchSubjects = () => {
    setLoading(true);
    subjectApi.getAll().then((res) => setSubjects(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubjects(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '' }); setShowModal(true); };
  const openEdit = (s: Subject) => { setEditing(s); setForm({ name: s.name, code: s.code || '', description: s.description || '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { await subjectApi.update(editing.id, form); } else { await subjectApi.create(form); }
    setShowModal(false);
    fetchSubjects();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) { await subjectApi.delete(id); fetchSubjects(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
            <Plus size={16} /> Add Subject
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                {isAdmin && <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.code || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.description || '—'}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-accent rounded-md mr-1"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-md"><Trash2 size={14} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No subjects found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Subject' : 'Add Subject'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. MATH101" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-accent transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
