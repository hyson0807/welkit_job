// src/pages/employer/CompanyKeywordsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import {useCheckUserType} from "../auth/checkUserType.js";

const CompanyKeywordsPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('company');

    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [keywords, setKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [existingKeywords, setExistingKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [requiredKeywords, setRequiredKeywords] = useState([]); // 필수 키워드
    const [preferredKeywords, setPreferredKeywords] = useState([]); // 우대 키워드


    const fetchKeywords = async () => {
        try {
            const { data, error } = await supabase
                .from('keyword')
                .select('*')
                .order('category', { ascending: true })
                .order('keyword', { ascending: true });

            if (error) throw error;

            // 카테고리별로 그룹핑
            const groupedKeywords = data.reduce((acc, keyword) => {
                if (!acc[keyword.category]) {
                    acc[keyword.category] = [];
                }
                acc[keyword.category].push(keyword);
                return acc;
            }, {});

            setKeywords(groupedKeywords);
        } catch (error) {
            console.error('Error fetching keywords:', error);
        }
    };
    const fetchCompanyKeywords = async () => {
        try {
            const { data, error } = await supabase
                .from('company_keyword')
                .select('keyword_id, priority')
                .eq('company_id', user.id);

            if (error) throw error;

            const allKeywordIds = data.map(item => item.keyword_id);
            const required = data.filter(item => item.priority === 1).map(item => item.keyword_id);
            const preferred = data.filter(item => item.priority === 2).map(item => item.keyword_id);

            setExistingKeywords(allKeywordIds);
            setSelectedKeywords(allKeywordIds);
            setRequiredKeywords(required);
            setPreferredKeywords(preferred);
        } catch (error) {
            console.error('Error fetching company keywords:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeywords();
        fetchCompanyKeywords();
    }, [user, navigate]);

    if (isLoading) {return <div>Loading...</div>;}
    if (!isAuthorized) {return null;}



    // 키워드 선택/해제
    const toggleKeyword = (keywordId, type = 'normal') => {
        if (type === 'required') {
            // 필수 키워드 토글
            if (requiredKeywords.includes(keywordId)) {
                setRequiredKeywords(prev => prev.filter(id => id !== keywordId));
                setSelectedKeywords(prev => prev.filter(id => id !== keywordId));
            } else {
                setRequiredKeywords(prev => [...prev, keywordId]);
                setPreferredKeywords(prev => prev.filter(id => id !== keywordId)); // 우대에서 제거
                if (!selectedKeywords.includes(keywordId)) {
                    setSelectedKeywords(prev => [...prev, keywordId]);
                }
            }
        } else if (type === 'preferred') {
            // 우대 키워드 토글
            if (preferredKeywords.includes(keywordId)) {
                setPreferredKeywords(prev => prev.filter(id => id !== keywordId));
                setSelectedKeywords(prev => prev.filter(id => id !== keywordId));
            } else {
                setPreferredKeywords(prev => [...prev, keywordId]);
                setRequiredKeywords(prev => prev.filter(id => id !== keywordId)); // 필수에서 제거
                if (!selectedKeywords.includes(keywordId)) {
                    setSelectedKeywords(prev => [...prev, keywordId]);
                }
            }
        } else {
            // 일반 토글 (선택/해제)
            if (selectedKeywords.includes(keywordId)) {
                setSelectedKeywords(prev => prev.filter(id => id !== keywordId));
                setRequiredKeywords(prev => prev.filter(id => id !== keywordId));
                setPreferredKeywords(prev => prev.filter(id => id !== keywordId));
            } else {
                setSelectedKeywords(prev => [...prev, keywordId]);
                setPreferredKeywords(prev => [...prev, keywordId]); // 기본적으로 우대로 추가
            }
        }
    };

    // 키워드 저장
    const handleSaveAndNext = async () => {
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
                    priority: requiredKeywords.includes(keywordId) ? 1 : 2 // 1: 필수, 2: 우대
                }));

                const { error: insertError } = await supabase
                    .from('company_keyword')
                    .insert(companyKeywords);

                if (insertError) throw insertError;
            }

            // 매칭 페이지로 이동
            navigate('/employer/matching');
        } catch (error) {
            console.error('Error saving keywords:', error);
            alert('Failed to save requirements. Please try again.');
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

    // 카테고리 이름
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

    // 키워드 타입 가져오기
    const getKeywordType = (keywordId) => {
        if (requiredKeywords.includes(keywordId)) return 'required';
        if (preferredKeywords.includes(keywordId)) return 'preferred';
        return null;
    };

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

            {/* Keywords Selection */}
            <div className="max-w-4xl mx-auto px-5 py-8">
                {/* Instructions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Set Your Requirements</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                R
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700">Required Keywords</h3>
                                <p className="text-sm text-gray-600">Must-have skills and conditions. Candidates must match ALL of these.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                P
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700">Preferred Keywords</h3>
                                <p className="text-sm text-gray-600">Nice-to-have qualifications. Higher match rate if candidates have these.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="text-sm">
                            <span className="text-gray-600">Required: </span>
                            <span className="font-semibold text-red-600">{requiredKeywords.length}</span>
                            <span className="text-gray-400 mx-2">|</span>
                            <span className="text-gray-600">Preferred: </span>
                            <span className="font-semibold text-blue-600">{preferredKeywords.length}</span>
                            <span className="text-gray-400 mx-2">|</span>
                            <span className="text-gray-600">Total: </span>
                            <span className="font-semibold text-gray-700">{selectedKeywords.length}</span>
                        </div>
                        {requiredKeywords.length === 0 && (
                            <p className="text-sm text-orange-500">⚠️ Select at least 1 required keyword</p>
                        )}
                    </div>
                </div>

                {/* Keywords by Category */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="space-y-6">
                        {Object.entries(keywords).map(([category, categoryKeywords]) => (
                            <div key={category} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                                    {getCategoryName(category)}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {categoryKeywords.map((keyword) => {
                                        const keywordType = getKeywordType(keyword.id);
                                        return (
                                            <div key={keyword.id} className="relative">
                                                <button
                                                    onClick={() => toggleKeyword(keyword.id)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                        keywordType === 'required'
                                                            ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                                            : keywordType === 'preferred'
                                                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {keyword.keyword}
                                                </button>
                                                {keywordType && (
                                                    <div className="absolute -top-2 -right-2 flex gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleKeyword(keyword.id, 'required');
                                                            }}
                                                            className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                                                                keywordType === 'required'
                                                                    ? 'bg-red-500 text-white'
                                                                    : 'bg-gray-300 text-gray-600 hover:bg-red-200'
                                                            }`}
                                                        >
                                                            R
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleKeyword(keyword.id, 'preferred');
                                                            }}
                                                            className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                                                                keywordType === 'preferred'
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-gray-300 text-gray-600 hover:bg-blue-200'
                                                            }`}
                                                        >
                                                            P
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Selected Keywords Summary */}
                    {selectedKeywords.length > 0 && (
                        <div className="mt-8 grid md:grid-cols-2 gap-4">
                            {/* Required Keywords */}
                            <div className="p-4 bg-red-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-red-900 mb-2">Required Keywords ({requiredKeywords.length}):</h4>
                                <div className="flex flex-wrap gap-2">
                                    {requiredKeywords.length > 0 ? (
                                        requiredKeywords.map(keywordId => {
                                            const keyword = Object.values(keywords).flat().find(k => k.id === keywordId);
                                            return keyword ? (
                                                <span
                                                    key={keywordId}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                                                >
                          {keyword.keyword}
                        </span>
                                            ) : null;
                                        })
                                    ) : (
                                        <span className="text-xs text-red-600">No required keywords selected</span>
                                    )}
                                </div>
                            </div>

                            {/* Preferred Keywords */}
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">Preferred Keywords ({preferredKeywords.length}):</h4>
                                <div className="flex flex-wrap gap-2">
                                    {preferredKeywords.length > 0 ? (
                                        preferredKeywords.map(keywordId => {
                                            const keyword = Object.values(keywords).flat().find(k => k.id === keywordId);
                                            return keyword ? (
                                                <span
                                                    key={keywordId}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                                >
                          {keyword.keyword}
                        </span>
                                            ) : null;
                                        })
                                    ) : (
                                        <span className="text-xs text-blue-600">No preferred keywords selected</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => navigate('/employer/info')}
                            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSaveAndNext}
                            disabled={saving || requiredKeywords.length === 0}
                            className="flex-1 py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Next: Find Candidates'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyKeywordsPage;