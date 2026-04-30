import React from 'react';
import { IconX, IconActivity, IconTrophy } from '../constants';
import type { RoutineAuditResult } from '../services/ai';

interface RoutineAuditModalProps {
    auditResult: RoutineAuditResult | null;
    isLoading: boolean;
    onClose: () => void;
}

const actionConfig = {
    keep: { color: 'emerald', icon: '✅', label: 'Mantener' },
    add: { color: 'indigo', icon: '➕', label: 'Agregar' },
    remove: { color: 'rose', icon: '➖', label: 'Quitar' },
    swap: { color: 'amber', icon: '🔄', label: 'Cambiar' },
};

const RoutineAuditModal: React.FC<RoutineAuditModalProps> = ({ auditResult, isLoading, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300" onClick={onClose}>
            <div 
                className="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col" 
                style={{ height: '85vh' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-2">
                            Auditoría IA <span className="text-xl">✨</span>
                        </h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            Análisis Biomecánico
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6 hide-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center opacity-70">
                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest animate-pulse">
                                El Coach está evaluando tu rutina...
                            </p>
                        </div>
                    ) : auditResult ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Score Card */}
                            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl shadow-slate-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <IconActivity size={100} />
                                </div>
                                <div className="relative z-10 flex flex-col items-start gap-4">
                                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                                        <IconTrophy size={14} className="text-amber-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Score de Balance</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black tracking-tighter leading-none">{auditResult.balanceScore}</span>
                                        <span className="text-xl font-bold text-slate-400">/100</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-300 leading-relaxed max-w-[85%]">
                                        {auditResult.verdict}
                                    </p>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Recomendaciones</h4>
                                
                                <div className="space-y-3">
                                    {auditResult.recommendations.map((rec, idx) => {
                                        const config = actionConfig[rec.action];
                                        return (
                                            <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-start gap-4 group hover:border-slate-200 transition-colors">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-${config.color}-50 text-${config.color}-500 shrink-0`}>
                                                    {config.icon}
                                                </div>
                                                <div className="pt-0.5">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest text-${config.color}-500 bg-${config.color}-50 px-1.5 py-0.5 rounded`}>
                                                            {config.label}
                                                        </span>
                                                        <h5 className="font-black text-slate-800 text-sm">{rec.target}</h5>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                        {rec.reason}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 py-10">
                            <p>No se pudo generar la auditoría.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoutineAuditModal;
