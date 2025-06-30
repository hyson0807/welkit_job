import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneAuthForm from '../../components/PhoneAuthForm';

const LoginPage = () => {
    const navigate = useNavigate();

    // localStorage에서 userType 가져오기
    const userType = localStorage.getItem('userType');

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E4B7B] to-[#2A5A8A] flex items-center justify-center px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-2">WelKit</h1>
                    <p className="text-white/80 text-sm">AI Matching Recruitment Platform</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* User Type Indicator */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F6F6F4] rounded-full">
                            <span className="text-2xl">{userType === 'user' ? '👔' : '🏢'}</span>
                            <span className="text-sm font-medium text-gray-700">
                                {userType === 'user' ? 'Job Seeker' : 'Employer'} Account
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                        전화번호로 로그인
                    </h2>

                    {/* Phone Auth Form */}
                    <PhoneAuthForm userType={userType}/>

                    {/* Additional Info */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        By signing up, you agree to our{' '}
                        <a href="#" className="text-[#1E4B7B] hover:underline">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-[#1E4B7B] hover:underline">
                            Privacy Policy
                        </a>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;