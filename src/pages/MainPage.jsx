// src/pages/MainPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
    const [language, setLanguage] = useState('en');
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const navigate = useNavigate();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
    ];

    const handleModeSelect = (mode) => {
        // 유저 타입을 저장하고 로그인 페이지로 이동
        localStorage.setItem('userType', mode);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#F6F6F4] overflow-x-hidden">
            {/* Main Hero Section */}
            <div className="bg-gradient-to-br from-[#1E4B7B] to-[#2A5A8A] text-white px-5 pt-10 pb-16 relative overflow-hidden">
                <div className="max-w-2xl mx-auto text-center relative z-10">
                    {/* Logo */}
                    <div className="mb-10">
                        <h1 className="text-5xl font-extrabold mb-2 tracking-tight">WelKit</h1>
                        <div className="text-sm opacity-80 tracking-widest uppercase">AI Matching Recruitment Platform</div>
                    </div>

                    {/* Visual Elements with Language Selector in Center */}
                    <div className="relative h-44 mb-10 flex items-center justify-center">
                        {/* Center Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                className="flex items-center gap-3 px-6 py-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
                            >
                                <span className="text-2xl">🌐</span>
                                <div className="text-left">
                                    <div className="text-xs opacity-80 mb-1">Select Language</div>
                                    <div className="text-base font-semibold flex items-center gap-2">
                                        <span>{languages.find(lang => lang.code === language)?.flag}</span>
                                        <span>{languages.find(lang => lang.code === language)?.name}</span>
                                    </div>
                                </div>
                                <span className={`ml-2 transition-transform duration-300 ${showLanguageMenu ? 'rotate-180' : ''}`}>▼</span>
                            </button>

                            {showLanguageMenu && (
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-w-[200px]">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setShowLanguageMenu(false);
                                            }}
                                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-800 ${
                                                language === lang.code ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <span className="text-xl">{lang.flag}</span>
                                            <span className="text-sm font-medium">{lang.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Title */}
                    <h2 className="text-3xl font-bold mb-3">Interview Confirmed in 5 Seconds!</h2>
                    <p className="text-base opacity-90">AI-powered personalized job matching</p>
                </div>
            </div>

            {/* Mode Selection */}
            <div className="px-5 py-8 max-w-2xl mx-auto">
                <div className="flex gap-5">
                    {/* Job Seeker Card */}
                    <div
                        onClick={() => handleModeSelect('jobseeker')}
                        className="flex-1 bg-white rounded-2xl p-7 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 border-transparent hover:border-[#1E4B7B] relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E4B7B] to-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                        <div className="relative inline-block mb-4">
                            <div className="text-5xl">👔</div>
                            <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                                JOB
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-[#1E4B7B] mb-2">Find Jobs</h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Start rocket interviews<br/>with simple keywords
                        </p>

                        <div className="flex justify-center gap-3 text-xs text-[#1E4B7B] font-semibold">
                            <span>✓ AI Resume</span>
                            <span>✓ Auto Matching</span>
                        </div>
                    </div>

                    {/* Employer Card */}
                    <div
                        onClick={() => handleModeSelect('employer')}
                        className="flex-1 bg-white rounded-2xl p-7 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 border-transparent hover:border-[#1E4B7B] relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E4B7B] to-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                        <div className="relative inline-block mb-4">
                            <div className="text-5xl">🏢</div>
                            <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                                HIRE
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-[#1E4B7B] mb-2">Find Talent</h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Set conditions and<br/>confirm interviews automatically
                        </p>

                        <div className="flex justify-center gap-3 text-xs text-[#1E4B7B] font-semibold">
                            <span>✓ Keyword Filter</span>
                            <span>✓ Real-time Alerts</span>
                        </div>
                    </div>
                </div>

                {/* Stats Container */}
                <div className="mt-10 p-6 bg-[#F6F6F4] rounded-2xl flex justify-around">
                    <div className="text-center">
                        <div className="text-3xl font-extrabold text-[#1E4B7B] mb-1">12,847</div>
                        <div className="text-xs text-gray-600">Today's Matches</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-extrabold text-[#1E4B7B] mb-1">95%</div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-extrabold text-[#1E4B7B] mb-1">5s</div>
                        <div className="text-xs text-gray-600">Avg. Match Time</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;