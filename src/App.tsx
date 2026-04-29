import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import {
    IconHome, IconTarget, IconUser, ACTIVITY_TYPES, hapticFeedback
} from './constants';
import { ANA_PLAN, MARCELO_PLAN } from './plans';
import { Toast } from './components/Common';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import ActiveSession from './components/ActiveSession';
import Recap from './components/Recap';
import Login from './components/Login';
import ProfileModal from './components/ProfileModal';
import RestTimer from './components/RestTimer';
import ExerciseSelector from './components/ExerciseSelector';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useTrainingData } from './hooks/useTrainingData';
import { usePlan } from './hooks/usePlan';
import { useActiveSessionState } from './hooks/useActiveSession';
import { useNotifications } from './hooks/useNotifications';
import { useIntelligence } from './hooks/useIntelligence';

export default function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- AUTH ---
    const { isAuthenticated, userSession, isLoggingIn, loginError, login, logout } = useAuth();
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });

    // --- PROFILE ---
    const { profile, setProfile, saveProfile } = useProfile(userSession);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // --- PLAN & USER KEY ---
    const {
        PLAN_BLOCKS, currentUserName, userKey, savePlanBlocks,
        planBlocksOverride, setPlanBlocksOverride, storageKey
    } = usePlan(userSession);

    // --- DATA & STATS ---
    const { logs, setLogs, deleteLog, stats, currentStreak } = useTrainingData(userSession, profile, userKey, PLAN_BLOCKS);
    const dashboardStats = stats;

    // --- ACTIVE SESSION STATE ---
    const session = useActiveSessionState(PLAN_BLOCKS, logs);
    const [editingPlanBlock, setEditingPlanBlock] = useState<any>(null);
    const [restTimer, setRestTimer] = useState({ active: false, seconds: 0, total: 0 });
    const [sessionRecap, setSessionRecap] = useState<any>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // --- NOTIFICATIONS ---
    const { notificationSettings, requestPermission, notify } = useNotifications(userSession?.user?.id || 'guest', storageKey, showToast);

    // --- INTELLIGENCE ---
    const intel = useIntelligence(logs, PLAN_BLOCKS, currentStreak);

    // --- REFRESH SERVICE WORKER ---
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW error:', err));
        }
    }, []);

    // --- REST TIMER EFFECT ---
    useEffect(() => {
        if (!restTimer.active || restTimer.seconds <= 0) return;
        const interval = setInterval(() => {
            setRestTimer(prev => {
                if (prev.seconds <= 1) {
                    hapticFeedback('timer_done');
                    return { ...prev, active: false, seconds: 0 };
                }
                return { ...prev, seconds: prev.seconds - 1 };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [restTimer.active, restTimer.seconds]);

    const startRestTimer = (exerciseTip?: string) => {
        let defaultSec = 90;
        if (exerciseTip) {
            const match = exerciseTip.match(/(\d+)\s*-?\s*(\d+)?s/);
            if (match) defaultSec = parseInt(match[2] || match[1]);
        }
        setRestTimer({ active: true, seconds: defaultSec, total: defaultSec });
    };

    // --- RECAP CALCULATION HELPER ---
    const buildRecap = () => {
        let recapTonelaje = 0;
        let achievements: string[] = [];

        Object.entries(session.gymProgress).forEach(([exId, sets]: [string, any]) => {
            if (Array.isArray(sets)) {
                let exerciseTonelaje = 0;
                sets.forEach((s: any) => {
                    if (s.completed) {
                        const kg = parseFloat(s.weight) || 0;
                        const reps = parseInt(s.reps) || 0;
                        exerciseTonelaje += kg * reps;

                        // Check for PR
                        const metric = dashboardStats.strengthMetrics?.find((m: any) => m.id === exId);
                        if (metric && kg > (metric.currentMax || 0)) {
                            const title = `🔥 Nuevo PR en ${metric.name}: ${kg}kg`;
                            if (!achievements.includes(title)) achievements.push(title);
                        }
                    }
                });
                recapTonelaje += exerciseTonelaje;
            }
        });

        if (recapTonelaje > 1000) achievements.push("🐘 Miembro del Club de la Tonelada");

        let recapStamina = 0;
        if (session.activeBlock.hasSurf) {
            const fm: any = { struggle: 1.3, good: 1.0, awesome: 1.15 };
            recapStamina += Math.round(session.surfForm.duration * (fm[session.surfForm.feeling] || 1));
        }
        if (session.activeBlock.hasMuayThai) {
            const mm: any = { ligera: 0.8, media: 1.0, exigente: 1.4 };
            recapStamina += Math.round(session.muayThaiForm.duration * (mm[session.muayThaiForm.intensity] || 1));
        }
        if (session.activeBlock.activityType && !session.activeBlock.hasSurf && !session.activeBlock.hasMuayThai) {
            const ad = ACTIVITY_TYPES.find(a => a.id === session.activeBlock.activityType);
            const so = ad?.intensityOptions.find(o => o.id === session.activityForm.intensity);
            if (ad && so) recapStamina += Math.round(session.activityForm.duration * (so.kcalPerMin / 10));
        }
        const completedSetsCount = Object.values(session.gymProgress).flat().filter((s: any) => s?.completed).length;
        recapStamina += completedSetsCount * 5;

        return {
            blockTitle: session.activeBlock.title,
            tonelaje: recapTonelaje,
            stamina: recapStamina,
            completedSets: completedSetsCount,
            achievements
        };
    };

    // --- HANDLERS ---
    const handleFinishSession = async () => {
        const isEditing = session.editingLogId !== null;
        const localDate = new Date();
        const localDateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;

        const payload: any = {
            date: isEditing ? logs.find(l => l.id === session.editingLogId)?.date : localDateStr,
            blockId: session.activeBlock.id,
            surfData: session.activeBlock.hasSurf ? session.surfForm : null,
            muayThaiData: session.activeBlock.hasMuayThai ? session.muayThaiForm : null,
            activityData: session.activeBlock.activityType ? { type: session.activeBlock.activityType, ...session.activityForm } : null,
            gymData: { progress: session.gymProgress, skipped: session.skippedExercises, exercises: session.sessionExercises }
        };

        try {
            if (isEditing) {
                await supabase.from('logs').update({ ...payload, user_id: userSession.user.id }).eq('id', session.editingLogId);
                setLogs(prev => prev.map(l => l.id === session.editingLogId ? { ...l, ...payload } : l));
            } else {
                const { data } = await supabase.from('logs').insert([{ ...payload, user_id: userSession.user.id }]).select();
                if (data?.[0]) setLogs(prev => [data[0], ...prev]);
            }
            const recap = buildRecap();
            setSessionRecap(recap);

            // Trigger Immediate Achievement Push
            if (recap.achievements.length > 0 && notificationSettings.enabled) {
                fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userSession.user.id,
                        title: "🏆 ¡Logro Desbloqueado!",
                        body: recap.achievements[0]
                    })
                }).catch(err => console.error('Error sending achievement push:', err));
            }

            // Limpiar el estado de la sesión activa
            session.resetSessionState();
            setRestTimer({ active: false, seconds: 0, total: 0 });

            if (recap) {
                setActiveTab('recap');
                window.scrollTo(0, 0);
            } else {
                setActiveTab('home');
            }

            if (notificationSettings.enabled && notificationSettings.workout) notify("¡Sesión Guardada! 🚀", "Gran trabajo.");
        } catch (e: any) {
            showToast(`Error al guardar: ${e.message}`, "error");
            setActiveTab('home');
        }
    };

    const handleEditLog = (log: any) => {
        const block = PLAN_BLOCKS.find(b => b.id === log.blockId) || [...ANA_PLAN, ...MARCELO_PLAN].find(b => b.id === log.blockId);
        if (!block) return;
        session.setEditingLogId(log.id);
        session.setActiveBlock(block);
        session.setGymProgress(log.gymData?.progress || {});
        session.setSkippedExercises(log.gymData?.skipped || {});
        session.setSessionExercises(log.gymData?.exercises || block.exercises);
        if (log.surfData) session.setSurfForm(log.surfData);
        if (log.muayThaiData) session.setMuayThaiForm(log.muayThaiData);
        if (log.activityData) session.setActivityForm({ duration: log.activityData.duration || 60, intensity: log.activityData.intensity || '' });
        setActiveTab('active_session');
        window.scrollTo(0, 0);
    };

    if (!isAuthenticated) {
        return <Login loginForm={loginForm} setLoginForm={setLoginForm} handleLogin={(e) => { e.preventDefault(); login(loginForm.email, loginForm.password); }} isLoggingIn={isLoggingIn} loginError={loginError} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
            {isProfileModalOpen && <ProfileModal profile={profile} setProfile={setProfile} setIsProfileModalOpen={setIsProfileModalOpen} saveProfile={saveProfile} />}
            {session.isExerciseSelectorOpen && (
                <ExerciseSelector
                    userKey={userKey} ANA_PLAN={ANA_PLAN} MARCELO_PLAN={MARCELO_PLAN} replacingExerciseId={session.replacingExerciseId}
                    setIsExerciseSelectorOpen={session.setIsExerciseSelectorOpen}
                    onSelect={(ex) => {
                        // Si estamos editando un bloque de la rutina (Profile)
                        if (activeTab === 'profile' && editingPlanBlock) {
                            setEditingPlanBlock((prev: any) => {
                                const newEx = { ...ex, id: crypto.randomUUID() }; // Nuevo ID para el plan
                                if (session.replacingExerciseId) {
                                    return {
                                        ...prev,
                                        exercises: prev.exercises.map((e: any) => e.id === session.replacingExerciseId ? newEx : e)
                                    };
                                } else {
                                    return {
                                        ...prev,
                                        exercises: [...prev.exercises, newEx]
                                    };
                                }
                            });
                        }
                        // Si estamos en una sesión activa
                        else {
                            if (session.sessionExercises.some(e => e.id === ex.id && e.id !== session.replacingExerciseId)) {
                                showToast('Ya está en la sesión.', "info");
                                return;
                            }
                            if (!session.gymProgress[ex.id]) {
                                const initialSets = Array.from({ length: ex.sets || 3 }, () => ({
                                    weight: '',
                                    reps: '',
                                    completed: false
                                }));
                                session.setGymProgress((prev: any) => ({
                                    ...prev,
                                    [ex.id]: initialSets
                                }));
                            }

                            if (session.replacingExerciseId) {
                                session.setSessionExercises(prev => prev.map(e => e.id === session.replacingExerciseId ? ex : e));
                            } else {
                                session.setSessionExercises(prev => [...prev, ex]);
                            }
                        }
                        session.setIsExerciseSelectorOpen(false);
                        session.setReplacingExerciseId(null);
                    }}
                />
            )}
            <RestTimer restTimer={restTimer} setRestTimer={setRestTimer} />

            <div className="max-w-md mx-auto min-h-screen relative flex flex-col px-4">
                <main className="flex-1 overflow-y-auto hide-scrollbar">
                    {activeTab === 'home' && <Home currentUserName={currentUserName} userKey={userKey} currentStreak={currentStreak} logs={logs} PLAN_BLOCKS={PLAN_BLOCKS} recommendedBlock={intel.recommendedBlock} setActiveTab={setActiveTab} handleStartBlock={(block) => { session.startBlock(block); setActiveTab('active_session'); }} wellnessOverride={intel.recovery} />}
                    {activeTab === 'active_session' && (
                        <ActiveSession
                            {...session} PLAN_BLOCKS={PLAN_BLOCKS} setActiveTab={setActiveTab} dashboardStats={dashboardStats} logs={logs}
                            activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId} startRestTimer={startRestTimer}
                            handleFinishSession={handleFinishSession} showToast={showToast} restTimer={restTimer}
                        />
                    )}
                    {activeTab === 'dashboard' && (
                        <Dashboard
                            dashboardStats={dashboardStats}
                            logs={logs}
                            handleEditLog={handleEditLog} handleDeleteLog={deleteLog}
                            intel={intel}
                            setActiveTab={setActiveTab}
                        />
                    )}
                    {activeTab === 'profile' && (
                        <Profile
                            profile={profile} currentUserName={currentUserName} planBlocks={PLAN_BLOCKS} editingBlock={editingPlanBlock} setEditingBlock={setEditingPlanBlock}
                            savePlanBlocks={savePlanBlocks} setIsProfileModalOpen={setIsProfileModalOpen}
                            requestNotificationPermission={requestPermission} userKey={userKey}
                            planBlocksOverride={planBlocksOverride} setPlanBlocksOverride={setPlanBlocksOverride} handleLogout={logout}
                            saveProfile={saveProfile}
                            setIsExerciseSelectorOpen={session.setIsExerciseSelectorOpen}
                            setReplacingExerciseId={session.setReplacingExerciseId}
                            logs={logs}
                            currentStreak={currentStreak}
                        />
                    )}
                    {activeTab === 'recap' && <Recap sessionRecap={sessionRecap} currentStreak={currentStreak} setActiveTab={setActiveTab} setSessionRecap={setSessionRecap} />}
                </main>

                {activeTab !== 'active_session' && activeTab !== 'recap' && (
                    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe pt-2 px-8 pb-3 z-50">
                        <div className="max-w-md mx-auto flex justify-between items-center">
                            {[
                                { id: 'home', label: 'Plan', icon: IconHome },
                                { id: 'dashboard', label: 'Metas', icon: IconTarget },
                                { id: 'profile', label: 'Perfil', icon: IconUser }
                            ].map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            if (tab.id === 'home' && session.activeBlock) {
                                                setActiveTab('active_session');
                                            } else {
                                                setActiveTab(tab.id);
                                            }
                                            window.scrollTo(0, 0);
                                        }}
                                        className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 relative ${isActive ? 'text-slate-900 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
                                    >
                                        <div className={`transition-all duration-300 ${isActive ? 'translate-y-[-2px]' : ''}`}>
                                            <tab.icon size={isActive ? 22 : 20} />
                                        </div>
                                        
                                        {tab.id === 'home' && session.activeBlock && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
                                        )}
                                        
                                        <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                            {tab.label}
                                        </span>
                                        
                                        {isActive && (
                                            <div className="absolute -bottom-1 w-1 h-1 bg-slate-900 rounded-full animate-in zoom-in" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>
                )}
            </div>
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
