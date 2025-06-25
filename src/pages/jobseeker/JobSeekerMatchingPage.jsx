// src/pages/jobseeker/JobSeekerMatchingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';

const JobSeekerMatchingPage = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [userKeywords, setUserKeywords] = useState([]);
    const [matchedCompanies, setMatchedCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchUserDataAndMatch();
    }, [user, navigate]);

    const fetchUserDataAndMatch = async () => {
        try {
            // 사용자 정보 가져오기
            const { data: userProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;
            setUserInfo(userProfile);

            // 유저가 선택한 키워드 가져오기
            const { data: userKeywordData, error: userError } = await supabase
                .from('user_keyword')
                .select('keyword_id, keyword(keyword, category)')
                .eq('user_id', user.id);

            if (userError) throw userError;

            const userKeywordIds = userKeywordData.map(item => item.keyword_id);
            setUserKeywords(userKeywordData);

            // 모든 회사와 그들의 키워드 가져오기
            const { data: companies, error: companyError } = await supabase
                .from('profiles')
                .select(`
          id,
          name,
          email,
          description,
          website,
          address,
          company_keyword (
            keyword_id,
            priority,
            keyword (
              id,
              keyword,
              category
            )
          )
        `)
                .eq('user_type', 'company');

            if (companyError) throw companyError;

            // 매칭률 계산
            const companiesWithMatchRate = companies.map(company => {
                const companyKeywords = company.company_keyword || [];
                const requiredKeywordIds = companyKeywords.filter(ck => ck.priority === 1).map(ck => ck.keyword_id);
                const preferredKeywordIds = companyKeywords.filter(ck => ck.priority === 2).map(ck => ck.keyword_id);
                const allCompanyKeywordIds = companyKeywords.map(ck => ck.keyword_id);

                // 매칭된 키워드 찾기
                const matchedRequiredIds = requiredKeywordIds.filter(rkId =>
                    userKeywordIds.includes(rkId)
                );
                const matchedPreferredIds = preferredKeywordIds.filter(pkId =>
                    userKeywordIds.includes(pkId)
                );
                const totalMatchedIds = [...new Set([...matchedRequiredIds, ...matchedPreferredIds])];

                // 필수 조건 충족 여부
                const hasAllRequired = requiredKeywordIds.length === 0 ||
                    matchedRequiredIds.length === requiredKeywordIds.length;

                // 매칭률 계산 (회사 기준)
                let matchRate = 0;
                if (allCompanyKeywordIds.length > 0) {
                    if (hasAllRequired) {
                        // 필수 조건을 모두 충족한 경우
                        const baseRate = 50;
                        const additionalRate = preferredKeywordIds.length > 0
                            ? (matchedPreferredIds.length / preferredKeywordIds.length) * 50
                            : 50;
                        matchRate = baseRate + additionalRate;
                    } else {
                        // 필수 조건을 충족하지 못한 경우
                        matchRate = requiredKeywordIds.length > 0
                            ? (matchedRequiredIds.length / requiredKeywordIds.length) * 30
                            : 0;
                    }
                }

                // 매칭된 키워드 정보
                const matchedKeywords = companyKeywords
                    .filter(ck => totalMatchedIds.includes(ck.keyword_id))
                    .map(ck => ({
                        ...ck.keyword,
                        priority: ck.priority
                    }));

                // 로켓 면접 가능 여부 (필수 조건 모두 충족 + 매칭률 80% 이상)
                const isRocketInterviewAvailable = hasAllRequired && matchRate >= 80;

                return {
                    ...company,
                    matchRate: Math.round(matchRate),
                    hasAllRequired,
                    matchedRequiredCount: matchedRequiredIds.length,
                    totalRequiredCount: requiredKeywordIds.length,
                    matchedPreferredCount: matchedPreferredIds.length,
                    totalPreferredCount: preferredKeywordIds.length,
                    matchedKeywords,
                    totalMatchedCount: totalMatchedIds.length,
                    isRocketInterviewAvailable
                };
            });

            // 매칭률 높은 순으로 정렬
            const sortedCompanies = companiesWithMatchRate
                .filter(company => company.matchRate > 0)
                .sort((a, b) => {
                    // 로켓 면접 가능한 회사 우선
                    if (a.isRocketInterviewAvailable && !b.isRocketInterviewAvailable) return -1;
                    if (!a.isRocketInterviewAvailable && b.isRocketInterviewAvailable) return 1;
                    // 매칭률 순
                    return b.matchRate - a.matchRate;
                });

            setMatchedCompanies(sortedCompanies);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    const formatWebsite = (url) => {
        if (!url) return null;
        return url.replace(/^https?:\/\//i, '');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Finding matching companies...</p>
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
                        <p className="text-sm opacity-80 mt-1">Companies matching your profile</p>
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
                {/* User Info & Keywords */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{userInfo?.name || 'Your Profile'}</h2>
                            <p className="text-gray-600">{userInfo?.email}</p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                <span>🎫 {userInfo?.visa || 'N/A'}</span>
                                <span>📅 Valid until: {userInfo?.visa_expiry ? new Date(userInfo.visa_expiry).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/jobseeker/keywords')}
                            className="text-sm text-[#1E4B7B] hover:underline"
                        >
                            Edit Keywords
                        </button>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">My Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                            {userKeywords.map(uk => (
                                <span
                                    key={uk.keyword_id}
                                    className="px-3 py-1 bg-[#1E4B7B] text-white rounded-full text-sm"
                                >
                  {uk.keyword.keyword}
                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Companies List */}
                {matchedCompanies.length > 0 ? (
                    <div className="space-y-4">
                        {matchedCompanies.map((company) => (
                            <div
                                key={company.id}
                                className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all ${
                                    company.isRocketInterviewAvailable ? 'border-2 border-[#1E4B7B]' : ''
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-800">
                                                {company.name || 'Company Name Not Provided'}
                                            </h3>
                                            {company.isRocketInterviewAvailable && (
                                                <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-semibold flex items-center gap-1">
                          🚀 Rocket Interview
                        </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                            {company.description || 'No description available'}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        📍 {company.address || 'Location not specified'}
                      </span>
                                            {company.website && (
                                                <span className="flex items-center gap-1">
                          🌐 {formatWebsite(company.website)}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className={`text-3xl font-bold ${
                                            company.matchRate >= 80 ? 'text-green-600' :
                                                company.matchRate >= 50 ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                            {company.matchRate}%
                                        </div>
                                        <p className="text-sm text-gray-500">Match Rate</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-3">
                                        Matched Keywords ({company.totalMatchedCount}/{userKeywords.length})
                                        {company.hasAllRequired ? (
                                            <span className="ml-2 text-green-600 font-semibold">✓ All requirements met</span>
                                        ) : (
                                            <span className="ml-2 text-orange-600">
                        Missing {company.totalRequiredCount - company.matchedRequiredCount} required keyword(s)
                      </span>
                                        )}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {company.matchedKeywords.map((keyword) => (
                                            <span
                                                key={keyword.id}
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    keyword.priority === 1
                                                        ? 'bg-red-100 text-red-700 border border-red-300'
                                                        : 'bg-blue-100 text-blue-700 border border-blue-300'
                                                }`}
                                            >
                        {keyword.priority === 1 && <span className="font-bold">R </span>}
                                                {keyword.keyword}
                      </span>
                                        ))}
                                    </div>

                                    {/* Missing Required Keywords */}
                                    {!company.hasAllRequired && company.company_keyword && (
                                        <div className="bg-red-50 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-red-700 font-semibold mb-2">Missing Required Keywords:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {company.company_keyword
                                                    .filter(ck => ck.priority === 1 && !userKeywords.some(uk => uk.keyword_id === ck.keyword_id))
                                                    .map(ck => (
                                                        <span key={ck.keyword_id} className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs">
                              {ck.keyword.keyword}
                            </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 flex gap-3">
                                    <button className="px-4 py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors text-sm font-medium">
                                        View Details
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                                        Save
                                    </button>
                                    {company.isRocketInterviewAvailable && (
                                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-1">
                                            🚀 Apply for Rocket Interview
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No matching companies found
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Try adding more keywords or adjusting your profile
                        </p>
                        <button
                            onClick={() => navigate('/jobseeker/keywords')}
                            className="px-6 py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors"
                        >
                            Edit Keywords
                        </button>
                    </div>
                )}

                {/* Stats Summary */}
                {matchedCompanies.length > 0 && (
                    <div className="mt-8 bg-gray-100 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-700">{matchedCompanies.length}</div>
                                <div className="text-sm text-gray-600">Total Matches</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#1E4B7B]">
                                    {matchedCompanies.filter(c => c.isRocketInterviewAvailable).length}
                                </div>
                                <div className="text-sm text-gray-600">Rocket Interviews</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {matchedCompanies.filter(c => c.matchRate >= 80).length}
                                </div>
                                <div className="text-sm text-gray-600">High Matches (80%+)</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {Math.round(matchedCompanies.reduce((sum, c) => sum + c.matchRate, 0) / matchedCompanies.length)}%
                                </div>
                                <div className="text-sm text-gray-600">Average Match</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/jobseeker/keywords')}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Back to Keywords
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerMatchingPage;