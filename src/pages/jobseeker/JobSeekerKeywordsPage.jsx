// src/pages/jobseeker/JobSeekerKeywordsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import {useCheckUserType} from "../auth/checkUserType.js";

const JobSeekerKeywordsPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('user');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [keywords, setKeywords] = useState({
        '필수': [],
        '우대': [],
        '희망조건': []
    });
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 모든 키워드 가져오기
    const fetchKeywords = async () => {
        try {
            const { data, error } = await supabase
                .from('keyword')
                .select('*')
                .order('keyword', { ascending: true });

            if (error) throw error;

            // category별로 그룹핑
            const groupedKeywords = {
                '필수': data.filter(k => k.category === '필수'),
                '우대': data.filter(k => k.category === '우대'),
                '희망조건': data.filter(k => k.category === '희망조건')
            };

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
            setSelectedKeywords(keywordIds);
        } catch (error) {
            console.error('Error fetching user keywords:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchKeywords();
            fetchUserKeywords();
        }
    }, [user]);

    if (isLoading) {return <div>Loading...</div>;}
    if (!isAuthorized) {return null;}

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

    // priority 값 결정
    const getPriority = (category) => {
        switch(category) {
            case '필수': return 0;
            case '우대': return 1;
            case '희망조건': return 3;
            default: return 1;
        }
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
                // 선택된 키워드의 정보를 가져와서 priority 설정
                const allKeywords = Object.values(keywords).flat();
                const userKeywords = selectedKeywords.map(keywordId => {
                    const keyword = allKeywords.find(k => k.id === keywordId);
                    return {
                        user_id: user.id,
                        keyword_id: keywordId,
                        priority: getPriority(keyword?.category)
                    };
                });

                const { error: insertError } = await supabase
                    .from('user_keyword')
                    .insert(userKeywords);

                if (insertError) throw insertError;
            }

            // 매칭 페이지로 이동
            navigate('/jobseeker/additional');
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

    // 카테고리별 선택된 키워드 수 계산
    const getSelectedCount = (category) => {
        return keywords[category].filter(k => selectedKeywords.includes(k.id)).length;
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

                    {/* 필수 Keywords */}
                    <div className="mb-6">
                        <div className="border rounded-lg p-4 bg-red-50">
                            <h3 className="text-lg font-semibold text-red-700 mb-3">
                                필수 (Required)
                                <span className="text-sm font-normal text-red-600 ml-2">
                                    ({getSelectedCount('필수')}/{keywords['필수'].length})
                                </span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {keywords['필수'].map((keyword) => (
                                    <button
                                        key={keyword.id}
                                        onClick={() => toggleKeyword(keyword.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            selectedKeywords.includes(keyword.id)
                                                ? 'bg-red-500 text-white shadow-md'
                                                : 'bg-white text-red-700 border border-red-300 hover:bg-red-100'
                                        }`}
                                    >
                                        {keyword.keyword}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 우대 Keywords */}
                    <div className="mb-6">
                        <div className="border rounded-lg p-4 bg-blue-50">
                            <h3 className="text-lg font-semibold text-blue-700 mb-3">
                                우대 (Preferred)
                                <span className="text-sm font-normal text-blue-600 ml-2">
                                    ({getSelectedCount('우대')}/{keywords['우대'].length})
                                </span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {keywords['우대'].map((keyword) => (
                                    <button
                                        key={keyword.id}
                                        onClick={() => toggleKeyword(keyword.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            selectedKeywords.includes(keyword.id)
                                                ? 'bg-blue-500 text-white shadow-md'
                                                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                                        }`}
                                    >
                                        {keyword.keyword}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 희망조건 Keywords */}
                    <div className="mb-6">
                        <div className="border rounded-lg p-4 bg-green-50">
                            <h3 className="text-lg font-semibold text-green-700 mb-3">
                                희망조건 (Desired)
                                <span className="text-sm font-normal text-green-600 ml-2">
                                    ({getSelectedCount('희망조건')}/{keywords['희망조건'].length})
                                </span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {keywords['희망조건'].map((keyword) => (
                                    <button
                                        key={keyword.id}
                                        onClick={() => toggleKeyword(keyword.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            selectedKeywords.includes(keyword.id)
                                                ? 'bg-green-500 text-white shadow-md'
                                                : 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
                                        }`}
                                    >
                                        {keyword.keyword}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

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
                        <li>• Required keywords show your essential skills</li>
                        <li>• More keywords = more matching opportunities</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerKeywordsPage;