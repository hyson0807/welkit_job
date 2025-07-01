// src/pages/employer/UserListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';

const UserListPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // localStorage에서 userType 가져오기
    const userType = localStorage.getItem('userType');

    // 구직자 목록 가져오기
    const fetchCandidates = async () => {
        try {
            setLoading(true);

            // 1. 모든 구직자 가져오기
            const { data: allUsers, error: usersError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_type', 'user')
                .order('created_at', { ascending: false });

            if (usersError) {
                console.error('Error fetching users:', usersError);
                throw usersError;
            }

            // 2. 각 구직자의 키워드 가져오기
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

                usersWithKeywords.push({
                    ...userProfile,
                    keywords: userKeywordData || []
                });
            }

            setCandidates(usersWithKeywords);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // userType이 company가 아니면 메인 페이지로
        if (userType !== 'company') {
            navigate('/');
            return;
        }

        fetchCandidates();
    }, [userType, navigate]);

    // 필터링된 구직자 목록
    const filteredCandidates = candidates.filter(candidate => {
        // 검색어 필터
        const matchesSearch = !searchTerm ||
            candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.country?.toLowerCase().includes(searchTerm.toLowerCase());

        // 카테고리 필터
        const matchesCategory = selectedCategory === 'all' ||
            candidate.keywords.some(k => k.keyword?.category === selectedCategory);

        return matchesSearch && matchesCategory;
    });

    // 키워드 카테고리 가져오기
    const categories = [...new Set(
        candidates.flatMap(c => c.keywords.map(k => k.keyword?.category)).filter(Boolean)
    )];

    const handleProceedToRegistration = () => {
        // 로그인 페이지로 이동 (회원가입/로그인 진행)
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading candidates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F6F4]">
            {/* Header */}
            <div className="bg-[#1E4B7B] text-white px-5 py-4 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">WelKit for Employers</h1>
                            <p className="text-sm opacity-80 mt-1">
                                Find the perfect candidates for your company
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-b from-[#1E4B7B] to-[#2A5A8A] text-white px-5 py-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-4">
                        {candidates.length}+ Active Job Seekers
                    </h2>
                    <p className="text-lg mb-8 opacity-90">
                        Browse through talented candidates ready to work in Korea
                    </p>
                    <button
                        onClick={handleProceedToRegistration}
                        className="px-8 py-4 bg-white text-[#1E4B7B] rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Register Your Company to Contact Candidates →
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-5 py-8">
                {/* Search and Filter Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Browse Candidates</h3>

                    <div className="flex flex-wrap gap-4">
                        {/* Search Input */}
                        <div className="flex-1 min-w-[300px]">
                            <input
                                type="text"
                                placeholder="Search by name, country, location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-[#1E4B7B]">{filteredCandidates.length}</span> candidates
                        </p>
                    </div>
                </div>

                {/* Candidates Grid */}
                {filteredCandidates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCandidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6"
                            >
                                {/* Candidate Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {candidate.name || 'Name not provided'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {candidate.email}
                                        </p>
                                    </div>
                                    <div className="text-2xl">👤</div>
                                </div>

                                {/* Candidate Info */}
                                <div className="space-y-2 text-sm">
                                    {candidate.country && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span>🌍</span>
                                            <span>{candidate.country}</span>
                                        </div>
                                    )}
                                    {candidate.visa && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span>📄</span>
                                            <span>{candidate.visa}</span>
                                        </div>
                                    )}
                                    {candidate.address && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span>📍</span>
                                            <span>{candidate.address}</span>
                                        </div>
                                    )}
                                    {candidate.korean_level && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span>🗣️</span>
                                            <span>Korean: {candidate.korean_level}</span>
                                        </div>
                                    )}
                                    {candidate.available_date && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span>📅</span>
                                            <span>Available: {new Date(candidate.available_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Keywords */}
                                {candidate.keywords.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-semibold text-gray-700 mb-2">Skills & Preferences</p>
                                        <div className="flex flex-wrap gap-1">
                                            {candidate.keywords.slice(0, 5).map((k, index) => (
                                                <span
                                                    key={k.keyword_id || index}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                                >
                                                    {k.keyword?.keyword}
                                                </span>
                                            ))}
                                            {candidate.keywords.length > 5 && (
                                                <span className="px-2 py-1 text-gray-500 text-xs">
                                                    +{candidate.keywords.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Description Preview */}
                                {candidate.description && (
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-600 line-clamp-3">
                                            {candidate.description}
                                        </p>
                                    </div>
                                )}

                                {/* CTA */}
                                <div className="mt-4 pt-4 border-t">
                                    <button
                                        onClick={handleProceedToRegistration}
                                        className="w-full py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors text-sm font-medium"
                                    >
                                        Register to Contact
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No candidates found
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm || selectedCategory !== 'all'
                                ? 'Try adjusting your search filters'
                                : 'No job seekers have registered yet'}
                        </p>
                    </div>
                )}

                {/* Bottom CTA */}
                <div className="mt-12 text-center">
                    <div className="bg-gradient-to-r from-[#1E4B7B] to-[#2A5A8A] rounded-2xl p-8 text-white">
                        <h3 className="text-2xl font-bold mb-4">Ready to find your perfect employee?</h3>
                        <p className="mb-6 opacity-90">Register your company and start connecting with candidates today</p>
                        <button
                            onClick={handleProceedToRegistration}
                            className="px-8 py-3 bg-white text-[#1E4B7B] rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Register Your Company Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserListPage;