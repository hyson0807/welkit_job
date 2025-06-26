// src/pages/jobseeker/JobSeekerAdditionalInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import { useCheckUserType } from "../auth/checkUserType.js";

const JobSeekerAdditionalInfoPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('user');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        korean_level: '',
        available_date: '',
        description: ''
    });

    // 기존 프로필 정보 가져오기
    const fetchProfile = async () => {
        try {
            setLoading(true);

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('korean_level, available_date, description')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (profile) {
                setFormData({
                    korean_level: profile.korean_level || '',
                    available_date: profile.available_date || '',
                    description: profile.description || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    if (isLoading) { return <div>Loading...</div>; }
    if (!isAuthorized) { return null; }

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

            // profiles 테이블 업데이트
            const { error } = await supabase
                .from('profiles')
                .update({
                    korean_level: formData.korean_level,
                    available_date: formData.available_date,
                    description: formData.description
                })
                .eq('id', user.id);

            if (error) throw error;

            // 매칭 페이지로 이동
            navigate('/jobseeker/matching');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save information. Please try again.');
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
                        <p className="text-sm opacity-80 mt-1">Step 3: Additional Information</p>
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
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                ✓
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">Basic Info</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
                            <div className="h-full w-full bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                ✓
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">Keywords</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
                            <div className="h-full w-1/2 bg-[#1E4B7B] rounded-full"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#1E4B7B] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                3
                            </div>
                            <span className="ml-2 text-sm font-medium">Additional Info</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-semibold text-sm">
                                4
                            </div>
                            <span className="ml-2 text-sm text-gray-400">Matching</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto px-5 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Information</h2>

                    <div className="space-y-6">
                        {/* Korean Language Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Korean Language Level <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, korean_level: 'Beginner' }))}
                                    className={`py-3 px-4 rounded-lg border-2 transition-all ${
                                        formData.korean_level === 'Beginner'
                                            ? 'border-[#1E4B7B] bg-[#1E4B7B] text-white'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="font-medium">초급</div>
                                    <div className="text-xs mt-1 opacity-80">Beginner</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, korean_level: 'Intermediate' }))}
                                    className={`py-3 px-4 rounded-lg border-2 transition-all ${
                                        formData.korean_level === 'Intermediate'
                                            ? 'border-[#1E4B7B] bg-[#1E4B7B] text-white'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="font-medium">중급</div>
                                    <div className="text-xs mt-1 opacity-80">Intermediate</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, korean_level: 'Advanced' }))}
                                    className={`py-3 px-4 rounded-lg border-2 transition-all ${
                                        formData.korean_level === 'Advanced'
                                            ? 'border-[#1E4B7B] bg-[#1E4B7B] text-white'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="font-medium">고급</div>
                                    <div className="text-xs mt-1 opacity-80">Advanced</div>
                                </button>
                            </div>
                        </div>

                        {/* Available Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Available Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="available_date"
                                value={formData.available_date}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <p className="mt-1 text-xs text-gray-500">When can you start working?</p>
                        </div>

                        {/* Self Introduction */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brief Self Introduction <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={5}
                                maxLength={500}
                                placeholder="Introduce yourself briefly to potential employers..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent resize-none"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500 text-right">
                                {formData.description.length}/500 characters
                            </p>
                        </div>
                    </div>

                    {/* Sample Introduction Box */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Introduction Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Mention your work experience and skills</li>
                            <li>• Describe your work style and strengths</li>
                            <li>• Express your career goals in Korea</li>
                            <li>• Keep it concise and professional</li>
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => navigate('/jobseeker/keywords')}
                            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSaveAndNext}
                            disabled={saving || !formData.korean_level || !formData.available_date || !formData.description}
                            className="flex-1 py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Next: View Matches'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerAdditionalInfoPage;