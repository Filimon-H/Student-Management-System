import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  ClipboardCheck,
  FileBarChart,
  LogOut,
  Menu,
  X,
  Calendar,
  UserCheck,
  ClipboardList,
  Award,
  UserCircle,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT'] },
  { label: 'My Profile', path: '/my-profile', icon: UserCircle, roles: ['STUDENT'] },
  { label: 'Students', path: '/students', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { label: 'Teachers', path: '/teachers', icon: GraduationCap, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Classes', path: '/classes', icon: School, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { label: 'Sections', path: '/sections', icon: School, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Terms', path: '/terms', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { label: 'Enrollments', path: '/enrollments', icon: UserCheck, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Assignments', path: '/assignments', icon: ClipboardList, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Attendance', path: '/attendance', icon: ClipboardCheck, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Grades', path: '/grades', icon: FileBarChart, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Smart Grades', path: '/smart-grades', icon: Award, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { label: 'Marksheet', path: '/marksheet', icon: FileBarChart, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    TEACHER: 'Teacher',
    STUDENT: 'Student',
    PARENT: 'Parent',
    ACCOUNTANT: 'Accountant',
    LIBRARIAN: 'Librarian',
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-[#eef0f5] rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap size={16} className="text-[#6b7a99]" />
        </div>
        <span className="text-[15px] font-bold text-gray-900 tracking-tight">School MS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-[#8a94a6] hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-gray-700' : 'text-[#aab0bc]'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#eef0f5] flex items-center justify-center text-[#6b7a99] text-xs font-bold flex-shrink-0">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-[#8a94a6]">{roleLabel[user?.role ?? ''] ?? user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-[#aab0bc] hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#eef0f5] rounded-lg flex items-center justify-center">
            <GraduationCap size={14} className="text-[#6b7a99]" />
          </div>
          <span className="text-sm font-bold text-gray-900">School MS</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-500">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-[210px] min-h-screen bg-white border-r border-gray-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[210px] bg-white border-r border-gray-100 lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen lg:mt-0 mt-14 overflow-auto">
        {/* Blue top border accent like in reference */}
        <div className="hidden lg:block h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 fixed top-0 left-[210px] right-0 z-30" />
        <div className="lg:pt-1">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
