// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../services/supabase/client';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // 초기 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // 세션 변경 감지
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            // Supabase 로그아웃
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // localStorage 클리어
            localStorage.removeItem('userType');

            // 세션 null로 설정
            setSession(null);

            // 메인 페이지로 이동
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error.message);
        }
    };

    const value = {
        session,
        user: session?.user ?? null,
        signOut,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};