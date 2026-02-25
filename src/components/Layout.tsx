import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap, 
  FileText, 
  ClipboardList, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut,
  Settings,
  School
} from 'lucide-react';
import { motion } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'teacher', 'student'] },
    { icon: School, label: 'Kelas', path: '/classes', roles: ['admin'] },
    { icon: BookOpen, label: 'Mapel', path: '/subjects', roles: ['admin'] },
    { icon: Users, label: 'Pengajar', path: '/teachers', roles: ['admin'] },
    { icon: GraduationCap, label: 'Siswa', path: '/students', roles: ['admin'] },
    { icon: FileText, label: 'Materi', path: '/materials', roles: ['admin', 'teacher', 'student'] },
    { icon: ClipboardList, label: 'Tugas', path: '/assignments', roles: ['admin', 'teacher', 'student'] },
    { icon: FileText, label: 'Ujian', path: '/exams', roles: ['admin', 'teacher', 'student'] },
    { icon: MessageSquare, label: 'Chat', path: '/chat', roles: ['admin', 'teacher', 'student'] },
    { icon: BookOpen, label: 'Diskusi', path: '/discussions', roles: ['admin', 'teacher', 'student'] },
    { icon: Bell, label: 'Pengumuman', path: '/announcements', roles: ['admin', 'teacher', 'student'] },
    { icon: User, label: 'Profil', path: '/profile', roles: ['admin', 'teacher', 'student'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            EduSmart
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-800">
            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
