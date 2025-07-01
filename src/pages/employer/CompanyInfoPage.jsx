// src/pages/employer/CompanyInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import {useCheckUserType} from "../auth/checkUserType.js";

const CompanyInfoPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('company');

    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        address: ''
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);

            // profiles 테이블에서 회사 정보 가져오기
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (profile) {
                setProfile(profile);
                setFormData({
                    name: profile.name || '',
                    description: profile.description || '',
                    website: profile.website || '',
                    address: profile.address || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    // 프로필 정보 가져오기
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [user, navigate]);

    if (isLoading) {return <div>Loading...</div>;}
    if (!isAuthorized) {return null;}


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
                    name: formData.name,
                    description: formData.description,
                    website: formData.website,
                    address: formData.address
                })
                .eq('id', user.id);

            if (error) throw error;

            // 다음 단계로 이동 (키워드 선택)
            navigate('/employer/keywords');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save company information. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    // URL 포맷팅 (http:// 자동 추가)
    const formatWebsite = (url) => {
        if (!url) return '';
        if (!/^https?:\/\//i.test(url)) {
            return `https://${url}`;
        }
        return url;
    };

    const handleWebsiteBlur = () => {
        setFormData(prev => ({
            ...prev,
            website: formatWebsite(prev.website)
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading company profile...</p>
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
                        <h1 className="text-2xl font-semibold">Employer Registration</h1>
                        <p className="text-sm opacity-80 mt-1">Step 1: Company Information</p>
                    </div>
                    <button
                        onClick={() => navigate('/employer/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                        <span className="text-sm font-medium">홈</span>
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
                            <span className="ml-2 text-sm font-medium">Company Info</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
                            <div className="h-full w-1/3 bg-[#1E4B7B] rounded-full"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-semibold text-sm">
                                2
                            </div>
                            <span className="ml-2 text-sm text-gray-400">Requirements</span>
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
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">🏢</span>
                        <h2 className="text-2xl font-bold text-gray-800">Company Information</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Company Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your company name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Company Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your company, work environment, and what makes you a great employer"
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent resize-none"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.description.length}/500 characters
                            </p>
                        </div>

                        {/* Website */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Website
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    onBlur={handleWebsiteBlur}
                                    placeholder="www.example.com"
                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🌐
                </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Optional - Leave blank if you don't have a website</p>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="123 Business St, Seoul, South Korea"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                This will help job seekers know your location
                            </p>
                        </div>
                    </div>

                    {/* Preview Card */}
                    {(formData.name || formData.description) && (
                        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-[#1E4B7B]">
                                    {formData.name || 'Company Name'}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-3">
                                    {formData.description || 'Company description will appear here...'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {formData.website && (
                                        <span className="flex items-center gap-1">
                      🌐 {formData.website.replace(/^https?:\/\//i, '')}
                    </span>
                                    )}
                                    {formData.address && (
                                        <span className="flex items-center gap-1">
                      📍 {formData.address}
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => navigate('/employer/dashboard')}
                            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSaveAndNext}
                            disabled={saving || !formData.name || !formData.description || !formData.address}
                            className="flex-1 py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Next: Set Requirements'}
                        </button>
                    </div>
                </div>

                {/* Login Info */}
                <div className="mt-6 bg-white/50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                        Logged in as: <span className="font-medium">{user?.email}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfoPage;