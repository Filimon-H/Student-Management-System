import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/services';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const weeklyData = [62, 68, 65, 74, 71, 82, 79];
const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function AttendanceChart() {
  const w = 700, h = 220, pad = { top: 20, right: 20, bottom: 36, left: 20 };
  const minV = Math.min(...weeklyData) - 5;
  const maxV = Math.max(...weeklyData) + 5;
  const pts = weeklyData.map((v, i) => {
    const x = pad.left + (i / (weeklyData.length - 1)) * (w - pad.left - pad.right);
    const y = pad.top + (1 - (v - minV) / (maxV - minV)) * (h - pad.top - pad.bottom);
    return { x, y, v };
  });
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${h - pad.bottom} L ${pts[0].x} ${h - pad.bottom} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 220 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#1a1a2e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = pad.top + t * (h - pad.top - pad.bottom);
        return <line key={i} x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />;
      })}
      {/* Area fill */}
      <path d={areaD} fill="url(#areaGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#1a1a2e" strokeWidth="2.5" />
      ))}
      {/* X labels */}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={h - 6} textAnchor="middle" fontSize="11" fill="#aab0bc" fontFamily="inherit">
          {weekDays[i]}
        </text>
      ))}
    </svg>
  );
}

const recentAdmissions = [
  { name: 'James Wilson', detail: 'Grade 10 • Applied 2h ago', status: 'In Review', statusColor: 'text-gray-500 bg-gray-100' },
  { name: 'Elena Rodriguez', detail: 'Grade 8 • Applied 5h ago', status: 'Accepted', statusColor: 'text-green-600 bg-green-50 border border-green-200' },
];

export default function Dashboard() {
  const { user } = useAuth();
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
      trend: '+12% vs last month',
      trendUp: true,
      trendColor: 'text-green-500',
    },
    {
      label: 'Active Teachers',
      value: stats?.totalTeachers ?? 0,
      trend: 'All systems online',
      trendUp: null,
      trendColor: 'text-blue-500',
    },
    {
      label: 'Total Classes',
      value: stats?.totalClasses ?? 0,
      trend: '48 invoices overdue',
      trendUp: false,
      trendColor: 'text-red-500',
    },
    {
      label: 'Attendance Rate',
      value: stats ? `${((stats.totalStudents > 0 ? 94.2 : 0))}%` : '—',
      trend: '+0.8% today',
      trendUp: true,
      trendColor: 'text-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
          : cards.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-sm transition">
                <p className="text-xs text-[#8a94a6] font-medium mb-2">{card.label}</p>
                <p className="text-[2rem] font-bold text-gray-900 leading-none mb-3">{card.value}</p>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${card.trendColor}`}>
                  {card.trendUp === true && <TrendingUp size={13} />}
                  {card.trendUp === false && <AlertTriangle size={13} />}
                  {card.trendUp === null && <CheckCircle size={13} />}
                  <span>{card.trend}</span>
                </div>
              </div>
            ))}
      </div>

      {/* Weekly Attendance Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-base font-bold text-gray-900">Weekly Attendance</h2>
            <p className="text-xs text-[#8a94a6] mt-0.5">Average daily presence across all grades</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
              Export PDF
            </button>
            <button className="text-xs text-white bg-gray-900 rounded-lg px-3 py-1.5 hover:bg-gray-800 transition font-medium">
              Details
            </button>
          </div>
        </div>
        <AttendanceChart />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Admissions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Recent Admissions</h2>
          <div className="space-y-1">
            {recentAdmissions.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText size={14} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                    <p className="text-xs text-[#8a94a6]">{a.detail}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${a.statusColor}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Staff Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#8a94a6]">Teachers on leave</span>
              <span className="font-bold text-gray-900">3</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#8a94a6]">Substitute coverage</span>
              <span className="font-bold text-gray-900">100%</span>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-[#8a94a6] mb-2">Upcoming Faculty Meeting</p>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm font-bold text-gray-900">Tomorrow at 9:00 AM</p>
              <p className="text-xs text-[#8a94a6] mt-0.5">Main Conference Hall</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
