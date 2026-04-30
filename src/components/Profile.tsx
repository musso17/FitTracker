import React, { useState } from 'react';
import {
    IconUser, IconBell, IconPlus, IconTrash,
    IconDumbbell, IconSync, IconLogout, IconTrophy, IconChevronRight,
    ICON_MAP, COLOR_OPTIONS, VISUAL_OPTIONS, ACTIVITY_TYPES, getSoftColorClasses
} from '../constants';
import { parseSafeDate } from './Common';
import type { UserProfile, TrainingBlock } from '../types';
import { auditRoutine } from '../services/ai';
import type { RoutineAuditResult } from '../services/ai';
import RoutineAuditModal from './RoutineAuditModal';
import RoutineAuditForm from './RoutineAuditForm';

interface ProfileProps {
    profile: UserProfile;
    currentUserName: string;
    planBlocks: TrainingBlock[];
    editingBlock: any | null;
    setEditingBlock: (block: any | null) => void;
    savePlanBlocks: (blocks: TrainingBlock[]) => void;
    setIsProfileModalOpen: (open: boolean) => void;
    requestNotificationPermission: () => Promise<void>;
    userKey: string;
    planBlocksOverride: any;
    setPlanBlocksOverride: (val: any) => void;
    handleLogout: () => void;
    saveProfile: (newProfile: UserProfile) => Promise<boolean>;
    setIsExerciseSelectorOpen: (open: boolean) => void;
    setReplacingExerciseId: (id: string | null) => void;
    logs: any[];
    currentStreak: number;
}

const Profile: React.FC<ProfileProps> = ({
    profile,
    currentUserName,
    planBlocks,
    editingBlock,
    setEditingBlock,
    savePlanBlocks,
    setIsProfileModalOpen,
    requestNotificationPermission,
    userKey,
    planBlocksOverride,
    setPlanBlocksOverride,
    handleLogout,
    saveProfile,
    setIsExerciseSelectorOpen,
    setReplacingExerciseId,
    logs,
    currentStreak
}) => {
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [showAuditForm, setShowAuditForm] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<RoutineAuditResult | null>(null);

    const handleAuditRoutine = async () => {
        if (!profile.audit_preferences) {
            setShowAuditForm(true);
            return;
        }
        executeAudit(profile);
    };

    const executeAudit = async (currentProfile: any) => {
        setShowAuditModal(true);
        setIsAuditing(true);
        setAuditResult(null);
        
        const result = await auditRoutine(planBlocks, logs, currentProfile);
        setAuditResult(result);
        setIsAuditing(false);
    };

    const handleAuditFormComplete = async (prefs: { objective: string[], feelings: string[], equipment: string[] }) => {
        setShowAuditForm(false);
        const updatedProfile = { ...profile, audit_preferences: prefs };
        await saveProfile(updatedProfile);
        executeAudit(updatedProfile);
    };

    const getDaysAgo = (dateStr: string) => {
        if (!dateStr) return null;
        const d = parseSafeDate(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        return `Hace ${diffDays}d`;
    };

    const groupedBlocks = {
        'En el Agua': planBlocks.filter(b => b.hasSurf || b.title.toLowerCase().includes('surf')),
        'En el Gym': planBlocks.filter(b => !b.hasSurf && !b.title.toLowerCase().includes('surf') && !b.title.toLowerCase().includes('recuperación') && !b.title.toLowerCase().includes('yoga')),
        'Recuperación': planBlocks.filter(b => b.title.toLowerCase().includes('recuperación') || b.title.toLowerCase().includes('yoga'))
    };

    if (editingBlock) {
        const updateField = (field: string, value: any) => setEditingBlock((prev: any) => ({ ...prev, [field]: value }));
        const updateExercise = (idx: number, field: string, value: any) => {
            setEditingBlock((prev: any) => {
                const exs = [...prev.exercises];
                exs[idx] = { ...exs[idx], [field]: value };
                return { ...prev, exercises: exs };
            });
        };
        const removeExercise = (idx: number) => {
            setEditingBlock((prev: any) => ({
                ...prev,
                exercises: prev.exercises.filter((_: any, i: number) => i !== idx)
            }));
        };
        const addExercise = () => {
            setReplacingExerciseId(null);
            setIsExerciseSelectorOpen(true);
        };
        const handleSaveBlock = () => {
            const updated = [...planBlocks];
            const existingIdx = updated.findIndex(b => b.id === editingBlock.id);
            const blockToSave = { ...editingBlock, icon: ICON_MAP[editingBlock.iconId] || IconDumbbell };
            if (existingIdx >= 0) {
                updated[existingIdx] = blockToSave;
            } else {
                updated.push(blockToSave);
            }
            savePlanBlocks(updated);
            setEditingBlock(null);
        };

        return (
            <div className="space-y-5 animate-in pb-28 pt-safe mt-4 px-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">{editingBlock._isNew ? 'Nuevo Bloque' : 'Editar Bloque'}</h2>
                    <button onClick={() => setEditingBlock(null)} className="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl active:scale-95 transition-transform">Cancelar</button>
                </div>

                {/* Título y Nota */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título del bloque</label>
                        <input type="text" value={editingBlock.title} onChange={e => updateField('title', e.target.value)} placeholder="Ej: Torso A: Fuerza" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-slate-400 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nota / Objetivo (opcional)</label>
                        <input type="text" value={editingBlock.note || ''} onChange={e => updateField('note', e.target.value)} placeholder="Ej: Construir fuerza en press" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-slate-400 outline-none transition-all" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Actividad principal (opcional)</label>
                        <div className="grid grid-cols-4 gap-2">
                            <button onClick={() => { updateField('activityType', null); updateField('hasSurf', false); updateField('hasMuayThai', false); }} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${!editingBlock.activityType && !editingBlock.hasSurf && !editingBlock.hasMuayThai ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                                <span className="text-lg">💪</span>
                                <span className="text-[9px] font-bold">Solo gym</span>
                            </button>
                            {ACTIVITY_TYPES.map(act => {
                                const isSelected = editingBlock.activityType === act.id || (act.id === 'surf' && editingBlock.hasSurf) || (act.id === 'muay_thai' && editingBlock.hasMuayThai);
                                return (
                                    <button key={act.id} onClick={() => {
                                        updateField('activityType', act.id);
                                        updateField('hasSurf', act.id === 'surf');
                                        updateField('hasMuayThai', act.id === 'muay_thai');
                                    }} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${isSelected ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}>
                                        <span className="text-lg">{act.emoji}</span>
                                        <span className="text-[9px] font-bold">{act.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Color e Ícono */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Color</label>
                        <div className="flex gap-2 flex-wrap">
                            {COLOR_OPTIONS.map(c => (
                                <button key={c.id} onClick={() => updateField('color', c.id)} className={`w-10 h-10 rounded-full ${c.classes} transition-all ${editingBlock.color === c.id ? `ring-2 ${c.ring} ring-offset-2 scale-110` : 'opacity-60 hover:opacity-100'}`} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ícono</label>
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(ICON_MAP).map(([key, Comp]) => (
                                <button key={key} onClick={() => updateField('iconId', key)} className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center transition-all ${editingBlock.iconId === key ? 'ring-2 ring-slate-800 ring-offset-2 bg-slate-800 text-white scale-110' : 'text-slate-500 hover:bg-slate-100'}`}>
                                    <Comp size={18} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ejercicios */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ejercicios ({editingBlock.exercises.length})</h3>

                    {editingBlock.exercises.map((ex: any, idx: number) => (
                        <div key={ex.id} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100 relative">
                            <div className="flex items-start justify-between">
                                <span className="text-[10px] font-black text-slate-300 uppercase">#{idx + 1}</span>
                                <button onClick={() => removeExercise(idx)} className="text-rose-400 hover:text-rose-600 p-1 transition-colors"><IconTrash size={14} /></button>
                            </div>
                            <button
                                onClick={() => {
                                    setReplacingExerciseId(ex.id);
                                    setIsExerciseSelectorOpen(true);
                                }}
                                className="w-full text-left bg-white border border-slate-200 rounded-lg px-3 py-2.5 flex items-center justify-between group active:bg-slate-50 transition-all"
                            >
                                <span className={`text-sm font-bold ${ex.name ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {ex.name || 'Seleccionar ejercicio...'}
                                </span>
                                <IconSync size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </button>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Series</label>
                                    <input type="number" value={ex.sets} onChange={e => updateExercise(idx, 'sets', parseInt(e.target.value) || 1)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-center font-bold text-slate-800 focus:ring-2 focus:ring-slate-400 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Objetivo</label>
                                    <input type="text" value={ex.target} onChange={e => updateExercise(idx, 'target', e.target.value)} placeholder="10 reps" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-center font-bold text-slate-800 focus:ring-2 focus:ring-slate-400 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Tipo</label>
                                    <select value={ex.type} onChange={e => updateExercise(idx, 'type', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-slate-400 outline-none">
                                        <option value="weight">Peso</option>
                                        <option value="check">Check</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Biomecánica</label>
                                    <select value={ex.visual || 'pull'} onChange={e => updateExercise(idx, 'visual', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-slate-400 outline-none">
                                        {VISUAL_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Tip (opc.)</label>
                                    <input type="text" value={ex.tip || ''} onChange={e => updateExercise(idx, 'tip', e.target.value)} placeholder="Controla la bajada" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-slate-400 outline-none" />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button onClick={addExercise} className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors flex items-center justify-center gap-2 active:scale-95">
                        <IconPlus size={14} /> Añadir Ejercicio
                    </button>
                </div>

                {/* Acciones */}
                <div className="sticky bottom-20 bg-slate-50/95 backdrop-blur-sm pt-3 pb-4 space-y-2 -mx-4 px-4">
                    <button onClick={handleSaveBlock} disabled={!editingBlock.title.trim()} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed">
                        {editingBlock._isNew ? 'Crear Bloque' : 'Guardar Cambios'}
                    </button>
                    {!editingBlock._isNew && (
                        <button
                            onClick={() => {
                                if (confirm('¿Eliminar este bloque permanentemente?')) {
                                    savePlanBlocks(planBlocks.filter(b => b.id !== editingBlock.id));
                                    setEditingBlock(null);
                                }
                            }}
                            className="w-full bg-rose-50 text-rose-500 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                        >
                            <IconTrash size={14} className="inline mr-2" /> Eliminar Bloque
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // --- Vista de Lista de Bloques ---
    return (
        <div className="space-y-6 animate-in pb-28 pt-safe mt-4 px-4">
            <header className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Mi Rutina</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{planBlocks.length} Módulos configurados</p>
                </div>
                <button onClick={handleLogout} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-rose-400 active:scale-95 transition-all">
                    <IconLogout size={18} />
                </button>
            </header>

            {/* Perfil Físico Editorial */}
            <div 
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-white rounded-[2.5rem] border-2 border-slate-900 p-6 shadow-2xl shadow-slate-200 cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <IconUser size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white relative shadow-lg">
                        <IconUser size={28} />
                        {currentStreak > 0 && (
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm animate-bounce">
                                {currentStreak}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 leading-none">{currentUserName}</h2>
                        <div className="flex gap-3 mt-2">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Altura</span>
                                <span className="text-sm font-black text-slate-700">{profile.height}cm</span>
                            </div>
                            <div className="w-px h-6 bg-slate-100 self-center" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Peso</span>
                                <span className="text-sm font-black text-slate-700">{profile.weight}kg</span>
                            </div>
                            <div className="w-px h-6 bg-slate-100 self-center" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nivel</span>
                                <span className="text-sm font-black text-emerald-500">Avanzado</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agrupación de Bloques */}
            <div className="space-y-8">
                {Object.entries(groupedBlocks).map(([groupName, blocks]) => (
                    <div key={groupName} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{groupName}</h3>
                            <div className="h-px bg-slate-100 flex-1" />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {blocks.map((block) => {
                                const lastDoneDate = logs.filter(l => l.blockId === block.id).sort((a,b) => b.date.localeCompare(a.date))[0]?.date;
                                const daysAgo = getDaysAgo(lastDoneDate);
                                const softColors = getSoftColorClasses(block.color);
                                
                                return (
                                    <div
                                        key={block.id}
                                        onClick={() => setEditingBlock({ ...block, iconId: Object.keys(ICON_MAP).find(k => ICON_MAP[k] === block.icon) || 'dumbbell' })}
                                        className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm flex items-center justify-between group active:bg-slate-50 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-5">
                                            {/* Drag Handle (Visual only for now) */}
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-20 transition-opacity">
                                                <div className="w-4 h-0.5 bg-slate-900 rounded-full" />
                                                <div className="w-4 h-0.5 bg-slate-900 rounded-full" />
                                                <div className="w-4 h-0.5 bg-slate-900 rounded-full" />
                                            </div>
                                            
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${softColors} transition-transform group-hover:scale-105`}>
                                                {React.createElement(block.icon || IconDumbbell, { size: 24 })}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 text-sm tracking-tight leading-none mb-1.5">{block.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{block.exercises?.length || 0} Exs</span>
                                                    {daysAgo && (
                                                        <>
                                                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter italic">{daysAgo}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {lastDoneDate && <IconTrophy size={14} className="text-amber-400 opacity-20 group-hover:opacity-100 transition-all group-hover:scale-125" />}
                                            <IconChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <button 
                    onClick={() => setEditingBlock({ id: crypto.randomUUID(), title: '', color: 'slate', iconId: 'dumbbell', exercises: [], _isNew: true })} 
                    className="w-full border-2 border-dashed border-slate-200 rounded-[2rem] py-5 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all font-black text-xs uppercase tracking-widest bg-slate-50/50"
                >
                    <IconPlus size={18} /> Nuevo Bloque
                </button>
            </div>

            {/* Auditoría con IA */}
            <button 
                onClick={handleAuditRoutine}
                className="w-full bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200 active:scale-[0.98] transition-transform flex items-center justify-between group overflow-hidden relative"
            >
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <span className="text-8xl">✨</span>
                </div>
                <div className="relative z-10 text-left">
                    <h3 className="text-xl font-black tracking-tight mb-1">Auditar Rutina con IA</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Análisis biomecánico en segundos
                    </p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm relative z-10">
                    <IconChevronRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />
                </div>
            </button>

            {/* Centro de Notificaciones Inteligentes (Persistente en Supabase) */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className={`p-4 flex items-center justify-between transition-colors ${profile.notif_enabled ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${profile.notif_enabled ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            <IconBell size={16} />
                        </div>
                        <div>
                            <h3 className={`font-black text-sm ${profile.notif_enabled ? 'text-white' : 'text-slate-500'}`}>Notificaciones</h3>
                            <p className={`text-[9px] font-bold uppercase tracking-widest ${profile.notif_enabled ? 'text-slate-400' : 'text-slate-400'}`}>
                                {profile.notif_enabled ? 'Sincronizado con Cloud' : 'Desactivado'}
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={profile.notif_enabled}
                            onChange={async (e) => {
                                const enabled = e.target.checked;
                                if (enabled) await requestNotificationPermission();
                                saveProfile({ ...profile, notif_enabled: enabled });
                            }}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>

                {profile.notif_enabled && (
                    <div className="p-5 space-y-6 animate-in slide-in-from-top duration-300">
                        {/* Selector de Hora */}
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">⏰</span>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Recordatorio</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">Hora de entreno sugerida</p>
                                </div>
                            </div>
                            <input
                                type="time"
                                value={profile.notif_time}
                                onChange={(e) => saveProfile({ ...profile, notif_time: e.target.value })}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'streak', label: 'Alerta de racha en riesgo', desc: 'Aviso a las 20:00 si no has entrenado', emoji: '🔥' },
                                { id: 'achievements', label: 'Logros y Records (PRs)', desc: 'Festejos inmediatos al batir récords', emoji: '🏆' },
                                { id: 'summary', label: 'Resumen semanal', desc: 'Balance de cada domingo a las 20:00', emoji: '📊' },
                                { id: 'coach', label: 'Tips del Coach', desc: 'Insights de salud cada lunes 9:00', emoji: '💡' },
                                { id: 'hydration', label: 'Hidratación Smart', desc: 'Avisos durante el día', emoji: '💧' }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between group">
                                    <div className="flex items-start gap-3">
                                        <span className="text-base mt-0.5">{item.emoji}</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 leading-tight">{item.label}</h4>
                                            <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={profile.notif_settings[item.id as keyof typeof profile.notif_settings]}
                                            onChange={(e) => saveProfile({
                                                ...profile,
                                                notif_settings: { ...profile.notif_settings, [item.id]: e.target.checked }
                                            })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch('/api/test-push', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ userId: profile.id })
                                        });
                                        const text = await response.text();
                                        let data;
                                        try { data = JSON.parse(text); } catch (e) { data = { error: text }; }

                                        if (response.ok && data.success) {
                                            alert('✅ Solicitud enviada. Espera unos segundos.');
                                        } else {
                                            alert('❌ Error del servidor: ' + (data.error || 'Desconocido'));
                                        }
                                    } catch (err: any) {
                                        alert('❌ Error de conexión: ' + err.message);
                                    }
                                }}
                                className="w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
                            >
                                🧪 Probar Notificación Push (Servidor)
                            </button>
                        </div>

                        <div className="pt-2">
                            <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                Reglas: Máx 2 notif/día · Nunca después de las 22:00
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Acciones del Sistema */}
            <div className="space-y-3">
                {/* Reset a plan original */}
                {planBlocksOverride && planBlocksOverride[userKey] && (
                    <button
                        onClick={() => {
                            if (!confirm('¿Restaurar la rutina original? Se perderán los cambios personalizados.')) return;
                            setPlanBlocksOverride((prev: any) => {
                                const next = { ...prev };
                                delete next[userKey];
                                return Object.keys(next).length > 0 ? next : null;
                            });
                        }}
                        className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 py-2 transition-colors"
                    >
                        <IconSync size={12} className="inline mr-1" /> Restaurar rutina original
                    </button>
                )}


                {/* Logout */}
                <button onClick={handleLogout} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 text-sm font-bold text-rose-400 hover:text-rose-600 transition-colors flex items-center justify-center gap-2 text-center">
                    <IconLogout size={16} /> Cerrar Sesión
                </button>

                {/* Versión y Update */}
                <div className="pt-8 pb-4 text-center space-y-4">
                    <div className="flex flex-col items-center gap-1 opacity-40">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Ana App v1.1.2</span>
                        <span className="text-[8px] font-bold text-slate-300">Build 2026.04.27 (New VAPID Keys)</span>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('¿Forzar actualización? Esto recargará la app completamente.')) {
                                if ('serviceWorker' in navigator) {
                                    navigator.serviceWorker.getRegistrations().then(registrations => {
                                        for (let registration of registrations) {
                                            registration.unregister();
                                        }
                                        window.location.reload();
                                    });
                                } else {
                                    window.location.reload();
                                }
                            }
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-100 active:scale-95 transition-all"
                    >
                        Forzar actualización
                    </button>
                </div>
            </div>

            {showAuditModal && (
                <RoutineAuditModal 
                    auditResult={auditResult} 
                    isLoading={isAuditing} 
                    onClose={() => setShowAuditModal(false)} 
                />
            )}

            {showAuditForm && (
                <RoutineAuditForm 
                    onComplete={handleAuditFormComplete}
                    onClose={() => setShowAuditForm(false)}
                />
            )}
        </div>
    );
};


export default Profile;
