import { useEffect, useState } from 'react';
import { studentApi, classApi } from '../api/services';
import { Student, SchoolClass } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', dateOfBirth: '', address: '', guardianName: '', guardianPhone: '', classId: '' });

  const isAdmin = user?.role === 'ADMIN';

  const fetchStudents = () => {
    setLoading(true);
    studentApi.getAll()
      .then((res) => setStudents(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
    classApi.getAll().then((res) => setClasses(res.data));
  }, []);

  const filtered = search
    ? students.filter((s) =>
        `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
      )
    : students;

  const openCreate = () => {
    setEditing(null);
    setForm({ firstName: '', lastName: '', email: '', dateOfBirth: '', address: '', guardianName: '', guardianPhone: '', classId: '' });
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({
      firstName: s.firstName, lastName: s.lastName, email: s.email,
      dateOfBirth: s.dateOfBirth || '', address: s.address || '',
      guardianName: s.guardianName || '', guardianPhone: s.guardianPhone || '',
      classId: s.classId?.toString() || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, classId: form.classId ? Number(form.classId) : undefined };
    if (editing) {
      await studentApi.update(editing.id, payload);
    } else {
      await studentApi.create(payload);
    }
    setShowModal(false);
    fetchStudents();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      await studentApi.delete(id);
      fetchStudents();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          {isAdmin && (
            <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition whitespace-nowrap">
              <Plus size={16} /> Add Student
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Guardian</th>
                  {isAdmin && <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3">{s.className || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.guardianName || '—'}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-accent rounded-md mr-1"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-md"><Trash2 size={14} /></button>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Student' : 'Add Student'}</h2>
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
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary">
                    <option value="">No class</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Guardian Name</label>
                  <input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Guardian Phone</label>
                  <input value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
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
