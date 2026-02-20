import { useEffect, useState } from 'react';
import { studentApi, gradeApi, attendanceApi } from '../api/services';
import { Student, Grade, Attendance } from '../types';
import { useAuth } from '../context/AuthContext';
import { User, BookOpen, Calendar, TrendingUp } from 'lucide-react';

export default function MyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.studentId) {
      studentApi.getMe()
        .then((res) => {
          setProfile(res.data);
          return loadStudentData(res.data.id);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      studentApi.getById(user.studentId)
        .then((res) => {
          setProfile(res.data);
          return loadStudentData(user.studentId!);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const loadStudentData = async (studentId: number) => {
    try {
      const [gradesRes, avgRes, attRes] = await Promise.all([
        gradeApi.getByStudent(studentId),
        gradeApi.getStudentAverage(studentId),
        attendanceApi.getByStudent(studentId),
      ]);
      setGrades(gradesRes.data);
      setAverage(avgRes.data);
      setAttendance(attRes.data);
    } catch {}
  };

  const attendanceRate = attendance.length > 0
    ? Math.round((attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 1000) / 10
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 animate-pulse h-48" />
        <div className="bg-white rounded-2xl p-8 border border-gray-100 animate-pulse h-64" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-[#8a94a6]">
        Your student profile has not been linked yet. Please contact your administrator.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[1.75rem] font-bold text-gray-900 tracking-tight">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-[#8a94a6]">{profile.email}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <span className="text-[#8a94a6]">Class: <span className="font-medium text-gray-900">{profile.className || 'Unassigned'}</span></span>
              {profile.dateOfBirth && <span className="text-[#8a94a6]">DOB: <span className="font-medium text-gray-900">{profile.dateOfBirth}</span></span>}
              {profile.guardianName && <span className="text-[#8a94a6]">Guardian: <span className="font-medium text-gray-900">{profile.guardianName}</span></span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-blue-500" />
            <p className="text-xs text-[#8a94a6] font-medium">Overall Average</p>
          </div>
          <p className={`text-3xl font-bold ${average !== null && average >= 70 ? 'text-green-600' : average !== null && average >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {average !== null ? `${average}%` : '—'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-green-500" />
            <p className="text-xs text-[#8a94a6] font-medium">Attendance Rate</p>
          </div>
          <p className={`text-3xl font-bold ${attendanceRate >= 75 ? 'text-green-600' : 'text-red-600'}`}>
            {attendanceRate}%
          </p>
          <p className="text-xs text-[#8a94a6] mt-1">{attendance.length} days recorded</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-purple-500" />
            <p className="text-xs text-[#8a94a6] font-medium">Grades Recorded</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{grades.length}</p>
        </div>
      </div>

      {/* Recent Grades */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">My Grades</h2>
        {grades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[#8a94a6]">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-[#8a94a6]">Exam</th>
                  <th className="text-center px-4 py-3 font-medium text-[#8a94a6]">Score</th>
                  <th className="text-center px-4 py-3 font-medium text-[#8a94a6]">%</th>
                  <th className="text-left px-4 py-3 font-medium text-[#8a94a6]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{g.subjectName}</td>
                    <td className="px-4 py-3 text-[#8a94a6]">{g.examName || '—'}</td>
                    <td className="px-4 py-3 text-center">{g.score}/{g.maxScore}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        (g.percentage ?? 0) >= 70 ? 'bg-green-50 text-green-700' :
                        (g.percentage ?? 0) >= 50 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {g.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8a94a6]">{g.examDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#8a94a6] text-center py-4">No grades recorded yet.</p>
        )}
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Recent Attendance</h2>
        {attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[#8a94a6]">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-[#8a94a6]">Class</th>
                  <th className="text-left px-4 py-3 font-medium text-[#8a94a6]">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-[#8a94a6]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendance.slice(0, 20).map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{a.date}</td>
                    <td className="px-4 py-3 text-[#8a94a6]">{a.className}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        a.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        a.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                        a.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8a94a6]">{a.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#8a94a6] text-center py-4">No attendance records yet.</p>
        )}
      </div>
    </div>
  );
}
