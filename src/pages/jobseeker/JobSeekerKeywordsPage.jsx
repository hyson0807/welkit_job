import React, { useState, useEffect } from 'react';
import { ChevronLeft, LogOut, Briefcase, MapPin, Gift } from 'lucide-react';
import {useCheckUserType} from "../auth/checkUserType.js";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../store/contexts/AuthContext.jsx";
import {supabase} from "../../services/supabase/client.js";

const JobSeekerKeywordsPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('user');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [keywords, setKeywords] = useState({
        '직무': [],
        '지역': [],
        '혜택': []
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
                '직무': data.filter(k => k.category === '직무'),
                '지역': data.filter(k => k.category === '지역'),
                '혜택': data.filter(k => k.category === '혜택')
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

            // keyword_id 배열로 변환 (이 부분이 중요!)
            const keywordIds = data.map(item => item.keyword_id);
            setSelectedKeywords(keywordIds);

            // 이 줄 제거 (중복됨)
            // setSelectedKeywords(data);
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

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthorized) {
        return null;
    }

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

    // 수정된 코드
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
                // 선택된 키워드를 올바른 형식으로 변환
                const userKeywords = selectedKeywords.map(keywordId => ({
                    user_id: user.id,
                    keyword_id: parseInt(keywordId) // 숫자로 변환
                }));

                console.log('Inserting keywords:', userKeywords); // 디버깅용

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
        alert('로그아웃되었습니다.');
    };

    // 카테고리별 선택된 키워드 수 계산
    const getSelectedCount = (category) => {
        return keywords[category].filter(k => selectedKeywords.includes(k.id)).length;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">키워드 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-900 text-white px-5 py-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">구직자 등록</h1>
                        <p className="text-sm opacity-80 mt-1">단계 2: 키워드 선택</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">로그아웃</span>
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
                            <span className="ml-2 text-sm font-medium text-gray-600">기본 정보</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
                            <div className="h-full w-2/3 bg-blue-900 rounded-full"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                2
                            </div>
                            <span className="ml-2 text-sm font-medium">키워드</span>
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

            {/* Keywords Selection */}
            <div className="max-w-4xl mx-auto px-5 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">키워드를 선택해주세요</h2>
                        <p className="text-gray-600">나의 능력과 선호도에 맞는 키워드를 선택하세요</p>
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                선택됨: <span className="font-semibold text-blue-600">{selectedKeywords.length}</span>개
                            </p>
                            {selectedKeywords.length < 3 && (
                                <p className="text-sm text-orange-500">⚠️ 더 나은 매칭을 위해 최소 3개 이상 선택하세요</p>
                            )}
                        </div>
                    </div>

                    {/* 직무 카테고리 */}
                    <div className="mb-6">
                        <div className="border rounded-lg p-4 bg-red-50">
                            <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                                <Briefcase className="w-5 h-5 mr-2" />
                                직무 (Job Type)
                                <span className="text-sm font-normal text-red-600 ml-2">
                                    ({getSelectedCount('직무')}/{keywords['직무'].length})
                                </span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {keywords['직무'].map((keyword) => (
                                    <button
                                        key={keyword.id}
                                        onClick={() => toggleKeyword(keyword.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            selectedKeywords.includes(keyword.id)
                                                ? 'bg-red-500 text-white shadow-md transform scale-105'
                                                : 'bg-white text-red-700 border border-red-300 hover:bg-red-100'
                                        }`}
                                    >
                                        {keyword.keyword}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 지역 카테고리 */}
                    <div className="mb-6">
                        <div className="border rounded-lg p-4 bg-blue-50">
                            <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                                <MapPin className="w-5 h-5 mr-2" />
                                지역 (Location)
                                <span className="text-sm font-normal text-blue-600 ml-2">
                                    ({getSelectedCount('지역')}/{keywords['지역'].length})
                                </span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {keywords['지역'].map((keyword) => (
                                    <button
                                        key={keyword.id}
                                        onClick={() => toggleKeyword(keyword.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            selectedKeywords.includes(keyword.id)
                                                ? 'bg-blue-500 text-white shadow-md transform scale-105'
                                                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                                        }`}
                                    >
                                        {keyword.keyword}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 혜택 카테고리 */}
                    <div className="mb-6">
                        <div className="border rounded-lg p-4 bg-green-50">
                            <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                                <Gift className="w-5 h-5 mr-2" />
                                혜택 (Benefits)
                                <span className="text-sm font-normal text-green-600 ml-2">
                                    ({getSelectedCount('혜택')}/{keywords['혜택'].length})
                                </span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {keywords['혜택'].map((keyword) => (
                                    <button
                                        key={keyword.id}
                                        onClick={() => toggleKeyword(keyword.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            selectedKeywords.includes(keyword.id)
                                                ? 'bg-green-500 text-white shadow-md transform scale-105'
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
                            onClick={() => alert('이전 페이지로 이동')}
                            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            뒤로
                        </button>
                        <button
                            onClick={handleSaveAndNext}
                            disabled={saving || selectedKeywords.length === 0}
                            className="flex-1 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? '저장 중...' : '다음: 매칭 결과 보기'}
                        </button>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">💡 더 나은 매칭을 위한 팁</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                        <li>• 본인의 능력과 선호도를 정확히 나타내는 키워드를 선택하세요</li>
                        <li>• 직무 키워드는 가장 중요한 매칭 기준입니다</li>
                        <li>• 더 많은 키워드 = 더 많은 매칭 기회</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerKeywordsPage;