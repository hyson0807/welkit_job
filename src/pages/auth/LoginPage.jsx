import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase/client';
import axios from 'axios';
import PhoneAuthForm from '../../components//PhoneAuthForm';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
    const navigate = useNavigate();

    // localStorage에서 userType 가져오기
    const userType = localStorage.getItem('userType');

    const handleSignIn = async () => {
        setIsLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                setError('Invalid email or password');
                return;
            }

            // 로그인 성공
            if (userType === 'user') {
                navigate('/jobseeker/info');
            } else {
                navigate('/employer/info');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await axios.post('https://1232-production.up.railway.app/signup', {
                email,
                password,
                user_type: userType
            });

            if (response.data.success) {
                setSuccessMessage('Account created successfully! Signing you in...');
                // 회원가입 성공 시 자동 로그인
                setTimeout(() => {
                    handleSignIn();
                }, 1500);
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || 'Failed to create account');
            } else {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setIsLoading(false);
        }
    };



    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && authMethod === 'email') {
            handleSignIn();
        }
    };

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
                        Welcome Back!
                    </h2>

                    {/* Auth Method Tabs */}
                    <div className="flex mb-6 p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setAuthMethod('email')}
                            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                                authMethod === 'email'
                                    ? 'bg-white text-[#1E4B7B] shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            이메일
                        </button>
                        <button
                            onClick={() => setAuthMethod('phone')}
                            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                                authMethod === 'phone'
                                    ? 'bg-white text-[#1E4B7B] shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            전화번호
                        </button>
                    </div>

                    {/* Error/Success Messages for Email Auth */}
                    {authMethod === 'email' && error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {authMethod === 'email' && successMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                            {successMessage}
                        </div>
                    )}

                    {/* Form */}
                    {authMethod === 'email' ? (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent transition-all"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent transition-all"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={handleSignIn}
                                    disabled={isLoading}
                                    className="w-full py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </button>

                                <button
                                    onClick={handleSignUp}
                                    disabled={isLoading}
                                    className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Creating account...' : 'Create Account'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <PhoneAuthForm userType={userType}/>
                    )}

                    {/* Divider */}
                    <div className="mt-6 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative">
                                <span className="px-4 bg-white text-sm text-gray-500">
                                    {authMethod === 'email' ? 'New to WelKit?' : '간편 로그인'}
                                </span>
                            </div>
                        </div>
                    </div>

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