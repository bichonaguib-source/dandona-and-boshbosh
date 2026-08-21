'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, Image as ImageIcon, MessageCircle, Calendar, Plus, X, Send, Sparkles, MapPin, Lock, KeyRound } from 'lucide-react';

// === 1. إعداد الاتصال بـ Supabase ===
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === 2. رمز الدخول الخاص بيكم (غيره للتاريخ أو الباسورد اللي يعجبكم) ===
const SPECIAL_PASSCODE = '1234'; 

export default function LuxuryMemoryApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);

  const [memories, setMemories] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('timeline');
  const [showModal, setShowModal] = useState(false);

  // Forms State
  const [newMemory, setNewMemory] = useState({ title: '', description: '', image_url: '', date: '', location: '' });
  const [newNote, setNewNote] = useState({ author: '', content: '' });

  useEffect(() => {
    // التأكد لو كان مسجل دخول قبل كده على نفس الجهاز
    const savedAuth = localStorage.getItem('our_space_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  async function fetchData() {
    const { data: mems } = await supabase.from('memories').select('*').order('date', { ascending: false });
    const { data: nts } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
    if (mems) setMemories(mems);
    if (nts) setNotes(nts);
  }

  // التحقق من الرقم السري
  function handleLogin(e) {
    e.preventDefault();
    if (passcode === SPECIAL_PASSCODE) {
      localStorage.setItem('our_space_auth', 'true');
      setIsAuthenticated(true);
      setPassError(false);
      fetchData();
    } else {
      setPassError(true);
    }
  }

  // إضافة ذكرى جديدة
  async function handleAddMemory(e) {
    e.preventDefault();
    if (!newMemory.title || !newMemory.image_url || !newMemory.date) return;
    const { data, error } = await supabase.from('memories').insert([newMemory]).select();
    if (!error && data) {
      setMemories([data[0], ...memories]);
      setNewMemory({ title: '', description: '', image_url: '', date: '', location: '' });
      setShowModal(false);
    }
  }

  // إضافة نوت جديدة
  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.author || !newNote.content) return;
    const { data, error } = await supabase.from('notes').insert([newNote]).select();
    if (!error && data) {
      setNotes([data[0], ...notes]);
      setNewNote({ author: '', content: '' });
      setShowModal(false);
    }
  }

  // === شاشة الدخول والتأمين (Lock Screen) ===
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
        {/* خلفية جمالية */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3e1020,rgba(15,23,42,0))]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-900/20 rounded-full blur-[100px]" />

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-[30px] shadow-2xl max-w-md w-full relative z-10 text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-tr from-rose-600 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-900/50">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">عالمنا الخاص مغلق</h2>
          <p className="text-slate-400 text-sm mb-6">أدخل رمز الدخول السرّي للوصول للذكريات</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder="رمز الدخول..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className={`w-full p-4 bg-slate-800/80 border ${passError ? 'border-rose-500' : 'border-white/10'} rounded-2xl text-center text-xl tracking-widest outline-none focus:border-rose-500 transition`}
              />
              <KeyRound className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {passError && <p className="text-rose-500 text-xs animate-shake">رمز الدخول غير صحيح، حاول مرة أخرى!</p>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-600 to-rose-500 text-white py-4 rounded-2xl font-bold hover:from-rose-500 hover:to-rose-600 transition shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2">
              دخول <Heart className="w-4 h-4 fill-white" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // === واجهة الموقع الرئيسية (بعد التأكد من الباسورد) ===
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans relative overflow-hidden" dir="rtl">
      
      {/* الخلفية المتحركة */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#3e1020,rgba(15,23,42,0))]" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-900/30 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '8s'}} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '10s', animationDelay: '2s'}} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl shadow-2xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-right flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/5 border border-rose-500/20 shadow-inner">
                <Heart className="fill-rose-500 text-rose-500 w-8 h-8 animate-pulse" />
            </div>
            <div>
                <h1 className="text-4xl font-extrabold tracking-tighter bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3 justify-center sm:justify-start">
                  عالمنا الخاص <Sparkles className="w-5 h-5 text-amber-400" />
                </h1>
                <p className="text-sm text-slate-400 mt-1 font-light tracking-wide">اللحظات التي لا تُنسى، محفوظة للأبد.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900/80 border border-white/5 p-1.5 rounded-full shadow-inner relative z-10">
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 relative ${
                activeTab === 'timeline' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}>
              {activeTab === 'timeline' && <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-500 rounded-full shadow-lg animate-fade-in"></div>}
              <ImageIcon className="w-4 h-4 relative z-10" /> <span className="relative z-10">شريط الذكريات</span>
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 relative ${
                activeTab === 'notes' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}>
              {activeTab === 'notes' && <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-500 rounded-full shadow-lg animate-fade-in"></div>}
              <MessageCircle className="w-4 h-4 relative z-10" /> <span className="relative z-10">رسائل القلب</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 mt-12 relative z-10">
        {activeTab === 'timeline' && (
          <div className="relative pt-8 before:absolute before:inset-0 before:right-[31px] before:w-0.5 before:bg-gradient-to-b before:from-rose-900/0 before:via-rose-800/50 before:to-rose-900/0">
            {memories.length === 0 ? (
              <div className="text-center py-24 bg-slate-900/40 border border-white/5 rounded-3xl backdrop-blur-sm">
                <ImageIcon className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                <p className="text-xl text-slate-500 font-light">لا توجد ذكريات بعد.. لنبدأ بكتابة التاريخ!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {memories.map((item, idx) => (
                <div key={item.id || idx} className={`relative group ${idx % 2 !== 0 ? 'md:mt-24' : ''}`}>
                  <div className="absolute right-[-45px] top-10 flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] z-10 transition-transform group-hover:scale-110">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>

                  <div className="bg-slate-900/60 backdrop-blur-lg border border-white/5 p-5 rounded-[30px] shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-rose-500/30 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_30px_rgba(225,29,72,0.1)] overflow-hidden relative">
                    <div className="absolute -inset-10 bg-rose-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="relative z-10">
                        <div className="overflow-hidden rounded-2xl mb-5 shadow-inner bg-slate-800">
                            <img src={item.image_url} alt={item.title} className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-rose-400 mb-3 font-medium bg-rose-950/40 px-3 py-1.5 rounded-full w-fit border border-rose-900/50">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {item.date}</span>
                          {item.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>}
                        </div>
                        
                        <h3 className="font-bold text-2xl text-white tracking-tight group-hover:text-rose-300 transition-colors">{item.title}</h3>
                        {item.description && <p className="text-slate-400 text-base mt-2 font-light leading-relaxed whitespace-pre-line">{item.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {notes.length === 0 ? (
               <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24 bg-slate-900/40 border border-white/5 rounded-3xl backdrop-blur-sm">
                <MessageCircle className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                <p className="text-xl text-slate-500 font-light">مساحة البوح فارغة.. اكتب أول رسالة من القلب.</p>
              </div>
            ) : (
              notes.map((note, idx) => (
                <div key={note.id || idx} className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-sm border border-white/5 p-7 rounded-3xl shadow-lg relative flex flex-col justify-between group transition-all duration-300 hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-amber-950/20 overflow-hidden">
                  <div className="relative z-10">
                    <Sparkles className="w-5 h-5 text-amber-600 mb-5 opacity-50" />
                    <p className="text-slate-200 text-lg leading-relaxed mb-6 whitespace-pre-line font-light">{note.content}</p>
                  </div>
                  <div className="text-left text-sm font-semibold text-amber-400 border-t border-white/5 pt-4 relative z-10">— {note.author}</div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-br from-rose-500 to-rose-600 text-white p-5 rounded-full shadow-[0_10px_30px_rgba(225,29,72,0.3)] hover:shadow-[0_15px_40px_rgba(225,29,72,0.5)] transition-all duration-300 hover:scale-110 z-30 group">
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-[35px] p-8 w-full max-w-xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 left-6 text-slate-500 hover:text-white transition p-2 bg-slate-800 rounded-full">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <Sparkles className="w-8 h-8 text-rose-500" />
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  إضافة {activeTab === 'timeline' ? 'لحظة جديدة' : 'رسالة حب'}
                </h2>
            </div>

            {activeTab === 'timeline' ? (
              <form onSubmit={handleAddMemory} className="space-y-5">
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <input type="text" placeholder="عنوان اللحظة" required value={newMemory.title} onChange={(e) => setNewMemory({...newMemory, title: e.target.value})}
                    className="col-span-2 w-full p-4 bg-slate-800/60 border border-white/5 rounded-xl text-base outline-none focus:border-rose-500/50 transition" />
                    
                    <input type="date" required value={newMemory.date} onChange={(e) => setNewMemory({...newMemory, date: e.target.value})}
                    className="w-full p-4 bg-slate-800/60 border border-white/5 rounded-xl text-base outline-none focus:border-rose-500/50 transition text-slate-400" />
                    
                    <input type="text" placeholder="المكان (اختياري)" value={newMemory.location} onChange={(e) => setNewMemory({...newMemory, location: e.target.value})}
                    className="w-full p-4 bg-slate-800/60 border border-white/5 rounded-xl text-base outline-none focus:border-rose-500/50 transition" />
                </div>
                
                <input type="text" placeholder="رابط الصورة (Image URL)" required value={newMemory.image_url} onChange={(e) => setNewMemory({...newMemory, image_url: e.target.value})}
                className="w-full p-4 bg-slate-800/60 border border-white/5 rounded-xl text-base outline-none focus:border-rose-500/50 transition" />
                
                <textarea placeholder="تفاصيل اللحظة..." rows="4" value={newMemory.description} onChange={(e) => setNewMemory({...newMemory, description: e.target.value})}
                className="w-full p-4 bg-slate-800/60 border border-white/5 rounded-xl text-base outline-none focus:border-rose-500/50 transition resize-none"></textarea>
                
                <button type="submit" className="w-full bg-gradient-to-r from-rose-600 to-rose-500 text-white py-4 rounded-xl font-bold text-lg hover:from-rose-500 hover:to-rose-600 transition shadow-lg shadow-rose-950/30 flex items-center justify-center gap-2.5">
                  <Send className="w-5 h-5" /> حفظ اللحظة
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddNote} className="space-y-5">
                <input type="text" placeholder="اسمك" required value={newNote.author} onChange={(e) => setNewNote({...newNote, author: e.target.value})}
                className="w-full p-4 bg-slate-800/60 border border-white/5 rounded-xl text-base outline-none focus:border-amber-500/50 transition" />
                
                <textarea placeholder="اكتب رسالتك..." rows="6" required value={newNote.content} onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                className="w-full p-4 bg-slate-800/60 border border-white/5 rounded-xl text-base outline-none focus:border-amber-500/50 transition resize-none"></textarea>
                
                <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-500 hover:to-amber-600 transition shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2.5">
                  <Send className="w-5 h-5" /> إرسال الرسالة
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
