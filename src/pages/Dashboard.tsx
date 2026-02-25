import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  BookOpen, 
  School, 
  FileText, 
  TrendingUp, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, classesRes, subjectsRes] = await Promise.all([
          fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const users = await usersRes.json();
        const classes = await classesRes.json();
        const subjects = await subjectsRes.json();

        setStats({
          students: users.filter((u: any) => u.role === 'student').length,
          teachers: users.filter((u: any) => u.role === 'teacher').length,
          classes: classes.length,
          subjects: subjects.length
        });
      } catch (err) {}
    };
    fetchStats();
  }, [token]);

  const cards = [
    { label: 'Total Siswa', value: stats.students, icon: Users, color: 'bg-blue-500', text: 'Siswa Terdaftar' },
    { label: 'Total Pengajar', value: stats.teachers, icon: TrendingUp, color: 'bg-emerald-500', text: 'Guru Aktif' },
    { label: 'Total Kelas', value: stats.classes, icon: School, color: 'bg-amber-500', text: 'Ruang Kelas' },
    { label: 'Mata Pelajaran', value: stats.subjects, icon: BookOpen, color: 'bg-indigo-500', text: 'Kurikulum' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Halo, {user?.name}! 👋</h1>
          <p className="text-slate-500 mt-1">Berikut adalah ringkasan aktivitas e-learning hari ini.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.color} text-white shadow-lg shadow-slate-200`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{card.label}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-slate-900">{card.value}</span>
              <span className="text-xs text-slate-400">{card.text}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Aktivitas Terbaru</h3>
              <button className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">Materi Baru: Matematika Diskrit</h4>
                    <p className="text-xs text-slate-500">Diunggah oleh Pak Budi • 2 jam yang lalu</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">14:20</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
            <h3 className="text-lg font-bold mb-2">Pengumuman Penting</h3>
            <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
              Ujian Tengah Semester akan dilaksanakan mulai tanggal 15 Maret 2026. Pastikan semua tugas sudah dikumpulkan.
            </p>
            <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all backdrop-blur-sm">
              Baca Selengkapnya
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Jadwal Hari Ini</h3>
            <div className="space-y-4">
              {[
                { time: '08:00 - 09:30', subject: 'Matematika', class: 'XII-IPA-1' },
                { time: '10:00 - 11:30', subject: 'Bahasa Inggris', class: 'XII-IPA-1' },
                { time: '13:00 - 14:30', subject: 'Fisika', class: 'XII-IPA-1' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-1 h-10 bg-indigo-500 rounded-full" />
                  <div>
                    <p className="text-xs font-bold text-indigo-600">{item.time}</p>
                    <p className="text-sm font-bold text-slate-900">{item.subject}</p>
                    <p className="text-xs text-slate-500">{item.class}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
