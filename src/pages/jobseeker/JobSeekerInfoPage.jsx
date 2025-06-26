import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import {useCheckUserType} from "../auth/checkUserType.js";

const JobSeekerInfoPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('user');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        birth_date: '',
        nationality: '',
        visa: '',
        location: ''
    });

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
                    birth_date: profile.birth || '',
                    nationality: profile.country || '',
                    visa: profile.visa || '',
                    location: profile.address || ''
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
        if (user) {
            fetchProfile();
        }
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
                    birth: formData.birth_date,
                    country: formData.nationality,
                    visa: formData.visa,
                    address: formData.location
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
                        {/* Name and Birth Date - One Line */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Birth Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        {/* Nationality and Visa - One Line */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nationality <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select nationality</option>
                                    <option value="Vietnam">Vietnam</option>
                                    <option value="China">China</option>
                                    <option value="Philippines">Philippines</option>
                                    <option value="Thailand">Thailand</option>
                                    <option value="Indonesia">Indonesia</option>
                                    <option value="Cambodia">Cambodia</option>
                                    <option value="Myanmar">Myanmar</option>
                                    <option value="Nepal">Nepal</option>
                                    <option value="Bangladesh">Bangladesh</option>
                                    <option value="Sri Lanka">Sri Lanka</option>
                                    <option value="Mongolia">Mongolia</option>
                                    <option value="Uzbekistan">Uzbekistan</option>
                                    <option value="Pakistan">Pakistan</option>
                                    <option value="India">India</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
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
                                    <option value="">Select visa type</option>
                                    <option value="E-9">E-9 (Non-professional Employment)</option>
                                    <option value="H-2">H-2 (Working Visit)</option>
                                    <option value="F-4">F-4 (Overseas Korean)</option>
                                    <option value="F-6">F-6 (Marriage Immigrant)</option>
                                    <option value="F-2">F-2 (Resident)</option>
                                    <option value="F-5">F-5 (Permanent Resident)</option>
                                </select>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Location <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                                required
                            >
                                <option value="">Select location</option>
                                <option value="Seoul">Seoul</option>
                                <option value="Gyeonggi">Gyeonggi</option>
                                <option value="Incheon">Incheon</option>
                                <option value="Busan">Busan</option>
                                <option value="Daegu">Daegu</option>
                                <option value="Gwangju">Gwangju</option>
                                <option value="Daejeon">Daejeon</option>
                                <option value="Ulsan">Ulsan</option>
                                <option value="Sejong">Sejong</option>
                                <option value="Gangwon">Gangwon</option>
                                <option value="Chungbuk">Chungbuk</option>
                                <option value="Chungnam">Chungnam</option>
                                <option value="Jeonbuk">Jeonbuk</option>
                                <option value="Jeonnam">Jeonnam</option>
                                <option value="Gyeongbuk">Gyeongbuk</option>
                                <option value="Gyeongnam">Gyeongnam</option>
                                <option value="Jeju">Jeju</option>
                            </select>
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
                            disabled={saving || !formData.name || !formData.birth_date || !formData.nationality || !formData.visa || !formData.location}
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