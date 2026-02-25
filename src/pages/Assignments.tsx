import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, ClipboardList, Download, Loader2, BookOpen, School, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export default function Assignments() {
  const { user, token } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    class_id: '',
    deadline: '',
    is_draft: false
  });

  const fetchData = async () => {
    try {
      const [assRes, clsRes, subRes] = await Promise.all([
        fetch('/api/assignments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAssignments(await assRes.json());
      setClasses(await clsRes.json());
      setSubjects(await subRes.json());
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ title: '', description: '', subject_id: '', class_id: '', deadline: '', is_draft: false });
        setShowModal(false);
        fetchData();
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tugas Siswa</h1>
          <p className="text-slate-500 text-sm">Kelola tugas dan pengumpulan jawaban.</p>
        </div>
        {user?.role !== 'student' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            Tambah Tugas
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-200">
            Belum ada tugas yang tersedia.
          </div>
        ) : (
          assignments.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group relative"
            >
              {a.is_draft === 1 && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded uppercase tracking-wider">
                  Draft
                </div>
              )}
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{a.title}</h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{a.description || 'Tidak ada deskripsi'}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <BookOpen className="w-3 h-3" />
                  {a.subject_name}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <School className="w-3 h-3" />
                  {a.class_name}
                </div>
                <div className="flex items-center gap-2 text-xs text-red-500 font-bold">
                  <Calendar className="w-3 h-3" />
                  Deadline: {new Date(a.deadline).toLocaleDateString('id-ID')}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {a.teacher_name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">{a.teacher_name}</span>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all">
                  {user?.role === 'student' ? 'Kumpulkan' : 'Lihat Hasil'}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[90vh]"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6">Tambah Tugas Baru</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Tugas</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Judul tugas"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px]"
                  placeholder="Tulis instruksi tugas..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mata Pelajaran</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  >
                    <option value="">Pilih Mapel</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
              <div className="flex items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_draft: !formData.is_draft })}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.is_draft ? 'bg-amber-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_draft ? 'left-7' : 'left-1'}`} />
                </button>
                <span className="text-sm font-medium text-slate-600">Simpan sebagai draft</span>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
