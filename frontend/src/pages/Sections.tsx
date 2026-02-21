import { useEffect, useState } from 'react';
import { sectionApi, classApi, teacherApi } from '../api/services';
import { Section, SchoolClass, Teacher } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function Sections() {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [form, setForm] = useState({ name: '', classId: '', teacherId: '', active: true });
  const [filterClassId, setFilterClassId] = useState<string>('');

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [secRes, clsRes, tchRes] = await Promise.all([
        sectionApi.getAll(),
        classApi.getAll(),
        teacherApi.getAll(),
      ]);
      setSections(secRes.data);
      setClasses(clsRes.data);
      setTeachers(tchRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filterClassId
    ? sections.filter((s) => s.classId === Number(filterClassId))
    : sections;

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', classId: filterClassId || '', teacherId: '', active: true });
    setShowModal(true);
  };

  const openEdit = (s: Section) => {
    setEditing(s);
    setForm({
      name: s.name,
      classId: String(s.classId),
      teacherId: s.teacherId ? String(s.teacherId) : '',
      active: s.active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      classId: Number(form.classId),
      teacherId: form.teacherId ? Number(form.teacherId) : undefined,
      active: form.active,
    };
    if (editing) {
      await sectionApi.update(editing.id, payload);
    } else {
      await sectionApi.create(payload);
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this section?')) {
      await sectionApi.delete(id);
      fetchData();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sections</h1>
        <div className="flex items-center gap-3">
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {isAdmin && (
            <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
              <Plus size={16} /> Add Section
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Section</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Students</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                {isAdmin && <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.className}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.teacherName || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.studentCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-accent rounded-md mr-1"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-md"><Trash2 size={14} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No sections found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Section' : 'Add Section'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Section Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. A, B, C" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select required value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class Teacher (optional)</label>
                <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary">
                  <option value="">No Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>
              {editing && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
                  <label htmlFor="active" className="text-sm font-medium">Active</label>
                </div>
              )}
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
