import { useEffect, useState } from 'react';
import { attendanceApi, classApi, studentApi } from '../api/services';
import { Attendance as AttendanceType, SchoolClass, Student } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Attendance() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceType[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<Record<number, string>>({});

  const canMark = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'TEACHER';

  useEffect(() => {
    classApi.getAll().then((res) => setClasses(res.data));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      studentApi.getByClass(Number(selectedClass)).then((res) => setStudents(res.data));
      fetchAttendance();
    }
  }, [selectedClass]);

  const fetchAttendance = () => {
    if (!selectedClass || !selectedDate) return;
    setLoading(true);
    attendanceApi.getByClassAndDate(Number(selectedClass), selectedDate)
      .then((res) => {
        setRecords(res.data);
        const statusMap: Record<number, string> = {};
        res.data.forEach((r: AttendanceType) => { statusMap[r.studentId] = r.status; });
        setBulkStatus(statusMap);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAttendance(); }, [selectedDate]);

  const handleStatusChange = (studentId: number, status: string) => {
    setBulkStatus((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    const entries = students
      .filter((s) => bulkStatus[s.id] && !records.find((r) => r.studentId === s.id))
      .map((s) => ({
        studentId: s.id,
        classId: Number(selectedClass),
        date: selectedDate,
        status: bulkStatus[s.id] as AttendanceType['status'],
      }));

    if (entries.length > 0) {
      await attendanceApi.markBulk(entries);
      fetchAttendance();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary min-w-[200px]">
            <option value="">Select a class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {!selectedClass ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">Select a class to view attendance.</div>
      ) : loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Present</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Absent</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Late</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Excused</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s) => {
                const existing = records.find((r) => r.studentId === s.id);
                const currentStatus = bulkStatus[s.id] || '';
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                    {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                      <td key={status} className="px-4 py-3 text-center">
                        <input
                          type="radio"
                          name={`attendance-${s.id}`}
                          checked={currentStatus === status}
                          onChange={() => handleStatusChange(s.id, status)}
                          disabled={!canMark || !!existing}
                          className="w-4 h-4 text-primary"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No students in this class.</td></tr>
              )}
            </tbody>
          </table>

          {canMark && students.length > 0 && (
            <div className="p-4 border-t flex justify-end">
              <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">
                Save Attendance
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
