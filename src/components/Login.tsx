import React from 'react';
import { IconWaves, IconActivity } from '../constants';

interface LoginProps {
    loginForm: any;
    setLoginForm: (form: any) => void;
    handleLogin: (e: React.FormEvent) => void;
    isLoggingIn: boolean;
    loginError: string;
}

const Login: React.FC<LoginProps> = ({
    loginForm,
    setLoginForm,
    handleLogin,
    isLoggingIn,
    loginError
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 font-sans text-slate-900">
            <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-xl border border-white/50 animate-in slide-in-from-bottom-8 fade-in duration-500">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-200">
                        <IconWaves size={32} className="text-white" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Bienvenido/a</h1>
                <p className="text-center text-slate-500 text-sm mb-8">Ingresa tus datos para continuar.</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" htmlFor="email">Correo</label>
                        <input id="email" type="email" placeholder="tu@email.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" htmlFor="password">Contraseña</label>
                        <input id="password" type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" required />
                    </div>
                    
                    {loginError && <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl text-center">{loginError}</div>}
                    
                    <button type="submit" disabled={isLoggingIn} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-[0.98] disabled:opacity-70 disabled:scale-100 transition-transform mt-4 flex items-center justify-center">
                        {isLoggingIn ? (
                            <span className="flex items-center gap-2">
                                <IconActivity className="animate-spin" size={18} /> Validando...
                            </span>
                        ) : (
                            "Entrar a la app"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
