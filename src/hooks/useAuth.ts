import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userSession, setUserSession] = useState<any>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        async function fetchInitialSession() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserSession(session);
                setIsAuthenticated(true);
            }
        }
        fetchInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserSession(session);
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setLoginError('');
        setIsLoggingIn(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });
            if (error) {
                setLoginError('Usuario o contraseña incorrectos.');
                return false;
            }
            if (data.session) {
                setUserSession(data.session);
                setIsAuthenticated(true);
                return true;
            }
        } catch (e) {
            setLoginError('Error de red al conectar con Supabase.');
        } finally {
            setIsLoggingIn(false);
        }
        return false;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUserSession(null);
        setIsAuthenticated(false);
    };

    return {
        isAuthenticated, userSession, isLoggingIn, loginError,
        login, logout
    };
};
