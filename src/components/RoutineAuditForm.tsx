import React, { useState } from 'react';
import { IconX } from '../constants';

interface RoutineAuditFormProps {
    onComplete: (preferences: { objective: string[], feelings: string[], equipment: string[] }) => void;
    onClose: () => void;
}

const OBJECTIVES = [
    { id: 'hipertrofia', label: 'Ganar Músculo', emoji: '💪' },
    { id: 'fuerza', label: 'Ganar Fuerza', emoji: '🏋️' },
    { id: 'grasa', label: 'Perder Grasa', emoji: '🔥' },
    { id: 'movilidad', label: 'Movilidad/Resistencia', emoji: '🤸' },
    { id: 'mantenimiento', label: 'Mantenimiento/Salud', emoji: '❤️' }
];

const FEELINGS = [
    { id: 'energia', label: 'Con mucha energía', emoji: '⚡' },
    { id: 'fatigado', label: 'Fatigado / Cansado', emoji: '🥱' },
    { id: 'dolor', label: 'Con dolores articulares', emoji: '🤕' },
    { id: 'lesion', label: 'Recuperando lesión', emoji: '🩹' }
];

const EQUIPMENT = [
    { id: 'gym', label: 'Gym Completo', emoji: '🏢' },
    { id: 'mancuernas', label: 'Mancuernas y Banco', emoji: '🪨' },
    { id: 'calistenia', label: 'Peso Corporal', emoji: '🤸' },
    { id: 'academia_marcial', label: 'Academia Artes Marciales', emoji: '🥊' }
];

const RoutineAuditForm: React.FC<RoutineAuditFormProps> = ({ onComplete, onClose }) => {
    const [objective, setObjective] = useState<string[]>([]);
    const [feelings, setFeelings] = useState<string[]>([]);
    const [equipment, setEquipment] = useState<string[]>([]);
    const [step, setStep] = useState(1);

    const handleNext = () => {
        if (step === 1 && objective.length > 0) setStep(2);
        else if (step === 2 && feelings.length > 0) setStep(3);
        else if (step === 3 && equipment.length > 0) {
            onComplete({ objective, feelings, equipment });
        }
    };

    const isNextDisabled = (step === 1 && objective.length === 0) || (step === 2 && feelings.length === 0) || (step === 3 && equipment.length === 0);

    const toggleSelection = (setter: any, current: string[], id: string) => {
        if (current.includes(id)) {
            setter(current.filter(item => item !== id));
        } else {
            setter([...current, id]);
        }
    };

    const renderOptions = (options: any[], values: string[], setter: any) => (
        <div className="grid grid-cols-2 gap-3 mt-4">
            {options.map(opt => {
                const isSelected = values.includes(opt.id);
                return (
                    <button
                        key={opt.id}
                        onClick={() => toggleSelection(setter, values, opt.id)}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white shadow-md scale-105' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                    >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-[11px] font-bold text-center">{opt.label}</span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300" onClick={onClose}>
            <div 
                className="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col relative" 
                style={{ height: '75vh' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-2">
                            Tu Perfil <span className="text-xl">🤖</span>
                        </h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            Paso {step} de 3
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8 overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h4 className="text-lg font-black text-slate-800">¿Cuáles son tus objetivos?</h4>
                            <p className="text-xs text-slate-500 mt-1">Puedes marcar más de una opción.</p>
                            {renderOptions(OBJECTIVES, objective, setObjective)}
                        </div>
                    )}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h4 className="text-lg font-black text-slate-800">¿Cómo te has sentido?</h4>
                            <p className="text-xs text-slate-500 mt-1">Importante para ajustar la intensidad.</p>
                            {renderOptions(FEELINGS, feelings, setFeelings)}
                        </div>
                    )}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h4 className="text-lg font-black text-slate-800">¿Qué equipamiento tienes?</h4>
                            <p className="text-xs text-slate-500 mt-1">Selecciona todas las que apliquen.</p>
                            {renderOptions(EQUIPMENT, equipment, setEquipment)}
                        </div>
                    )}
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                    <button
                        onClick={handleNext}
                        disabled={isNextDisabled}
                        className="w-full bg-indigo-500 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                        {step === 3 ? 'Comenzar Auditoría ✨' : 'Continuar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoutineAuditForm;
