// src/utils/checkUserType.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase/client';

export const useCheckUserType = (requiredType) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    // 로그인하지 않은 경우
                    localStorage.setItem('userType', requiredType);
                    navigate('/login');
                    setIsAuthorized(false);
                    setIsLoading(false);
                    return;
                }

                // 데이터베이스에서 실제 user_type 확인
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('user_type')
                    .eq('id', user.id)
                    .single();

                if (error || !profile) {
                    console.error('Error fetching profile:', error);
                    navigate('/');
                    setIsAuthorized(false);
                    setIsLoading(false);
                    return;
                }

                // requiredType을 데이터베이스 형식으로 변환
                const expectedDBType = requiredType === 'user' ? 'user' : 'company';

                // user_type이 일치하지 않으면
                if (profile.user_type !== expectedDBType) {
                    // 로그아웃 처리
                    await supabase.auth.signOut();

                    // 에러 메시지 표시
                    const actualType = profile.user_type === 'user' ? 'job seeker' : 'employer';
                    alert(`This page is for ${requiredType}s only. You are logged in as a ${actualType}.`);

                    // 메인 페이지로 이동
                    navigate('/');
                    setIsAuthorized(false);
                } else {
                    // 권한이 있는 경우
                    setIsAuthorized(true);
                }
            } catch (error) {
                console.error('Error in checkUserType:', error);
                navigate('/');
                setIsAuthorized(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [requiredType, navigate]);

    return { isAuthorized, isLoading };
};