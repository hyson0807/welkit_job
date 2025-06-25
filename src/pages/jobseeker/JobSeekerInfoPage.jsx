// src/pages/jobseeker/JobSeekerInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';

const JobSeekerInfoPage = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        visa: '',
        visa_expiry: ''
    });

    // 프로필 정보 가져오기
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [user, navigate]);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            // profiles 테이블에서 사용자 정보 가져오기
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116: no rows returned
                throw error;
            }

            if (profile) {
                setProfile(profile);
                setFormData({
                    name: profile.name || '',
                    email: profile.email || user.email || '',
                    visa: profile.visa || '',
                    visa_expiry: profile.visa_expiry || ''
                });
            } else {
                // 프로필이 없는 경우 기본값 설정
                setFormData(prev => ({
                    ...prev,
                    email: user.email || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveAndNext = async () => {
        try {
            setSaving(true);

            // profiles 테이블 업데이트 또는 삽입
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: formData.name,
                    email: formData.email,
                    visa: formData.visa,
                    visa_expiry: formData.visa_expiry,
                })
                .eq('id', user.id);

            if (error) throw error;

            // 다음 단계로 이동 (키워드 선택)
            navigate('/jobseeker/keywords');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F6F4]">
            {/* Header */}
            <div className="bg-[#1E4B7B] text-white px-5 py-4 shadow-lg">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Job Seeker Registration</h1>
                        <p className="text-sm opacity-80 mt-1">Step 1: Basic Information</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                        <span>🚪</span>
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white shadow-sm">
                <div className="max-w-2xl mx-auto px-5 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#1E4B7B] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                1
                            </div>
                            <span className="ml-2 text-sm font-medium">Basic Info</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
                            <div className="h-full w-1/3 bg-[#1E4B7B] rounded-full"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-semibold text-sm">
                                2
                            </div>
                            <span className="ml-2 text-sm text-gray-400">Keywords</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-semibold text-sm">
                                3
                            </div>
                            <span className="ml-2 text-sm text-gray-400">Matching</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto px-5 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Your Information</h2>

                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent bg-gray-50"
                                required
                                disabled={true} // 이메일은 수정 불가
                            />
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                        </div>

                        {/* Visa Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visa Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="visa"
                                value={formData.visa}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                required
                            >
                                <option value="">Select your visa type</option>
                                <option value="E-9">E-9 (Non-professional Employment)</option>
                                <option value="H-2">H-2 (Working Visit)</option>
                                <option value="F-4">F-4 (Overseas Korean)</option>
                                <option value="F-6">F-6 (Marriage Immigrant)</option>
                                <option value="F-2">F-2 (Resident)</option>
                                <option value="F-5">F-5 (Permanent Resident)</option>
                            </select>
                        </div>

                        {/* Visa Expiry Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visa Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="visa_expiry"
                                value={formData.visa_expiry}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                required
                                min={new Date().toISOString().split('T')[0]} // 오늘 날짜 이후만 선택 가능
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSaveAndNext}
                            disabled={saving || !formData.name || !formData.visa || !formData.visa_expiry}
                            className="flex-1 py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Next: Select Keywords'}
                        </button>
                    </div>
                </div>

                {/* Profile Status */}
                {profile && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700">
                            ✓ Profile found. Created: {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobSeekerInfoPage;