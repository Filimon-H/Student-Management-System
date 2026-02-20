import { useState, useEffect } from 'react';
import { AlertTriangle, Download, CheckCircle, XCircle, Clock, Calendar, Users } from 'lucide-react';
import { attendanceApi, attendanceSummaryApi, classApi, studentApi } from '../api/services';
import { Attendance, AttendanceSummary, SchoolClass, Student } from '../types';
import { useAuth } from '../context/AuthContext';

const STATUS_ICONS: Record<string, JSX.Element> = {
  PRESENT: <CheckCircle size={14} className="text-green-500" />,
  ABSENT: <XCircle size={14} className="text-red-500" />,
  LATE: <Clock size={14} className="text-yellow-500" />,
  EXCUSED: <CheckCircle size={14} className="text-blue-400" />,
};

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-700',
  LATE: 'bg-yellow-100 text-yellow-700',
  EXCUSED: 'bg-blue-100 text-blue-700',
};

type ViewMode = 'daily' | 'monthly';

export default function AttendancePage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  // Student-only state
  const [myAttendance, setMyAttendance] = useState<Attendance[]>([]);
  const [myLoading, setMyLoading] = useState(false);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  // Daily view state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyAttendance, setDailyAttendance] = useState<Attendance[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);

  // Monthly view state
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [monthlySummary, setMonthlySummary] = useState<AttendanceSummary[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  // Mark attendance state
  const [markingStatus, setMarkingStatus] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isStudent && user?.studentId) {
      setMyLoading(true);
      attendanceApi.getByStudent(user.studentId)
        .then(res => setMyAttendance(res.data))
        .catch(() => setError('Failed to load attendance'))
        .finally(() => setMyLoading(false));
      return;
    }
    Promise.all([classApi.getAll(), studentApi.getAll()])
      .then(([c, s]) => { setClasses(c.data); setStudents(s.data); })
      .catch(() => setError('Failed to load data'));
  }, []);

  useEffect(() => {
    if (selectedClass && viewMode === 'daily') loadDailyAttendance();
  }, [selectedClass, selectedDate, viewMode]);

  useEffect(() => {
    if (selectedClass && viewMode === 'monthly') loadMonthlySummary();
  }, [selectedClass, selectedYear, selectedMonth, viewMode]);

  async function loadDailyAttendance() {
    setDailyLoading(true);
    try {
      const res = await attendanceApi.getByClassAndDate(Number(selectedClass), selectedDate);
      setDailyAttendance(res.data);
      const statusMap: Record<number, string> = {};
      res.data.forEach(a => { statusMap[a.studentId] = a.status; });
      setMarkingStatus(statusMap);
    } catch { setError('Failed to load attendance'); }
    finally { setDailyLoading(false); }
  }

  async function loadMonthlySummary() {
    setMonthlyLoading(true);
    try {
      const res = await attendanceSummaryApi.getMonthlySummary(Number(selectedClass), selectedYear, selectedMonth);
      setMonthlySummary(res.data);
    } catch { setError('Failed to load monthly summary'); }
    finally { setMonthlyLoading(false); }
  }

  async function handleSaveAttendance() {
    if (!selectedClass) return;
    setSaving(true);
    setError('');
    const classStudents = students.filter(s => s.classId === Number(selectedClass));
    const toMark = classStudents
      .filter(s => markingStatus[s.id] && !dailyAttendance.find(a => a.studentId === s.id))
      .map(s => ({ studentId: s.id, classId: Number(selectedClass), date: selectedDate, status: markingStatus[s.id] as any }));
    const toUpdate = dailyAttendance
      .filter(a => markingStatus[a.studentId] && markingStatus[a.studentId] !== a.status)
      .map(a => ({ id: a.id, status: markingStatus[a.studentId] as any }));
    try {
      if (toMark.length > 0) await attendanceApi.markBulk(toMark);
      for (const u of toUpdate) await attendanceApi.update(u.id!, { status: u.status });
      setSuccess('Attendance saved successfully');
      loadDailyAttendance();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to save attendance'); }
    finally { setSaving(false); }
  }

  async function handleExport() {
    try {
      const res = await attendanceSummaryApi.exportCsv(Number(selectedClass), selectedYear, selectedMonth);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${selectedYear}_${selectedMonth}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { setError('Failed to export CSV'); }
  }

  const classStudents = students.filter(s => s.classId === Number(selectedClass));
  const alertCount = monthlySummary.filter(s => s.lowAttendanceAlert).length;
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Student-only view
  if (isStudent) {
    const myPresent = myAttendance.filter(a => a.status === 'PRESENT').length;
    const myRate = myAttendance.length > 0 ? Math.round((myPresent / myAttendance.length) * 1000) / 10 : 0;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Your attendance records</p>
        </div>
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs text-gray-500 font-medium mb-1">Attendance Rate</p>
            <p className={`text-3xl font-bold ${myRate >= 75 ? 'text-green-600' : 'text-red-600'}`}>{myRate}%</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs text-gray-500 font-medium mb-1">Days Present</p>
            <p className="text-3xl font-bold text-green-600">{myPresent}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs text-gray-500 font-medium mb-1">Total Days</p>
            <p className="text-3xl font-bold text-gray-900">{myAttendance.length}</p>
          </div>
        </div>
        {/* Records */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {myLoading ? (
            <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : myAttendance.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No attendance records yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Class</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myAttendance.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-900">{a.date}</td>
                    <td className="px-5 py-3 text-gray-500">{a.className}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status]}`}>
                        {STATUS_ICONS[a.status]}{a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{a.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Track daily attendance and view monthly reports</p>
        </div>
        {viewMode === 'monthly' && selectedClass && (
          <button onClick={handleExport} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertTriangle size={15} />{error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle size={15} />{success}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedClass} onChange={e => setSelectedClass(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select a class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button onClick={() => setViewMode('daily')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'daily' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              Daily
            </button>
            <button onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              Monthly
            </button>
          </div>

          {viewMode === 'daily' ? (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
          ) : (
            <div className="flex gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                  {monthNames.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                <input type="number" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} min="2020" max="2099" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Low attendance alert banner */}
      {viewMode === 'monthly' && alertCount > 0 && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl">
          <AlertTriangle size={18} className="text-orange-500 flex-shrink-0" />
          <div>
            <span className="font-semibold">{alertCount} student{alertCount > 1 ? 's' : ''}</span> with attendance below 75% this month.
          </div>
        </div>
      )}

      {/* Daily View */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {!selectedClass ? (
            <div className="text-center py-16 text-gray-400">Select a class to mark attendance.</div>
          ) : dailyLoading ? (
            <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">{selectedDate} · {classStudents.length} students</span>
                </div>
                {canEdit && (
                  <button onClick={handleSaveAttendance} disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {saving ? 'Saving...' : 'Save Attendance'}
                  </button>
                )}
              </div>
              {classStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No students in this class.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Student</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {classStudents.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                        <td className="px-5 py-3">
                          {canEdit ? (
                            <div className="flex gap-2 flex-wrap">
                              {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(st => (
                                <button key={st} onClick={() => setMarkingStatus(prev => ({ ...prev, [s.id]: st }))}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    markingStatus[s.id] === st
                                      ? STATUS_COLORS[st] + ' border-transparent'
                                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                  }`}>
                                  {STATUS_ICONS[st]}{st}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[markingStatus[s.id]] || 'bg-gray-100 text-gray-500'}`}>
                              {STATUS_ICONS[markingStatus[s.id]]}{markingStatus[s.id] || 'Not marked'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}

      {/* Monthly View */}
      {viewMode === 'monthly' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {!selectedClass ? (
            <div className="text-center py-16 text-gray-400">Select a class to view monthly summary.</div>
          ) : monthlyLoading ? (
            <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
                <Users size={15} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {monthNames[selectedMonth - 1]} {selectedYear} · {monthlySummary.length} students
                </span>
              </div>
              {monthlySummary.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No attendance data for this period.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Student</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">Total</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">Present</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">Absent</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">Late</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">Rate</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {monthlySummary.map(s => (
                      <tr key={s.studentId} className={`hover:bg-gray-50 transition-colors ${s.lowAttendanceAlert ? 'bg-orange-50/50' : ''}`}>
                        <td className="px-5 py-3 font-medium text-gray-900">{s.studentName}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{s.totalDays}</td>
                        <td className="px-4 py-3 text-center text-green-600 font-medium">{s.presentDays}</td>
                        <td className="px-4 py-3 text-center text-red-600 font-medium">{s.absentDays}</td>
                        <td className="px-4 py-3 text-center text-yellow-600 font-medium">{s.lateDays}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${s.attendanceRate >= 75 ? 'bg-green-500' : 'bg-orange-500'}`}
                                style={{ width: `${Math.min(s.attendanceRate, 100)}%` }} />
                            </div>
                            <span className={`text-xs font-semibold ${s.attendanceRate >= 75 ? 'text-green-700' : 'text-orange-700'}`}>
                              {s.attendanceRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.lowAttendanceAlert && (
                            <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                              <AlertTriangle size={11} /> Low
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
