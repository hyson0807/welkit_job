import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import { useCheckUserType } from "../auth/checkUserType.js";
import { Phone, Mail, MapPin, Calendar, Globe, CreditCard, User, FileText, ChevronLeft, CheckCircle } from 'lucide-react';

const JobSeekerResumePreviewPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('user');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [keywords, setKeywords] = useState([]);
    const [confirming, setConfirming] = useState(false);

    // 프로필 및 키워드 정보 가져오기
    const fetchUserData = async () => {
        try {
            setLoading(true);

            // 1. 프로필 정보 가져오기
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;
            setProfileData(profile);

            // 2. 선택한 키워드 정보 가져오기
            const { data: userKeywords, error: keywordsError } = await supabase
                .from('user_keyword')
                .select(`
                    keyword_id,
                    keyword:keyword_id (
                        id,
                        keyword,
                        category
                    )
                `)
                .eq('user_id', user.id);

            if (keywordsError) throw keywordsError;

            // 카테고리별로 그룹핑
            const groupedKeywords = userKeywords.reduce((acc, item) => {
                const category = item.keyword.category;
                if (!acc[category]) acc[category] = [];
                acc[category].push(item.keyword);
                return acc;
            }, {});

            setKeywords(groupedKeywords);

        } catch (error) {
            console.error('Error fetching user data:', error);
            alert('프로필 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthorized) return null;

    const handleLogout = async () => {
        await signOut();
    };

    const handleConfirmAndNext = async () => {
        setConfirming(true);
        // 여기서 추가 작업이 필요하다면 수행
        setTimeout(() => {
            navigate('/jobseeker/matching');
        }, 500);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '미입력';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    };

    const getCategoryIcon = (category) => {
        const icons = {
            '직무': '💼',
            '지역': '📍',
            '혜택': '🎁'
        };
        return icons[category] || '📌';
    };

    const getCategoryColor = (category) => {
        const colors = {
            '직무': 'bg-red-100 text-red-700 border-red-200',
            '지역': 'bg-blue-100 text-blue-700 border-blue-200',
            '혜택': 'bg-green-100 text-green-700 border-green-200'
        };
        return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">이력서를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F6F4]">
            {/* Header */}
            <div className="bg-[#1E4B7B] text-white px-5 py-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">이력서 최종 확인</h1>
                        <p className="text-sm opacity-80 mt-1">입력하신 정보를 확인해주세요</p>
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

            {/* Progress Bar - 모든 단계 완료 */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-5 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                ✓
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">기본 정보</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-green-500 rounded-full"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                ✓
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">키워드</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-green-500 rounded-full"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                ✓
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">추가 정보</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-[#1E4B7B] rounded-full"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#1E4B7B] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                <FileText className="w-4 h-4" />
                            </div>
                            <span className="ml-2 text-sm font-medium">이력서 확인</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resume Content */}
            <div className="max-w-4xl mx-auto px-5 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Resume Header */}
                    <div className="bg-gradient-to-r from-[#1E4B7B] to-[#2A5A8A] text-white p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">
                                    {profileData?.name || '이름 미입력'}
                                </h2>
                                <p className="text-lg opacity-90">
                                    구직자 프로필
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">작성 완료</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* 연락처 정보 섹션 */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                연락처 정보
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">전화번호</p>
                                        <p className="font-medium">{profileData?.phone_number || '미입력'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">이메일</p>
                                        <p className="font-medium">{profileData?.email || '미입력'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">희망 지역</p>
                                        <p className="font-medium">{profileData?.address || '미입력'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">생년월일</p>
                                        <p className="font-medium">{formatDate(profileData?.birth)}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 비자 및 국적 정보 */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                비자 및 국적 정보
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">국적</p>
                                        <p className="font-medium">{profileData?.country || '미입력'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">비자 유형</p>
                                        <p className="font-medium">{profileData?.visa || '미입력'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🇰🇷</span>
                                    <div>
                                        <p className="text-xs text-gray-500">한국어 수준</p>
                                        <p className="font-medium">{profileData?.korean_level || '미입력'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 근무 가능일 */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                근무 시작 가능일
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-medium text-lg">{formatDate(profileData?.available_date)}</p>
                            </div>
                        </section>

                        {/* 자기소개 */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                자기소개
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {profileData?.description || '자기소개가 없습니다.'}
                                </p>
                            </div>
                        </section>

                        {/* 선택한 키워드 */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                선택한 키워드
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(keywords).map(([category, categoryKeywords]) => (
                                    <div key={category} className="border rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <span className="text-xl">{getCategoryIcon(category)}</span>
                                            {category}
                                            <span className="text-sm font-normal text-gray-500 ml-2">
                                                ({categoryKeywords.length}개)
                                            </span>
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {categoryKeywords.map((keyword) => (
                                                <span
                                                    key={keyword.id}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(category)}`}
                                                >
                                                    {keyword.keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 px-8 py-6 border-t">
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/jobseeker/additional')}
                                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                정보 수정
                            </button>
                            <button
                                onClick={handleConfirmAndNext}
                                disabled={confirming}
                                className="flex-1 py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {confirming ? (
                                    '확인 중...'
                                ) : (
                                    <>
                                        확인 완료
                                        <CheckCircle className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 주의사항 */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">📋 확인 사항</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                        <li>• 입력하신 정보가 정확한지 다시 한번 확인해주세요</li>
                        <li>• 이 정보는 기업에게 전달되며, 매칭 기준이 됩니다</li>
                        <li>• 정보 수정이 필요하시면 '정보 수정' 버튼을 클릭하세요</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerResumePreviewPage;