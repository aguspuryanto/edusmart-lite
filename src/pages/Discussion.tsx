import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, MessageSquare, Loader2, User, BookOpen, School, Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function Discussion() {
  const { user, token } = useAuth();
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', subject_id: '', class_id: '' });
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [discRes, clsRes, subRes] = await Promise.all([
        fetch('/api/discussions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDiscussions(await discRes.json());
      setClasses(await clsRes.json());
      setSubjects(await subRes.json());
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
          <h1 className="text-2xl font-bold text-slate-900">Forum Diskusi</h1>
          <p className="text-slate-500 text-sm">Berdiskusi dan bertanya seputar materi pelajaran.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Mulai Diskusi
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          </div>
        ) : discussions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-200">
            Belum ada diskusi yang dimulai.
          </div>
        ) : (
          discussions.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">
                      {d.subject_name}
                    </span>
                    <span className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded uppercase">
                      {d.class_name}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{d.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{d.content}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {d.author_name.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Oleh {d.author_name} • {new Date(d.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <button className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
                      Balas Diskusi <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
