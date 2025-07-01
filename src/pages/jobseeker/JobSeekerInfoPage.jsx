import React, { useState, useEffect } from 'react';
import { User, Calendar, Globe, MapPin, Users, ToggleLeft } from 'lucide-react';
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../store/contexts/AuthContext.jsx";
import {useCheckUserType} from "../auth/checkUserType.js";
import {supabase} from "../../services/supabase/client.js";

const JobSeekerInfoPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        birth_date: '',
        nationality: '',
        location: '',
        gender: '',
        moveable: 0
    });

    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { isAuthorized, isLoading } = useCheckUserType('user');

    const fetchProfile = async () => {
        try {
            setLoading(true);

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
                    birth_date: profile.birth || '',
                    nationality: profile.country || '',
                    location: profile.address || '',
                    gender: profile.gender || '',
                    moveable: profile.moveable !== null ? profile.moveable : 0
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

            const updateData = {
                name: formData.name,
                birth: formData.birth_date,
                country: formData.nationality,
                address: formData.location,
                gender: formData.gender,
                moveable: formData.moveable
            };

            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', user.id);

            if (error) throw error;

            navigate('/jobseeker/keywords');

            alert('저장되었습니다. (다음 단계로 이동)');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        alert('로그아웃되었습니다.');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">프로필 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-900 text-white px-5 py-4 shadow-lg">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">구직자 등록</h1>
                        <p className="text-sm opacity-80 mt-1">단계 1: 기본 정보</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                        <span>🚪</span>
                        <span className="text-sm font-medium">로그아웃</span>
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white shadow-sm">
                <div className="max-w-2xl mx-auto px-5 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                1
                            </div>
                            <span className="ml-2 text-sm font-medium">기본 정보</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
                            <div className="h-full w-1/3 bg-blue-900 rounded-full"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-semibold text-sm">
                                2
                            </div>
                            <span className="ml-2 text-sm text-gray-400">키워드</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-semibold text-sm">
                                3
                            </div>
                            <span className="ml-2 text-sm text-gray-400">매칭</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto px-5 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">정보를 입력해주세요</h2>

                    <div className="space-y-6">
                        {/* Name and Birth Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="inline w-4 h-4 mr-1" />
                                    이름 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="이름을 입력하세요"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="inline w-4 h-4 mr-1" />
                                    생년월일 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        {/* Nationality and Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Globe className="inline w-4 h-4 mr-1" />
                                    국적 <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">국적 선택</option>
                                    <option value="Vietnam">베트남</option>
                                    <option value="China">중국</option>
                                    <option value="Philippines">필리핀</option>
                                    <option value="Thailand">태국</option>
                                    <option value="Indonesia">인도네시아</option>
                                    <option value="Cambodia">캄보디아</option>
                                    <option value="Myanmar">미얀마</option>
                                    <option value="Nepal">네팔</option>
                                    <option value="Bangladesh">방글라데시</option>
                                    <option value="Sri Lanka">스리랑카</option>
                                    <option value="Mongolia">몽골</option>
                                    <option value="Uzbekistan">우즈베키스탄</option>
                                    <option value="Pakistan">파키스탄</option>
                                    <option value="India">인도</option>
                                    <option value="Other">기타</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="inline w-4 h-4 mr-1" />
                                    현재 거주 지역 <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">지역 선택</option>
                                    <option value="Seoul">서울</option>
                                    <option value="Gyeonggi">경기</option>
                                    <option value="Incheon">인천</option>
                                    <option value="Busan">부산</option>
                                    <option value="Daegu">대구</option>
                                    <option value="Gwangju">광주</option>
                                    <option value="Daejeon">대전</option>
                                    <option value="Ulsan">울산</option>
                                    <option value="Sejong">세종</option>
                                    <option value="Gangwon">강원</option>
                                    <option value="Chungbuk">충북</option>
                                    <option value="Chungnam">충남</option>
                                    <option value="Jeonbuk">전북</option>
                                    <option value="Jeonnam">전남</option>
                                    <option value="Gyeongbuk">경북</option>
                                    <option value="Gyeongnam">경남</option>
                                    <option value="Jeju">제주</option>
                                </select>
                            </div>
                        </div>

                        {/* Gender and Moveable */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Users className="inline w-4 h-4 mr-1" />
                                    성별 <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, gender: 'Male' }))}
                                        className={`py-3 px-4 rounded-lg border-2 transition-all ${
                                            formData.gender === 'Male'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="font-medium">남성</div>
                                        <div className="text-xs mt-1 opacity-80">Male</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, gender: 'Female' }))}
                                        className={`py-3 px-4 rounded-lg border-2 transition-all ${
                                            formData.gender === 'Female'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="font-medium">여성</div>
                                        <div className="text-xs mt-1 opacity-80">Female</div>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <ToggleLeft className="inline w-4 h-4 mr-1" />
                                    지역 이동 가능 <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, moveable: 1 }))}
                                        className={`py-3 px-4 rounded-lg border-2 transition-all ${
                                            formData.moveable === 1
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="font-medium">가능</div>
                                        <div className="text-xs mt-1 opacity-80">Yes</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, moveable: 0 }))}
                                        className={`py-3 px-4 rounded-lg border-2 transition-all ${
                                            formData.moveable === 0
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="font-medium">불가능</div>
                                        <div className="text-xs mt-1 opacity-80">No</div>
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    다른 지역으로 이동하여 근무가 가능한지 선택해주세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => navigate('/jobseeker/dashboard')}
                            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            뒤로
                        </button>
                        <button
                            onClick={handleSaveAndNext}
                            disabled={
                                saving ||
                                !formData.name ||
                                !formData.birth_date ||
                                !formData.nationality ||
                                !formData.location ||
                                !formData.gender ||
                                formData.moveable === null ||
                                formData.moveable === undefined
                            }
                            className="flex-1 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? '저장 중...' : '다음: 키워드 선택'}
                        </button>
                    </div>
                </div>

                {/* Profile Status */}
                {profile && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700">
                            ✓ 프로필 찾음. 생성일: {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                        {profile.phone_number && (
                            <p className="text-sm text-blue-700 mt-1">
                                📱 등록된 전화번호: {profile.phone_number}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobSeekerInfoPage;