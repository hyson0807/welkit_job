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
            // 1. 회사 정보 가져오기
            const { data: companyProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('Error fetching company profile:', profileError);
                throw profileError;
            }
            setCompanyInfo(companyProfile);

            // 2. 회사가 선택한 키워드 가져오기
            const { data: companyKeywordData, error: companyError } = await supabase
                .from('company_keyword')
                .select(`
                    keyword_id,
                    keyword:keyword_id (
                        id,
                        keyword,
                        category
                    )
                `)
                .eq('company_id', user.id);

            if (companyError) {
                console.error('Error fetching company keywords:', companyError);
                throw companyError;
            }

            console.log('Company keywords:', companyKeywordData);
            const companyKeywordIds = companyKeywordData?.map(item => item.keyword_id) || [];
            setCompanyKeywords(companyKeywordData || []);

            // 3. 모든 구직자 가져오기
            const { data: allUsers, error: usersError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_type', 'user');

            if (usersError) {
                console.error('Error fetching users:', usersError);
                throw usersError;
            }

            console.log('All users:', allUsers);

            // 4. 각 구직자의 키워드 가져오기
            const usersWithKeywords = [];

            for (const userProfile of allUsers) {
                const { data: userKeywordData, error: keywordError } = await supabase
                    .from('user_keyword')
                    .select(`
                        keyword_id,
                        keyword:keyword_id (
                            id,
                            keyword,
                            category
                        )
                    `)
                    .eq('user_id', userProfile.id);

                if (keywordError) {
                    console.error(`Error fetching keywords for user ${userProfile.id}:`, keywordError);
                    usersWithKeywords.push({
                        ...userProfile,
                        user_keyword: []
                    });
                } else {
                    usersWithKeywords.push({
                        ...userProfile,
                        user_keyword: userKeywordData || []
                    });
                }
            }

            console.log('Users with keywords:', usersWithKeywords);

            // 5. 매칭률 계산
            const candidatesWithMatchRate = usersWithKeywords.map(candidate => {
                const candidateKeywordIds = candidate.user_keyword?.map(uk => uk.keyword_id) || [];

                // 매칭된 키워드 찾기
                const matchedKeywordIds = companyKeywordIds.filter(ckId =>
                    candidateKeywordIds.includes(ckId)
                );

                // 매칭률 계산
                const matchRate = companyKeywordIds.length > 0
                    ? Math.round((matchedKeywordIds.length / companyKeywordIds.length) * 100)
                    : 0;

                // 매칭된 키워드 정보
                const matchedKeywords = candidate.user_keyword
                    ?.filter(uk => matchedKeywordIds.includes(uk.keyword_id))
                    ?.map(uk => uk.keyword) || [];

                return {
                    ...candidate,
                    matchRate,
                    matchedKeywords,
                    totalMatchedCount: matchedKeywordIds.length,
                    totalCompanyKeywords: companyKeywordIds.length,
                };
            });

            // 6. 정렬 (매칭률 높은 순)
            const sortedCandidates = candidatesWithMatchRate.sort((a, b) => b.matchRate - a.matchRate);

            console.log('Final sorted candidates:', sortedCandidates);
            setMatchedCandidates(sortedCandidates);

        } catch (error) {
            console.error('Error in fetchCompanyDataAndMatch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCompanyDataAndMatch();
        }
    }, [user]);

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthorized) return null;

    const handleLogout = async () => {
        await signOut();
    };

    const handleSendMessage = (candidateId) => {
        console.log('Send message to candidate:', candidateId);
        // TODO: 메시지 보내기 기능 구현
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

                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Your Requirements ({companyKeywords.length})</h3>
                        <div className="flex flex-wrap gap-2">
                            {companyKeywords.length > 0 ? (
                                companyKeywords.map(ck => (
                                    <span
                                        key={ck.keyword_id}
                                        className="px-3 py-1 bg-[#1E4B7B] text-white rounded-full text-sm font-medium"
                                    >
                                        {ck.keyword?.keyword || 'Unknown'}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500">No keywords selected</span>
                            )}
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
                                    candidate.matchRate > 0 ? 'border-l-4 border-l-blue-500' : 'opacity-75'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {candidate.name || 'Name not provided'}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                ✉️ {candidate.email}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className={`text-3xl font-bold ${
                                            candidate.matchRate >= 80 ? 'text-green-600' :
                                                candidate.matchRate >= 50 ? 'text-blue-600' :
                                                    candidate.matchRate > 0 ? 'text-gray-600' : 'text-gray-400'
                                        }`}>
                                            {candidate.matchRate}%
                                        </div>
                                        <p className="text-sm text-gray-500">Match Rate</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-3">
                                        {candidate.matchRate > 0 ? (
                                            <>Matched Keywords ({candidate.totalMatchedCount}/{candidate.totalCompanyKeywords})</>
                                        ) : (
                                            'No matching keywords'
                                        )}
                                    </p>
                                    {candidate.matchRate > 0 && candidate.matchedKeywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.matchedKeywords.map((keyword, index) => (
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
                                        onClick={() => handleSendMessage(candidate.id)}
                                        className="px-6 py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors text-sm font-medium"
                                    >
                                        면접 요청 보내기
                                    </button>
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
                            No candidates found
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {companyKeywords.length === 0
                                ? 'Please add keywords first'
                                : 'No users registered yet or no matching candidates found'
                            }
                        </p>
                        <button
                            onClick={() => navigate('/employer/keywords')}
                            className="px-6 py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors"
                        >
                            {companyKeywords.length === 0 ? 'Add Keywords' : 'Edit Requirements'}
                        </button>
                    </div>
                )}

                {/* Stats Summary */}
                {matchedCandidates.length > 0 && (
                    <div className="mt-8 bg-gray-100 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-700">{matchedCandidates.length}</div>
                                <div className="text-sm text-gray-600">Total Candidates</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {matchedCandidates.filter(c => c.matchRate >= 80).length}
                                </div>
                                <div className="text-sm text-gray-600">High Matches (80%+)</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {matchedCandidates.filter(c => c.matchRate >= 50).length}
                                </div>
                                <div className="text-sm text-gray-600">Good Matches (50%+)</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {matchedCandidates.length > 0
                                        ? Math.round(matchedCandidates.reduce((sum, c) => sum + c.matchRate, 0) / matchedCandidates.length)
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