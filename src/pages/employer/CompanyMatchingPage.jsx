import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import {useCheckUserType} from "../auth/checkUserType.js";

const CompanyMatchingPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('company');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [companyKeywords, setCompanyKeywords] = useState([]);
    const [matchedCandidates, setMatchedCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState(null);

    const fetchCompanyDataAndMatch = async () => {
        try {
            // 회사 정보 가져오기
            const { data: companyProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;
            setCompanyInfo(companyProfile);

            // 회사가 선택한 키워드 가져오기
            const { data: companyKeywordData, error: companyError } = await supabase
                .from('company_keyword')
                .select('keyword_id, priority, keyword(keyword, category)')
                .eq('company_id', user.id);

            if (companyError) throw companyError;

            const requiredKeywordIds = companyKeywordData.filter(item => item.priority === 1).map(item => item.keyword_id);
            const preferredKeywordIds = companyKeywordData.filter(item => item.priority === 2).map(item => item.keyword_id);
            const allCompanyKeywordIds = companyKeywordData.map(item => item.keyword_id);

            setCompanyKeywords(companyKeywordData);

            // 모든 구직자와 그들의 키워드 가져오기
            const { data: jobSeekers, error: jobSeekerError } = await supabase
                .from('profiles')
                .select(`
          id,
          name,
          email,
          visa,
          visa_expiry,
          created_at,
          user_keyword (
            keyword_id,
            keyword (
              id,
              keyword,
              category
            )
          )
        `)
                .eq('user_type', 'user');

            if (jobSeekerError) throw jobSeekerError;

            // 매칭률 계산
            const candidatesWithMatchRate = jobSeekers.map(candidate => {
                const candidateKeywordIds = candidate.user_keyword.map(uk => uk.keyword_id);

                // 필수 키워드 매칭 체크
                const matchedRequiredIds = requiredKeywordIds.filter(rkId =>
                    candidateKeywordIds.includes(rkId)
                );
                const hasAllRequired = matchedRequiredIds.length === requiredKeywordIds.length;

                // 우대 키워드 매칭 체크
                const matchedPreferredIds = preferredKeywordIds.filter(pkId =>
                    candidateKeywordIds.includes(pkId)
                );

                // 전체 매칭된 키워드
                const totalMatchedIds = [...new Set([...matchedRequiredIds, ...matchedPreferredIds])];

                // 매칭률 계산
                let matchRate = 0;
                if (allCompanyKeywordIds.length > 0) {
                    if (hasAllRequired) {
                        // 필수 조건을 모두 충족한 경우
                        const baseRate = 50; // 기본 50%
                        const additionalRate = preferredKeywordIds.length > 0
                            ? (matchedPreferredIds.length / preferredKeywordIds.length) * 50
                            : 50; // 우대 키워드가 없으면 50% 추가
                        matchRate = baseRate + additionalRate;
                    } else {
                        // 필수 조건을 충족하지 못한 경우
                        matchRate = requiredKeywordIds.length > 0
                            ? (matchedRequiredIds.length / requiredKeywordIds.length) * 30
                            : 0;
                    }
                }

                // 매칭된 키워드 정보 가져오기
                const matchedKeywords = candidate.user_keyword
                    .filter(uk => totalMatchedIds.includes(uk.keyword_id))
                    .map(uk => ({
                        ...uk.keyword,
                        isRequired: requiredKeywordIds.includes(uk.keyword_id)
                    }));

                // 비자 만료일 체크
                const visaExpiryDate = candidate.visa_expiry ? new Date(candidate.visa_expiry) : null;
                const isVisaValid = visaExpiryDate ? visaExpiryDate > new Date() : false;
                const daysUntilExpiry = visaExpiryDate
                    ? Math.floor((visaExpiryDate - new Date()) / (1000 * 60 * 60 * 24))
                    : null;

                return {
                    ...candidate,
                    matchRate: Math.round(matchRate),
                    hasAllRequired,
                    matchedRequiredCount: matchedRequiredIds.length,
                    totalRequiredCount: requiredKeywordIds.length,
                    matchedPreferredCount: matchedPreferredIds.length,
                    totalPreferredCount: preferredKeywordIds.length,
                    matchedKeywords,
                    isVisaValid,
                    daysUntilExpiry
                };
            });

            // 매칭률 높은 순으로 정렬 (필수 조건 충족 여부 우선)
            const sortedCandidates = candidatesWithMatchRate
                .filter(candidate => candidate.matchRate > 0)
                .sort((a, b) => {
                    // 필수 조건 모두 충족한 사람 우선
                    if (a.hasAllRequired && !b.hasAllRequired) return -1;
                    if (!a.hasAllRequired && b.hasAllRequired) return 1;
                    // 그 다음 매칭률 순
                    return b.matchRate - a.matchRate;
                });

            setMatchedCandidates(sortedCandidates);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanyDataAndMatch();
    }, [user, navigate]);

    if (isLoading) {return <div>Loading...</div>;}
    if (!isAuthorized) {return null;}


    const handleLogout = async () => {
        await signOut();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Finding matching candidates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F6F4]">
            {/* Header */}
            <div className="bg-[#1E4B7B] text-white px-5 py-4 shadow-lg">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Matching Results</h1>
                        <p className="text-sm opacity-80 mt-1">Candidates matching your requirements</p>
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

            <div className="max-w-6xl mx-auto px-5 py-8">
                {/* Company Info & Keywords */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{companyInfo?.name || 'Company Name'}</h2>
                            <p className="text-gray-600">{companyInfo?.email}</p>
                        </div>
                        <button
                            onClick={() => navigate('/employer/keywords')}
                            className="text-sm text-[#1E4B7B] hover:underline"
                        >
                            Edit Requirements
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Required Keywords */}
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">R</span>
                                Required Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {companyKeywords.filter(ck => ck.priority === 1).map(ck => (
                                    <span
                                        key={ck.keyword_id}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                                    >
                    {ck.keyword.keyword}
                  </span>
                                ))}
                            </div>
                        </div>

                        {/* Preferred Keywords */}
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">P</span>
                                Preferred Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {companyKeywords.filter(ck => ck.priority === 2).map(ck => (
                                    <span
                                        key={ck.keyword_id}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                    >
                    {ck.keyword.keyword}
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Candidates List */}
                {matchedCandidates.length > 0 ? (
                    <div className="space-y-4">
                        {matchedCandidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all ${
                                    candidate.hasAllRequired ? 'border-2 border-green-200' : ''
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-800">
                                                {candidate.name || 'Name not provided'}
                                            </h3>
                                            {candidate.hasAllRequired && (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          ✓ All Requirements Met
                        </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        ✉️ {candidate.email}
                      </span>
                                            <span className="flex items-center gap-1">
                        🎫 {candidate.visa || 'N/A'}
                      </span>
                                            <span className={`flex items-center gap-1 ${
                                                candidate.daysUntilExpiry && candidate.daysUntilExpiry < 90 ? 'text-orange-600' : ''
                                            }`}>
                        📅 Expires: {formatDate(candidate.visa_expiry)}
                                                {candidate.daysUntilExpiry && candidate.daysUntilExpiry < 90 && (
                                                    <span className="text-xs">({candidate.daysUntilExpiry} days)</span>
                                                )}
                      </span>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className={`text-3xl font-bold ${
                                            candidate.matchRate >= 80 ? 'text-green-600' :
                                                candidate.matchRate >= 50 ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                            {candidate.matchRate}%
                                        </div>
                                        <p className="text-sm text-gray-500">Match Rate</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-gray-600">
                                            Matched Keywords:
                                            <span className="font-semibold ml-1">
                        Required ({candidate.matchedRequiredCount}/{candidate.totalRequiredCount})
                      </span>
                                            <span className="mx-2">•</span>
                                            <span className="font-semibold">
                        Preferred ({candidate.matchedPreferredCount}/{candidate.totalPreferredCount})
                      </span>
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.matchedKeywords.map((keyword) => (
                                            <span
                                                key={keyword.id}
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    keyword.isRequired
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                        {keyword.keyword}
                      </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 flex gap-3">
                                    <button className="px-4 py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors text-sm font-medium">
                                        View Profile
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                                        Send Message
                                    </button>
                                    {candidate.hasAllRequired && (
                                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                            🚀 Schedule Interview
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No matching candidates found
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Try adjusting your requirements or adding more keywords
                        </p>
                        <button
                            onClick={() => navigate('/employer/keywords')}
                            className="px-6 py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors"
                        >
                            Edit Requirements
                        </button>
                    </div>
                )}

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/employer/keywords')}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Back to Requirements
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyMatchingPage;