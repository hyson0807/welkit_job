import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import { useCheckUserType } from "../auth/checkUserType.js";
import axios from 'axios';

const CompanyKeywordsPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('company');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [jobDescription, setJobDescription] = useState('');
    const [extractedKeywords, setExtractedKeywords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [showManualSelection, setShowManualSelection] = useState(false);
    const [allKeywords, setAllKeywords] = useState({});
    const [selectedKeywords, setSelectedKeywords] = useState([]);

    const getSelectedKeywordObjects = () => {
        const allKeywordsList = Object.values(allKeywords).flat();
        return allKeywordsList.filter(keyword => selectedKeywords.includes(keyword.id));
    };

    // 모든 키워드 가져오기 (수동 선택용)
    const fetchAllKeywords = async () => {
        try {
            const { data, error } = await supabase
                .from('keyword')
                .select('*')
                .order('category', { ascending: true })
                .order('keyword', { ascending: true });

            if (error) throw error;

            const groupedKeywords = data.reduce((acc, keyword) => {
                if (!acc[keyword.category]) {
                    acc[keyword.category] = [];
                }
                acc[keyword.category].push(keyword);
                return acc;
            }, {});

            setAllKeywords(groupedKeywords);
        } catch (error) {
            console.error('Error fetching keywords:', error);
        }
    };

    // 기존 회사 키워드 가져오기
    const fetchCompanyKeywords = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('company_keyword')
                .select('keyword_id')
                .eq('company_id', user.id);

            if (error) throw error;

            const keywordIds = data.map(item => item.keyword_id);
            setSelectedKeywords(keywordIds);
        } catch (error) {
            console.error('Error fetching company keywords:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllKeywords();
        fetchCompanyKeywords();
    }, [user]);

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthorized) return null;

    // AI 키워드 추출
    const handleExtractKeywords = async () => {
        if (!jobDescription.trim()) {
            alert('원하는 인재상을 입력해주세요.');
            return;
        }

        setExtracting(true);
        try {
            const response = await axios.post('https://1232-production.up.railway.app/extract-keywords', {
                company_id: user.id,
                job_description: jobDescription
            });

            if (response.data.success) {
                setExtractedKeywords(response.data.keywords);
                setSelectedKeywords(response.data.keywordIds);
                alert('키워드가 성공적으로 추출되었습니다!');
            }
        } catch (error) {
            console.error('Error extracting keywords:', error);
            alert('키워드 추출에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setExtracting(false);
        }
    };

    // 다음 단계로 이동
    const handleNext = async () => {
        if (selectedKeywords.length === 0) {
            alert('최소 1개 이상의 키워드를 선택해주세요.');
            return;
        }
        navigate('/employer/matching');
    };

    // 수동 키워드 선택/해제
    const toggleKeyword = (keywordId) => {
        if (selectedKeywords.includes(keywordId)) {
            setSelectedKeywords(prev => prev.filter(id => id !== keywordId));
        } else {
            setSelectedKeywords(prev => [...prev, keywordId]);
        }
    };

    // 수동으로 키워드 저장
    const handleManualSave = async () => {
        try {
            setSaving(true);

            // 기존 키워드 삭제
            const { error: deleteError } = await supabase
                .from('company_keyword')
                .delete()
                .eq('company_id', user.id);

            if (deleteError) throw deleteError;

            // 새로운 키워드 삽입
            if (selectedKeywords.length > 0) {
                const companyKeywords = selectedKeywords.map(keywordId => ({
                    company_id: user.id,
                    keyword_id: keywordId,
                    priority: 2
                }));

                const { error: insertError } = await supabase
                    .from('company_keyword')
                    .insert(companyKeywords);

                if (insertError) throw insertError;
            }

            alert('키워드가 저장되었습니다!');
            setShowManualSelection(false);
        } catch (error) {
            console.error('Error saving keywords:', error);
            alert('키워드 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    // 카테고리별 아이콘
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

    const currentSelectedKeywords = getSelectedKeywordObjects();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading requirements...</p>
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
                        <h1 className="text-2xl font-semibold">Employer Registration</h1>
                        <p className="text-sm opacity-80 mt-1">Step 2: Set Requirements</p>
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
                <div className="max-w-4xl mx-auto px-5 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                ✓
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">Company Info</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
                            <div className="h-full w-2/3 bg-[#1E4B7B] rounded-full"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#1E4B7B] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                2
                            </div>
                            <span className="ml-2 text-sm font-medium">Requirements</span>
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

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-5 py-8">
                {/* AI Input Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">🤖</span>
                        <h2 className="text-2xl font-bold text-gray-800">AI로 인재 요구사항 설정하기</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                원하는 인재상을 자유롭게 설명해주세요
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="예시: 베트남어와 한국어가 가능하고, 서울 지역에서 주방 보조 업무를 할 수 있는 성실한 인재를 찾고 있습니다. 주 5일 근무가 가능하고 기숙사 제공이 가능한 분이면 좋겠습니다."
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent resize-none"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                구체적으로 작성할수록 더 정확한 매칭이 가능합니다.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleExtractKeywords}
                                disabled={extracting || !jobDescription.trim()}
                                className="flex-1 py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {extracting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        키워드 추출 중...
                                    </>
                                ) : (
                                    <>
                                        <span>🔍</span>
                                        AI로 키워드 추출하기
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setShowManualSelection(!showManualSelection)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {showManualSelection ? '숨기기' : '수동 선택'}
                            </button>
                        </div>
                    </div>
                </div>

                {currentSelectedKeywords.length > 0 && (
                    <div className="bg-green-50 rounded-2xl shadow-lg p-6 mb-6 border border-green-200">
                        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                            <span>✅</span>
                            선택된 키워드 ({currentSelectedKeywords.length}개)
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {currentSelectedKeywords.map((keyword) => (
                                <span
                                    key={keyword.id}
                                    className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium cursor-pointer hover:bg-green-700 transition-colors"
                                    onClick={() => toggleKeyword(keyword.id)}
                                    title="클릭하여 제거"
                                >
                                    {keyword.keyword} ({keyword.category}) ✕
                                </span>
                            ))}
                        </div>
                        <p className="text-sm text-green-700">
                            💡 키워드를 클릭하면 제거할 수 있습니다. 아래에서 더 추가할 수도 있습니다.
                        </p>
                    </div>
                )}

                {/* Manual Selection */}
                {showManualSelection && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">수동으로 키워드 선택</h3>
                        <div className="space-y-6">
                            {Object.entries(allKeywords).map(([category, categoryKeywords]) => (
                                <div key={category} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <span className="text-2xl">{getCategoryIcon(category)}</span>
                                        {category}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {categoryKeywords.map((keyword) => (
                                            <button
                                                key={keyword.id}
                                                onClick={() => toggleKeyword(keyword.id)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                    selectedKeywords.includes(keyword.id)
                                                        ? 'bg-[#1E4B7B] text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {keyword.keyword}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={handleManualSave}
                                disabled={saving || selectedKeywords.length === 0}
                                className="flex-1 py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? '저장 중...' : '선택한 키워드 저장'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex gap-4">
                    <button
                        onClick={() => navigate('/employer/info')}
                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={selectedKeywords.length === 0}
                        className="flex-1 py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next: Find Candidates
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyKeywordsPage;