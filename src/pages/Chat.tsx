import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, Search, User, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Chat() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data.filter((u: any) => u.id !== user?.id));
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchUsers();

    // WebSocket Setup
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, data]);
      }
    };

    return () => ws.current?.close();
  }, [token, user?.id]);

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        const res = await fetch(`/api/chats/${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(await res.json());
      };
      fetchMessages();
    }
  }, [selectedUser, token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const chatData = {
      type: 'chat',
      receiver_id: selectedUser.id,
      message: newMessage
    };

    ws.current?.send(JSON.stringify(chatData));
    setMessages(prev => [...prev, { 
      sender_id: user?.id, 
      message: newMessage, 
      created_at: new Date().toISOString() 
    }]);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-12rem)] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Pesan</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kontak..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            </div>
          ) : (
            users.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 ${
                  selectedUser?.id === u.id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                  {u.name.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{u.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {selectedUser ? (
          <>
            <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedUser.name}</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase">Online</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                      m.sender_id === user?.id
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-100'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                    }`}
                  >
                    <p>{m.message}</p>
                    <p className={`text-[10px] mt-1 ${m.sender_id === user?.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tulis pesan..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <User className="w-10 h-10" />
            </div>
            <p className="font-medium">Pilih kontak untuk memulai percakapan</p>
          </div>
        )}
      </div>
    </div>
  );
}
