import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import { useCheckUserType } from "../auth/checkUserType.js";
import { Building2, MapPin, Globe, Mail, Phone, Briefcase,Users, ChevronLeft, CheckCircle } from 'lucide-react';

const CompanyJobPreviewPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('company');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [companyData, setCompanyData] = useState(null);
    const [keywords, setKeywords] = useState([]);
    const [confirming, setConfirming] = useState(false);

    // 회사 정보 및 키워드 가져오기
    const fetchCompanyData = async () => {
        try {
            setLoading(true);

            // 1. 회사 프로필 정보 가져오기
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;
            setCompanyData(profile);

            // 2. 선택한 키워드 정보 가져오기
            const { data: companyKeywords, error: keywordsError } = await supabase
                .from('company_keyword')
                .select(`
                    keyword_id,
                    priority,
                    keyword:keyword_id (
                        id,
                        keyword,
                        category
                    )
                `)
                .eq('company_id', user.id);

            if (keywordsError) throw keywordsError;

            // 카테고리별로 그룹핑
            const groupedKeywords = companyKeywords.reduce((acc, item) => {
                const category = item.keyword.category;
                if (!acc[category]) acc[category] = [];
                acc[category].push({
                    ...item.keyword,
                    priority: item.priority
                });
                return acc;
            }, {});

            setKeywords(groupedKeywords);

        } catch (error) {
            console.error('Error fetching company data:', error);
            alert('회사 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCompanyData();
        }
    }, [user]);

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthorized) return null;

    const handleLogout = async () => {
        await signOut();
    };

    const handleConfirmAndNext = async () => {
        setConfirming(true);
        setTimeout(() => {
            navigate('/employer/matching');
        }, 500);
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Skills': '💪',
            'Experience': '🏭',
            'Conditions': '🎯',
            'Benefits': '💰',
            'Location': '📍',
            'Schedule': '⏰'
        };
        return icons[category] || '📌';
    };

    const getCategoryName = (category) => {
        const names = {
            'Skills': 'Required Skills',
            'Experience': 'Experience Level',
            'Conditions': 'Working Conditions',
            'Benefits': 'Offered Benefits',
            'Location': 'Work Location',
            'Schedule': 'Work Schedule'
        };
        return names[category] || category;
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Skills': 'bg-purple-100 text-purple-700 border-purple-200',
            'Experience': 'bg-orange-100 text-orange-700 border-orange-200',
            'Conditions': 'bg-blue-100 text-blue-700 border-blue-200',
            'Benefits': 'bg-green-100 text-green-700 border-green-200',
            'Location': 'bg-red-100 text-red-700 border-red-200',
            'Schedule': 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
        return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">채용 정보를 불러오는 중...</p>
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
                        <h1 className="text-2xl font-semibold">채용 공고 미리보기</h1>
                        <p className="text-sm opacity-80 mt-1">구직자에게 보여질 채용 정보를 확인하세요</p>
                    </div>
                    <button
                        onClick={() => navigate('/employer/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                        <span className="text-sm font-medium">홈</span>
                    </button>
                </div>
            </div>

            {/* Progress Bar - Step 2 */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-5 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                ✓
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">Company Info</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-green-500 rounded-full"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                ✓
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">Requirements</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-[#1E4B7B] rounded-full"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#1E4B7B] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="ml-2 text-sm font-medium">Job Preview</span>
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

            {/* Job Posting Preview */}
            <div className="max-w-4xl mx-auto px-5 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Company Header */}
                    <div className="bg-gradient-to-r from-[#1E4B7B] to-[#2A5A8A] text-white p-8">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold">
                                            {companyData?.name || 'Company Name'}
                                        </h2>
                                        <p className="text-lg opacity-90 mt-1">
                                            Now Hiring!
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <span className="text-sm font-medium">채용중</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Company Overview */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                회사 소개
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                                    {companyData?.description || 'No company description available'}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">위치</p>
                                            <p className="font-medium">{companyData?.address || 'Location not specified'}</p>
                                        </div>
                                    </div>
                                    {companyData?.website && (
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">웹사이트</p>
                                                <a
                                                    href={companyData.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-[#1E4B7B] hover:underline"
                                                >
                                                    {companyData.website.replace(/^https?:\/\//i, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Job Requirements */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                채용 요구사항
                            </h3>
                            <div className="space-y-4">
                                {Object.keys(keywords).length > 0 ? (
                                    Object.entries(keywords).map(([category, categoryKeywords]) => (
                                        <div key={category} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <span className="text-xl">{getCategoryIcon(category)}</span>
                                                {getCategoryName(category)}
                                                <span className="text-sm font-normal text-gray-500 ml-2">
                                                    ({categoryKeywords.length} items)
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
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No requirements set yet</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* How to Apply */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                지원 방법
                            </h3>
                            <div className="bg-blue-50 rounded-lg p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-2">간편 지원 시스템</h4>
                                        <p className="text-gray-600 mb-3">
                                            WelKit의 AI 매칭 시스템을 통해 적합한 지원자를 찾아드립니다.
                                        </p>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            <li>• 지원자가 '지원 메시지 보내기' 클릭 시 자동으로 연락 정보 전달</li>
                                            <li>• 회사에서 직접 관심있는 지원자에게 연락 가능</li>
                                            <li>• 실시간 매칭 알림으로 빠른 채용 진행</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Contact Info */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                연락처 정보
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">이메일</p>
                                            <p className="font-medium">{companyData?.email || 'No email provided'}</p>
                                        </div>
                                    </div>
                                    {companyData?.phone_number && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">전화번호</p>
                                                <p className="font-medium">{companyData.phone_number}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 px-8 py-6 border-t">
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/employer/keywords')}
                                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Edit Requirements
                            </button>
                            <button
                                onClick={handleConfirmAndNext}
                                disabled={confirming}
                                className="flex-1 py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {confirming ? (
                                    'Confirming...'
                                ) : (
                                    <>
                                        Confirm & Find Candidates
                                        <CheckCircle className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Note */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">📋 미리보기 안내</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                        <li>• 이 화면은 구직자들에게 보여질 채용 정보입니다</li>
                        <li>• 요구사항이 명확하게 표시되었는지 확인해주세요</li>
                        <li>• 수정이 필요하면 'Edit Requirements' 버튼을 클릭하세요</li>
                        <li>• 확인 후 'Find Candidates'를 클릭하면 매칭이 시작됩니다</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CompanyJobPreviewPage;