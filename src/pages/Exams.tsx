import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, ClipboardList, Clock, Loader2, BookOpen, School, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Exams() {
  const { user, token } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/exams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExams(await res.json());
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ujian Online</h1>
          <p className="text-slate-500 text-sm">Kerjakan ujian dan lihat hasil penilaian Anda.</p>
        </div>
        {user?.role !== 'student' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            Buat Ujian
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          </div>
        ) : exams.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-200">
            Belum ada ujian yang tersedia.
          </div>
        ) : (
          exams.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{e.title}</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <BookOpen className="w-3 h-3" />
                  {e.subject_name}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <School className="w-3 h-3" />
                  {e.class_name}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {e.duration} Menit
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                {user?.role === 'student' ? (
                  <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Mulai Ujian
                  </button>
                ) : (
                  <button className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                    Lihat Hasil
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
