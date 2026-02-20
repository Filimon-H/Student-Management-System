import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/services';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { Users, GraduationCap, School, TrendingUp, CheckCircle, UserPlus } from 'lucide-react';

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function AttendanceChart({ data }: { data: number[] }) {
  const w = 700, h = 220, pad = { top: 20, right: 20, bottom: 36, left: 20 };
  const hasData = data.some(v => v > 0);
  const minV = hasData ? Math.min(...data.filter(v => v > 0)) - 10 : 0;
  const maxV = hasData ? Math.max(...data) + 5 : 100;
  const pts = data.map((v, i) => {
    const x = pad.left + (i / (data.length - 1)) * (w - pad.left - pad.right);
    const y = v > 0
      ? pad.top + (1 - (v - minV) / (maxV - minV)) * (h - pad.top - pad.bottom)
      : h - pad.bottom;
    return { x, y, v };
  });
  const activePts = pts.filter(p => p.v > 0);
  const pathD = activePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = activePts.length > 1
    ? `${pathD} L ${activePts[activePts.length - 1].x} ${h - pad.bottom} L ${activePts[0].x} ${h - pad.bottom} Z`
    : '';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 220 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#1a1a2e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = pad.top + t * (h - pad.top - pad.bottom);
        return <line key={i} x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />;
      })}
      {areaD && <path d={areaD} fill="url(#areaGrad)" />}
      {activePts.length > 1 && (
        <path d={pathD} fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      )}
      {pts.map((p, i) => (
        <g key={i}>
          {p.v > 0 && <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#1a1a2e" strokeWidth="2.5" />}
          {p.v > 0 && (
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fill="#6b7a99" fontFamily="inherit">
              {p.v}%
            </text>
          )}
          <text x={p.x} y={h - 6} textAnchor="middle" fontSize="11" fill="#aab0bc" fontFamily="inherit">
            {weekDays[i]}
          </text>
        </g>
      ))}
      {!hasData && (
        <text x={w / 2} y={h / 2} textAnchor="middle" fontSize="13" fill="#aab0bc">
          No attendance data for this week
        </text>
      )}
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Total Students',
      value: stats?.totalStudents ?? 0,
      icon: Users,
      trend: `${stats?.totalEnrollments ?? 0} enrolled`,
      trendIcon: <CheckCircle size={13} />,
      trendColor: 'text-blue-500',
    },
    {
      label: 'Active Teachers',
      value: stats?.totalTeachers ?? 0,
      icon: GraduationCap,
      trend: `${stats?.totalSubjects ?? 0} subjects taught`,
      trendIcon: <CheckCircle size={13} />,
      trendColor: 'text-green-500',
    },
    {
      label: 'Total Classes',
      value: stats?.totalClasses ?? 0,
      icon: School,
      trend: `${stats?.totalAssessments ?? 0} assessments`,
      trendIcon: <CheckCircle size={13} />,
      trendColor: 'text-purple-500',
    },
    {
      label: 'Attendance Rate',
      value: stats ? `${stats.attendanceRate}%` : '—',
      icon: TrendingUp,
      trend: stats && stats.attendanceRate >= 75 ? 'Healthy' : 'Needs attention',
      trendIcon: stats && stats.attendanceRate >= 75 ? <TrendingUp size={13} /> : <TrendingUp size={13} />,
      trendColor: stats && stats.attendanceRate >= 75 ? 'text-green-500' : 'text-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-[1.75rem] font-bold text-gray-900 tracking-tight">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-[#8a94a6] mt-1 text-sm">Here's what's happening in your school today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-28" />
            ))
          : cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#8a94a6] font-medium">{card.label}</p>
                    <Icon size={16} className="text-[#aab0bc]" />
                  </div>
                  <p className="text-[2rem] font-bold text-gray-900 leading-none mb-3">{card.value}</p>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${card.trendColor}`}>
                    {card.trendIcon}
                    <span>{card.trend}</span>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Weekly Attendance Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-base font-bold text-gray-900">Weekly Attendance</h2>
            <p className="text-xs text-[#8a94a6] mt-0.5">Average daily presence across all grades</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
            >
              Export PDF
            </button>
            <button
              onClick={() => navigate('/attendance')}
              className="text-xs text-white bg-gray-900 rounded-lg px-3 py-1.5 hover:bg-gray-800 transition font-medium"
            >
              Details
            </button>
          </div>
        </div>
        <AttendanceChart data={stats?.weeklyAttendance ?? [0, 0, 0, 0, 0, 0, 0]} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Students */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Recent Students</h2>
            <button
              onClick={() => navigate('/students')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-1">
            {stats?.recentStudents && stats.recentStudents.length > 0 ? (
              stats.recentStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <UserPlus size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-[#8a94a6]">{s.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full text-green-600 bg-green-50 border border-green-200">
                    {s.className}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#8a94a6] py-4 text-center">No students yet.</p>
            )}
          </div>
        </div>

        {/* Staff Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Staff Overview</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#8a94a6]">Total Teachers</span>
              <span className="font-bold text-gray-900">{stats?.totalTeachers ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#8a94a6]">Total Subjects</span>
              <span className="font-bold text-gray-900">{stats?.totalSubjects ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#8a94a6]">Total Assessments</span>
              <span className="font-bold text-gray-900">{stats?.totalAssessments ?? 0}</span>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-[#8a94a6] mb-2">Quick Actions</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/students')}
                className="w-full text-left text-sm font-medium text-gray-900 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition"
              >
                Manage Students
              </button>
              <button
                onClick={() => navigate('/grades')}
                className="w-full text-left text-sm font-medium text-gray-900 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition"
              >
                View Grades
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
