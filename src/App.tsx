import React, { useState, useEffect } from 'react';
import { Plus, Users, Mail, Settings as SettingsIcon, LogOut, LayoutDashboard, CheckCircle2, Clock, AlertCircle, ExternalLink, Calendar, Loader2, Bot, Sparkles, RefreshCw, FileText, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './firebase';
import { collection, onSnapshot, addDoc, query, orderBy, where, setDoc, doc, getDoc, getDocFromServer, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Client } from './types';
import OnboardingFlow from './components/OnboardingFlow';
import ClientDetailModal from './components/ClientDetailModal';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import AIAgent from './components/AIAgent';
import ContractGeneratorView from './components/ContractGeneratorView';
import InvoiceGeneratorView from './components/InvoiceGeneratorView';
import { handleFirestoreError, OperationType } from './utils/firestore';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '' });
  const [activeOnboarding, setActiveOnboarding] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [googleTokens, setGoogleTokens] = useState<any>(() => {
    const saved = localStorage.getItem('google_tokens');
    return saved ? JSON.parse(saved) : null;
  });
  const [notionTokens, setNotionTokens] = useState<any>(() => {
    const saved = localStorage.getItem('notion_tokens');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'clients' | 'settings' | 'ai-agent' | 'contracts' | 'invoices'>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncNotion = async () => {
    if (!user || !notionTokens?.access_token) {
      alert('Please connect your Notion account first.');
      return;
    }
    
    setIsSyncing(true);
    try {
      // 1. Get database ID from settings
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
      const settingsSnap = await getDoc(settingsRef);
      const databaseId = settingsSnap.data()?.notionDatabaseId;

      if (!databaseId) {
        alert('Please configure your Notion Database ID in Settings first.');
        setActiveView('settings');
        return;
      }

      // 2. Call sync API
      const response = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokens: notionTokens,
          databaseId
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || data.details);

      // 3. Create clients in Firestore if they don't exist
      let newCount = 0;
      for (const lead of data.leads) {
        const exists = clients.some(c => c.notionId === lead.notionId || (lead.email && c.email === lead.email));
        if (!exists) {
          await addDoc(collection(db, 'clients'), {
            ...lead,
            uid: user.uid,
            status: 'pending',
            createdAt: serverTimestamp(),
            currentStep: 0
          });
          newCount++;
        }
      }

      alert(`Sync complete! Added ${newCount} new clients from Notion.`);
    } catch (error: any) {
      console.error('Sync failed:', error);
      alert(`Sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsAuthReady(true);
      
      if (user) {
        // Sync user profile to Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            name: user.displayName,
            role: 'user', // Default role
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Connection test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    if (!user || !isAuthReady) return;
    const q = query(
      collection(db, 'clients'), 
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'clients');
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && user) {
        const tokens = event.data.tokens;
        setGoogleTokens(tokens);
        localStorage.setItem('google_tokens', JSON.stringify(tokens));
        
        // Persist to Firestore for background automation
        try {
          await setDoc(doc(db, 'users', user.uid, 'tokens', 'secrets'), {
            google: tokens,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error('Error saving Google tokens to Firestore:', error);
        }
      }
      if (event.data?.type === 'NOTION_AUTH_SUCCESS' && user) {
        const tokens = event.data.tokens;
        setNotionTokens(tokens);
        localStorage.setItem('notion_tokens', JSON.stringify(tokens));

        // Persist to Firestore for background automation
        try {
          await setDoc(doc(db, 'users', user.uid, 'tokens', 'secrets'), {
            notion: tokens,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error('Error saving Notion tokens to Firestore:', error);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Login popup closed by user');
        return;
      }
      console.error('Login error:', error);
    }
  };

  const connectService = async (service: 'google' | 'notion') => {
    try {
      const redirectUri = `${window.location.origin}/api/auth/${service}/callback`;
      const res = await fetch(`/api/auth/${service}/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || `Failed to get ${service} auth URL`);
        return;
      }

      window.open(data.url, 'auth_popup', 'width=600,height=700');
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Connect service error:', error);
      alert(`An error occurred while connecting to ${service}. Please check your internet connection and try again.`);
    }
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email || !user) return;

    try {
      await addDoc(collection(db, 'clients'), {
        ...newClient,
        uid: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setIsAddingClient(false);
      setNewClient({ name: '', email: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'clients');
    }
  };

  const updateClient = async (clientId: string, data: Partial<Client>) => {
    try {
      await setDoc(doc(db, 'clients', clientId), data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clients/${clientId}`);
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await deleteDoc(doc(db, 'clients', clientId));
      setSelectedClient(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${clientId}`);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Define currentView for non-logged in users: check hash or default to 'contracts'
  // But let's simplify: if not logged in, they can toggle between 'contracts' and 'invoices'
  const currentView = user ? activeView : (activeView === 'invoices' ? 'invoices' : 'contracts');

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-zinc-900 pb-20 md:pb-0 overflow-x-hidden">
      {/* Mobile Bottom Navigation - Visible only on small screens */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 flex items-center justify-around z-[110] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pointer-events-auto">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'dashboard' ? 'text-indigo-600' : 'text-zinc-400'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold">Dash</span>
        </button>
        <button 
          onClick={() => setActiveView(user ? 'clients' : 'contracts')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === (user ? 'clients' : 'contracts') ? 'text-indigo-600' : 'text-zinc-400'}`}
        >
          {user ? <Users className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          <span className="text-[10px] font-bold">{user ? 'Clients' : 'Contract'}</span>
        </button>
        <button 
          onClick={() => setActiveView('invoices')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'invoices' ? 'text-orange-600' : 'text-zinc-400'}`}
        >
          <CreditCard className="w-6 h-6" />
          <span className="text-[10px] font-bold">Invoice</span>
        </button>
        <button 
          onClick={() => setActiveView('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'settings' ? 'text-indigo-600' : 'text-zinc-400'}`}
        >
          <SettingsIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold">More</span>
        </button>
      </nav>

      {/* Sidebar - Desktop Only */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-zinc-200 p-6 hidden md:flex flex-col z-[80]">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Onboardly</span>
        </div>

        <nav className="space-y-1 flex-1">
          {user ? (
            <>
              <button 
                onClick={() => setActiveView('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${currentView === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </button>
              <button 
                onClick={() => setActiveView('clients')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${currentView === 'clients' ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <Users className="w-5 h-5" /> Clients
              </button>
              <button 
                onClick={() => setActiveView('contracts')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${currentView === 'contracts' ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <FileText className="w-5 h-5" /> Contracts
              </button>
              <button 
                onClick={() => setActiveView('invoices')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${currentView === 'invoices' ? 'bg-orange-50 text-orange-600' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <CreditCard className="w-5 h-5" /> Invoices
              </button>
              <button 
                onClick={() => setActiveView('ai-agent')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${currentView === 'ai-agent' ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <Bot className="w-5 h-5" /> AI Agent
              </button>
              <button 
                onClick={() => setActiveView('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${currentView === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <SettingsIcon className="w-5 h-5" /> Settings
              </button>
            </>
          ) : (
            <div className="space-y-1">
              <button 
                onClick={() => setActiveView('contracts')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${currentView === 'contracts' ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <FileText className="w-5 h-5" /> Service Agreements
              </button>
              <button 
                onClick={() => setActiveView('invoices')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${currentView === 'invoices' ? 'bg-orange-50 text-orange-600' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <CreditCard className="w-5 h-5" /> Payment Invoices
              </button>
            </div>
          )}
        </nav>

        <div className="pt-6 border-t border-zinc-100">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-2 mb-4">
                <img src={user.photoURL} className="w-10 h-10 rounded-full border border-zinc-200" alt="" />
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">{user.displayName}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-rose-600 transition-colors">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-full bg-zinc-900 text-white py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              Sign in for CRM Features
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-6 md:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight capitalize">{currentView}</h1>
            <p className="text-zinc-500 text-sm md:text-base">
              {currentView === 'dashboard' && 'Overview of your onboarding performance.'}
              {currentView === 'clients' && 'Manage and onboard your new clients.'}
              {currentView === 'contracts' && 'Generate professional service agreements instantly.'}
              {currentView === 'invoices' && 'Create professional payment invoices for your clients.'}
              {currentView === 'ai-agent' && 'Chat with your AI assistant to optimize onboarding.'}
              {currentView === 'settings' && 'Manage your account and preferences.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentView === 'clients' && (
              <>
                {/* Temporarily hidden for production focus on Contract/Invoice tools */}
                {/* 
                <button 
                  onClick={() => connectService('google')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${googleTokens ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                >
                  {googleTokens ? 'Google Connected' : 'Connect Google'}
                </button>
                <button 
                  onClick={() => connectService('notion')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${notionTokens ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                >
                  {notionTokens ? 'Notion Connected' : 'Connect Notion'}
                </button>
                <button 
                  onClick={handleSyncNotion}
                  disabled={isSyncing || !notionTokens}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 ${isSyncing ? 'bg-zinc-50 text-zinc-400 border-zinc-200' : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300 shadow-sm'}`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync from Notion'}
                </button>
                */}
                <button 
                  onClick={() => setIsAddingClient(true)}
                  className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200"
                >
                  <Plus className="w-5 h-5" /> New Client
                </button>
              </>
            )}
            {currentView === 'dashboard' && (
              <button 
                onClick={() => setActiveView('clients')}
                className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200"
              >
                View All Clients
              </button>
            )}
          </div>
        </header>

        {currentView === 'dashboard' && <Dashboard clients={clients} onViewClient={setSelectedClient} />}
        {currentView === 'settings' && <Settings user={user} googleTokens={googleTokens} notionTokens={notionTokens} />}
        {currentView === 'ai-agent' && <AIAgent clients={clients} />}
        {currentView === 'contracts' && <ContractGeneratorView />}
        {currentView === 'invoices' && <InvoiceGeneratorView />}
        
        {currentView === 'clients' && (
          <>
            <AnimatePresence>
              {activeOnboarding && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <OnboardingFlow 
                    client={clients.find(c => c.id === activeOnboarding.id) || activeOnboarding} 
                    onUpdate={(data) => updateClient(activeOnboarding.id, data)}
                    googleTokens={googleTokens} 
                    notionTokens={notionTokens}
                    onComplete={() => setActiveOnboarding(null)} 
                  />
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedClient && (
                <ClientDetailModal 
                  client={clients.find(c => c.id === selectedClient.id) || selectedClient} 
                  onClose={() => setSelectedClient(null)} 
                  onDelete={deleteClient}
                  googleTokens={googleTokens}
                  onStartOnboarding={() => {
                    setActiveOnboarding(selectedClient);
                    setSelectedClient(null);
                  }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isAddingClient && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                  >
                    <h2 className="text-2xl font-bold mb-6">Add New Client</h2>
                    <form onSubmit={addClient} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Client Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="e.g. Acme Corp"
                          value={newClient.name}
                          onChange={e => setNewClient({...newClient, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Contact Email</label>
                        <input 
                          type="email" 
                          required
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="client@example.com"
                          value={newClient.email}
                          onChange={e => setNewClient({...newClient, email: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button 
                          type="button"
                          onClick={() => setIsAddingClient(false)}
                          className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 font-semibold hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800"
                        >
                          Add Client
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Client Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {clients.map(client => (
                <motion.div 
                  layout
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      client.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                      client.status === 'onboarding' ? 'bg-amber-50 text-amber-600' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1">{client.name}</h3>
                  <p className="text-zinc-500 text-sm mb-6">{client.email}</p>

                  {client.status === 'onboarding' && (
                    <div className="mb-6">
                      <div className="flex justify-between text-xs font-medium text-zinc-500 mb-2">
                        <span>Onboarding Progress</span>
                        <span>{Math.round(((client.currentStep || 0) / 4) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${((client.currentStep || 0) / 4) * 100}%` }}
                          className="h-full bg-indigo-600"
                        />
                      </div>
                    </div>
                  )}

                  {client.onboardingError && (
                    <div className="mb-6 p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-rose-700">Onboarding Error</p>
                        <p className="text-xs text-rose-600">{client.onboardingError}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>
                      {client.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-zinc-300" />}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400 flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Notion</span>
                      {client.notionPageId ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-zinc-300" />}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> Kickoff</span>
                      {client.kickoffMeetingId ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-zinc-300" />}
                    </div>
                  </div>

                  {client.status === 'pending' ? (
                    <button 
                      disabled={!googleTokens || !notionTokens}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveOnboarding(client);
                      }}
                      className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Start Onboarding
                    </button>
                  ) : client.status === 'completed' ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client);
                        }}
                        className="flex-1 py-2 rounded-lg border border-zinc-200 text-sm font-medium hover:bg-zinc-50 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" /> Details
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveOnboarding(client);
                      }}
                      className="w-full py-3 rounded-xl bg-amber-50 text-amber-600 font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" /> In Progress
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {clients.length === 0 && (
              <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-900">No clients yet</h3>
                <p className="text-zinc-500">Add your first client to start onboarding.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
