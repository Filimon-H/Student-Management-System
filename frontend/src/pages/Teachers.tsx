import { useEffect, useState } from 'react';
import { teacherApi, subjectApi } from '../api/services';
import { Teacher, Subject } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function Teachers() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', specialization: '', subjectIds: [] as number[] });

  const isAdmin = user?.role === 'ADMIN';

  const fetchTeachers = () => {
    setLoading(true);
    teacherApi.getAll().then((res) => setTeachers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
    subjectApi.getAll().then((res) => setSubjects(res.data));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ firstName: '', lastName: '', email: '', phone: '', specialization: '', subjectIds: [] });
    setShowModal(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({
      firstName: t.firstName, lastName: t.lastName, email: t.email,
      phone: t.phone || '', specialization: t.specialization || '',
      subjectIds: t.subjectIds || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await teacherApi.update(editing.id, form);
    } else {
      await teacherApi.create(form);
    }
    setShowModal(false);
    fetchTeachers();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await teacherApi.delete(id);
      fetchTeachers();
    }
  };

  const toggleSubject = (id: number) => {
    setForm((prev) => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(id)
        ? prev.subjectIds.filter((s) => s !== id)
        : [...prev.subjectIds, id],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teachers</h1>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
            <Plus size={16} /> Add Teacher
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((t) => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{t.firstName} {t.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{t.email}</p>
                  {t.specialization && <p className="text-sm mt-1">Specialization: {t.specialization}</p>}
                  {t.phone && <p className="text-sm text-muted-foreground">{t.phone}</p>}
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-accent rounded-md"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-md"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              {t.subjectNames && t.subjectNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {Array.from(t.subjectNames).map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {teachers.length === 0 && (
            <div className="col-span-full bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">No teachers found.</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Specialization</label>
                  <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              {subjects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Subjects</label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <button key={s.id} type="button" onClick={() => toggleSubject(s.id)}
                        className={`px-3 py-1 rounded-lg text-sm border transition ${form.subjectIds.includes(s.id) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'}`}>
                        {s.name}
                      </button>
                    ))}
                  </div>
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
