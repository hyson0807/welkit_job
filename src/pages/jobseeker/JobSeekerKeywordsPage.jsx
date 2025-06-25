// src/pages/jobseeker/JobSeekerKeywordsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';

const JobSeekerKeywordsPage = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [keywords, setKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [existingKeywords, setExistingKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchKeywords();
        fetchUserKeywords();
    }, [user, navigate]);

    // 모든 키워드 가져오기
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

    // 기존에 선택한 키워드 가져오기
    const fetchUserKeywords = async () => {
        try {
            const { data, error } = await supabase
                .from('user_keyword')
                .select('keyword_id')
                .eq('user_id', user.id);

            if (error) throw error;

            const keywordIds = data.map(item => item.keyword_id);
            setExistingKeywords(keywordIds);
            setSelectedKeywords(keywordIds);
        } catch (error) {
            console.error('Error fetching user keywords:', error);
        } finally {
            setLoading(false);
        }
    };

    // 키워드 선택/해제
    const toggleKeyword = (keywordId) => {
        setSelectedKeywords(prev => {
            if (prev.includes(keywordId)) {
                return prev.filter(id => id !== keywordId);
            } else {
                return [...prev, keywordId];
            }
        });
    };

    // 키워드 저장
    const handleSaveAndNext = async () => {
        try {
            setSaving(true);

            // 기존 키워드 삭제
            const { error: deleteError } = await supabase
                .from('user_keyword')
                .delete()
                .eq('user_id', user.id);

            if (deleteError) throw deleteError;

            // 새로운 키워드 삽입
            if (selectedKeywords.length > 0) {
                const userKeywords = selectedKeywords.map((keywordId, index) => ({
                    user_id: user.id,
                    keyword_id: keywordId,
                    priority: index + 1  // priority는 선택 순서로 설정 (나중에 활용 가능)
                }));

                const { error: insertError } = await supabase
                    .from('user_keyword')
                    .insert(userKeywords);

                if (insertError) throw insertError;
            }

            // 매칭 페이지로 이동
            navigate('/jobseeker/matching');
        } catch (error) {
            console.error('Error saving keywords:', error);
            alert('Failed to save keywords. Please try again.');
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

    // 카테고리 이름 한글화 (필요시 사용)
    const getCategoryName = (category) => {
        const names = {
            'Skills': 'Skills & Strengths',
            'Experience': 'Work Experience',
            'Conditions': 'Working Conditions',
            'Benefits': 'Benefits & Welfare',
            'Location': 'Location',
            'Schedule': 'Work Schedule'
        };
        return names[category] || category;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading keywords...</p>
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
                        <h1 className="text-2xl font-semibold">Job Seeker Registration</h1>
                        <p className="text-sm opacity-80 mt-1">Step 2: Select Keywords</p>
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
                            <span className="ml-2 text-sm font-medium text-gray-600">Basic Info</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
                            <div className="h-full w-2/3 bg-[#1E4B7B] rounded-full"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#1E4B7B] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                2
                            </div>
                            <span className="ml-2 text-sm font-medium">Keywords</span>
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
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Your Keywords</h2>
                        <p className="text-gray-600">Choose keywords that match your skills and preferences</p>
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Selected: <span className="font-semibold text-[#1E4B7B]">{selectedKeywords.length}</span> keywords
                            </p>
                            {selectedKeywords.length < 3 && (
                                <p className="text-sm text-orange-500">⚠️ Select at least 3 keywords for better matching</p>
                            )}
                        </div>
                    </div>

                    {/* Keywords by Category */}
                    <div className="space-y-6">
                        {Object.entries(keywords).map(([category, categoryKeywords]) => (
                            <div key={category} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                                    {getCategoryName(category)}
                                    <span className="text-sm font-normal text-gray-500">
                    ({categoryKeywords.filter(k => selectedKeywords.includes(k.id)).length}/{categoryKeywords.length})
                  </span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {categoryKeywords.map((keyword) => (
                                        <button
                                            key={keyword.id}
                                            onClick={() => toggleKeyword(keyword.id)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                selectedKeywords.includes(keyword.id)
                                                    ? 'bg-[#1E4B7B] text-white shadow-md transform scale-105'
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

                    {/* Selected Keywords Summary */}
                    {selectedKeywords.length > 0 && (
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Your Selected Keywords:</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedKeywords.map(keywordId => {
                                    const keyword = Object.values(keywords).flat().find(k => k.id === keywordId);
                                    return keyword ? (
                                        <span
                                            key={keywordId}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                        >
                      {keyword.keyword}
                    </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => navigate('/jobseeker/info')}
                            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSaveAndNext}
                            disabled={saving || selectedKeywords.length === 0}
                            className="flex-1 py-3 bg-[#1E4B7B] text-white font-semibold rounded-lg hover:bg-[#164066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Next: View Matches'}
                        </button>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">💡 Tips for Better Matching</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Select keywords that truly represent your skills and preferences</li>
                        <li>• More keywords = more matching opportunities</li>
                        <li>• Be honest about your capabilities for better job matches</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerKeywordsPage;