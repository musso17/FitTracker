import React from 'react';
import { IconTarget } from '../constants';

interface ProfileModalProps {
    profile: any;
    setProfile: (p: any) => void;
    setIsProfileModalOpen: (open: boolean) => void;
    saveProfile: (p: any) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
    profile,
    setProfile,
    setIsProfileModalOpen,
    saveProfile
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-8 space-y-8 animate-in slide-in-from-bottom-10 duration-500">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconTarget size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">Mi Perfil Físico</h3>
                    <p className="text-sm text-slate-500">Ajusta tus datos para recalcular tus logros biomecánicos.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estatura (cm)</label>
                        <input 
                            type="number" 
                            inputMode="numeric"
                            value={profile.height} 
                            onChange={e => setProfile({...profile, height: parseInt(e.target.value) || 0})}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 text-center text-2xl font-black text-slate-800 focus:border-slate-300 focus:ring-0 outline-none transition-all" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Peso (kg)</label>
                        <input 
                            type="number" 
                            inputMode="numeric"
                            value={profile.weight} 
                            onChange={e => setProfile({...profile, weight: parseInt(e.target.value) || 0})}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 text-center text-2xl font-black text-slate-800 focus:border-slate-300 focus:ring-0 outline-none transition-all" 
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Especialidad</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'surf', label: 'Surf' },
                                { id: 'muay_thai', label: 'Muay Thai' }
                            ].map(sport => (
                                <button
                                    key={sport.id}
                                    onClick={() => setProfile({...profile, sport_focus: sport.id})}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${profile.sport_focus === sport.id ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                >
                                    {sport.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objetivo Principal</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'mass', label: 'Masa' },
                                { id: 'performance', label: 'Poder' },
                                { id: 'fat_loss', label: 'Grasa' }
                            ].map(obj => (
                                <button
                                    key={obj.id}
                                    onClick={() => setProfile({...profile, main_objective: obj.id})}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${profile.main_objective === obj.id ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                >
                                    {obj.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <button 
                        onClick={() => {
                            saveProfile(profile);
                            setIsProfileModalOpen(false);
                        }}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-transform"
                    >
                        Guardar Perfil
                    </button>
                    <button 
                        onClick={() => setIsProfileModalOpen(false)}
                        className="w-full text-slate-400 py-2 font-bold text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
