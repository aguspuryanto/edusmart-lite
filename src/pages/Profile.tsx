import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, School, Calendar, Edit2, Camera } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl shadow-lg"></div>
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-4xl">
                {user?.name.charAt(0)}
              </div>
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-lg text-slate-600 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="pb-4">
            <h1 className="text-3xl font-bold text-slate-900">{user?.name}</h1>
            <p className="text-slate-500 font-medium capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Informasi Pribadi</h3>
              <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
                <Edit2 className="w-4 h-4" />
                Edit Profil
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <div className="flex items-center gap-3 text-slate-700 font-medium">
                  <User className="w-4 h-4 text-slate-400" />
                  {user?.name}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
                <div className="flex items-center gap-3 text-slate-700 font-medium">
                  <Shield className="w-4 h-4 text-slate-400" />
                  {user?.username}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                <div className="flex items-center gap-3 text-slate-700 font-medium">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user?.username}@edusmart.com
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peran</label>
                <div className="flex items-center gap-3 text-slate-700 font-medium capitalize">
                  <Shield className="w-4 h-4 text-slate-400" />
                  {user?.role}
                </div>
              </div>
              {user?.role === 'student' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kelas</label>
                  <div className="flex items-center gap-3 text-slate-700 font-medium">
                    <School className="w-4 h-4 text-slate-400" />
                    XII IPA 1
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Statistik Belajar</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Kehadiran</p>
                    <p className="text-sm font-bold text-slate-900">98%</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Tugas Selesai</p>
                    <p className="text-sm font-bold text-slate-900">24/25</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
