import { useEffect, useState } from 'react';
import { classApi, teacherApi } from '../api/services';
import { SchoolClass, Teacher } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react';

export default function Classes() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [form, setForm] = useState({ name: '', grade: '', section: '', homeroomTeacherId: '' });

  const isAdmin = user?.role === 'ADMIN';

  const fetchClasses = () => {
    setLoading(true);
    classApi.getAll().then((res) => setClasses(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
    teacherApi.getAll().then((res) => setTeachers(res.data));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', grade: '', section: '', homeroomTeacherId: '' });
    setShowModal(true);
  };

  const openEdit = (c: SchoolClass) => {
    setEditing(c);
    setForm({ name: c.name, grade: c.grade || '', section: c.section || '', homeroomTeacherId: c.homeroomTeacherId?.toString() || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, homeroomTeacherId: form.homeroomTeacherId ? Number(form.homeroomTeacherId) : undefined };
    if (editing) {
      await classApi.update(editing.id, payload);
    } else {
      await classApi.create(payload);
    }
    setShowModal(false);
    fetchClasses();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await classApi.delete(id);
      fetchClasses();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
            <Plus size={16} /> Add Class
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{c.name}</h3>
                  {c.grade && <p className="text-sm text-muted-foreground">Grade: {c.grade}{c.section ? ` - ${c.section}` : ''}</p>}
                  {c.homeroomTeacherName && <p className="text-sm mt-1">Homeroom: {c.homeroomTeacherName}</p>}
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-accent rounded-md"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-md"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                <Users size={14} />
                <span>{c.studentCount} students</span>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">No classes found.</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Class' : 'Add Class'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Grade 10-A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Grade</label>
                  <input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Section</label>
                  <input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Homeroom Teacher</label>
                <select value={form.homeroomTeacherId} onChange={(e) => setForm({ ...form, homeroomTeacherId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary">
                  <option value="">None</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
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
