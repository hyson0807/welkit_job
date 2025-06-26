// src/pages/jobseeker/JobSeekerMatchingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import {useCheckUserType} from "../auth/checkUserType.js";

const JobSeekerMatchingPage = () => {
    const { isAuthorized, isLoading } = useCheckUserType('user');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [userKeywords, setUserKeywords] = useState([]);
    const [matchedCompanies, setMatchedCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUserDataAndMatch = async () => {
        try {
            // 유저가 선택한 키워드 가져오기
            const { data: userKeywordData, error: userError } = await supabase
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

            if (userError) {
                console.error('Error fetching user keywords:', userError);
                throw userError;
            }

            console.log('User keywords:', userKeywordData);
            const userKeywordIds = userKeywordData?.map(item => item.keyword_id) || [];
            setUserKeywords(userKeywordData || []);

            // 모든 회사 가져오기
            const { data: allCompanies, error: companiesError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_type', 'company');

            if (companiesError) {
                console.error('Error fetching companies:', companiesError);
                throw companiesError;
            }

            console.log('All companies:', allCompanies);

            // 각 회사의 키워드 가져오기
            const companiesWithKeywords = [];

            for (const company of allCompanies) {
                const { data: companyKeywordData, error: keywordError } = await supabase
                    .from('company_keyword')
                    .select(`
                        keyword_id,
                        keyword:keyword_id (
                            id,
                            keyword,
                            category
                        )
                    `)
                    .eq('company_id', company.id);

                if (keywordError) {
                    console.error(`Error fetching keywords for company ${company.id}:`, keywordError);
                    companiesWithKeywords.push({
                        ...company,
                        company_keyword: []
                    });
                } else {
                    companiesWithKeywords.push({
                        ...company,
                        company_keyword: companyKeywordData || []
                    });
                }
            }

            console.log('Companies with keywords:', companiesWithKeywords);

            // 매칭률 계산
            const companiesWithMatchRate = companiesWithKeywords.map(company => {
                const companyKeywordIds = company.company_keyword?.map(ck => ck.keyword_id) || [];

                // 매칭된 키워드 찾기
                const matchedKeywordIds = companyKeywordIds.filter(ckId =>
                    userKeywordIds.includes(ckId)
                );

                // 매칭률 계산 (단순화)
                const matchRate = companyKeywordIds.length > 0
                    ? Math.round((matchedKeywordIds.length / companyKeywordIds.length) * 100)
                    : 0;

                // 매칭된 키워드 정보
                const matchedKeywords = company.company_keyword
                    ?.filter(ck => matchedKeywordIds.includes(ck.keyword_id))
                    ?.map(ck => ck.keyword) || [];

                return {
                    ...company,
                    matchRate,
                    matchedKeywords,
                    totalMatchedCount: matchedKeywordIds.length,
                    totalCompanyKeywords: companyKeywordIds.length
                };
            });

            // 매칭률 높은 순으로 정렬 (0%도 포함)
            const sortedCompanies = companiesWithMatchRate
                .sort((a, b) => b.matchRate - a.matchRate);

            console.log('Final sorted companies:', sortedCompanies);
            console.log('Companies with matches:', sortedCompanies.filter(c => c.matchRate > 0).length);

            setMatchedCompanies(sortedCompanies);

        } catch (error) {
            console.error('Error in fetchUserDataAndMatch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchUserDataAndMatch();
    }, [user, navigate]);

    if (isLoading) {return <div>Loading...</div>;}
    if (!isAuthorized) {return null;}

    const handleLogout = async () => {
        await signOut();
    };

    const handleSendMessage = (companyId) => {
        // 메시지 보내기 기능 구현
        console.log('Send message to company:', companyId);
        // navigate(`/jobseeker/message/${companyId}`);
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
                {/* User Keywords Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Your Selected Keywords</h2>
                            <p className="text-gray-600 text-sm mt-1">Companies are matched based on these keywords</p>
                        </div>
                        <button
                            onClick={() => navigate('/jobseeker/keywords')}
                            className="text-sm text-[#1E4B7B] hover:underline"
                        >
                            Edit Keywords
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {userKeywords.length > 0 ? (
                            userKeywords.map(uk => (
                                <span
                                    key={uk.keyword_id}
                                    className="px-3 py-1 bg-[#1E4B7B] text-white rounded-full text-sm font-medium"
                                >
                                    {uk.keyword?.keyword || 'Unknown'}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500">No keywords selected</span>
                        )}
                    </div>
                </div>

                {/* Companies List */}
                {matchedCompanies.length > 0 ? (
                    <div className="space-y-4">
                        {matchedCompanies.map((company) => (
                            <div
                                key={company.id}
                                className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all ${
                                    company.matchRate > 0 ? 'border-l-4 border-l-blue-500' : 'opacity-75'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {company.name || 'Company Name Not Provided'}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                            {company.description || 'No description available'}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                📍 {company.address || 'Location not specified'}
                                            </span>
                                            {company.website && (
                                                <span className="flex items-center gap-1">
                                                    🌐 {company.website}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className={`text-3xl font-bold ${
                                            company.matchRate >= 80 ? 'text-green-600' :
                                                company.matchRate >= 50 ? 'text-blue-600' :
                                                    company.matchRate > 0 ? 'text-gray-600' : 'text-gray-400'
                                        }`}>
                                            {company.matchRate}%
                                        </div>
                                        <p className="text-sm text-gray-500">Match Rate</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-3">
                                        {company.matchRate > 0 ? (
                                            <>Matched Keywords ({company.totalMatchedCount}/{company.totalCompanyKeywords})</>
                                        ) : (
                                            'No matching keywords'
                                        )}
                                    </p>

                                    {company.matchRate > 0 && company.matchedKeywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {company.matchedKeywords.map((keyword, index) => (
                                                <span
                                                    key={keyword?.id || index}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                                >
                                                    {keyword?.keyword || 'Unknown'}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleSendMessage(company.id)}
                                        className="px-6 py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors text-sm font-medium"
                                    >
                                        지원 메시지 보내기
                                    </button>
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
                            No companies found
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {userKeywords.length === 0
                                ? 'Please add keywords first'
                                : 'No companies registered yet'
                            }
                        </p>
                        <button
                            onClick={() => navigate('/jobseeker/keywords')}
                            className="px-6 py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors"
                        >
                            {userKeywords.length === 0 ? 'Add Keywords' : 'Back to Keywords'}
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
                                <div className="text-sm text-gray-600">Total Companies</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {matchedCompanies.filter(c => c.matchRate >= 80).length}
                                </div>
                                <div className="text-sm text-gray-600">High Matches (80%+)</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {matchedCompanies.filter(c => c.matchRate >= 50).length}
                                </div>
                                <div className="text-sm text-gray-600">Good Matches (50%+)</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {matchedCompanies.length > 0
                                        ? Math.round(matchedCompanies.reduce((sum, c) => sum + c.matchRate, 0) / matchedCompanies.length)
                                        : 0
                                    }%
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