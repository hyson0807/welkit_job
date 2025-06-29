// src/pages/CompaniesListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase/client';
import { MapPin, Globe, Building2, Search, ChevronLeft } from 'lucide-react';

const CompaniesListPage = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // 회사 정보와 키워드 가져오기
    const fetchCompanies = async () => {
        try {
            setLoading(true);

            // 회사 정보 가져오기
            const { data: companiesData, error: companiesError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_type', 'company')
                .order('created_at', { ascending: false });

            if (companiesError) throw companiesError;

            // 각 회사의 키워드 가져오기
            const companiesWithKeywords = await Promise.all(
                companiesData.map(async (company) => {
                    const { data: keywordData, error: keywordError } = await supabase
                        .from('company_keyword')
                        .select(`
                            keyword:keyword_id (
                                id,
                                keyword,
                                category
                            )
                        `)
                        .eq('company_id', company.id);

                    if (keywordError) {
                        console.error('Error fetching keywords:', keywordError);
                        return { ...company, keywords: [] };
                    }

                    return {
                        ...company,
                        keywords: keywordData?.map(k => k.keyword) || []
                    };
                })
            );

            setCompanies(companiesWithKeywords);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    // 검색 필터링
    const filteredCompanies = companies.filter(company => {
        const matchesSearch =
            company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.address?.toLowerCase().includes(searchTerm.toLowerCase());

        if (selectedCategory === 'all') return matchesSearch;

        // 카테고리별 필터링 (키워드 기반)
        return matchesSearch && company.keywords.some(keyword =>
            keyword?.category === selectedCategory
        );
    });

    // 키워드 카테고리별 색상
    const getCategoryColor = (category) => {
        const colors = {
            '직무': 'bg-red-100 text-red-700',
            '지역': 'bg-blue-100 text-blue-700',
            '혜택': 'bg-green-100 text-green-700',
            'Skills': 'bg-purple-100 text-purple-700',
            'Experience': 'bg-orange-100 text-orange-700',
            'Location': 'bg-indigo-100 text-indigo-700'
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    // 회사 카드 클릭 핸들러
    const handleCompanyClick = (companyId) => {
        console.log('Company clicked:', companyId);
        // 로그인 페이지로 이동 (구직자 모드로)
        localStorage.setItem('userType', 'user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">회사 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F6F4]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1E4B7B] to-[#2A5A8A] text-white px-5 py-6 shadow-lg">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">메인으로</span>
                        </button>
                        <h1 className="text-3xl font-bold">WelKit</h1>
                        <div className="w-24"></div> {/* 균형을 위한 빈 공간 */}
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold mb-2">채용 중인 회사</h2>
                        <p className="text-sm opacity-80">총 {companies.length}개의 회사가 인재를 찾고 있습니다</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-5 py-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="회사명, 설명, 지역으로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B7B] focus:border-transparent"
                        >
                            <option value="all">모든 카테고리</option>
                            <option value="직무">직무별</option>
                            <option value="지역">지역별</option>
                            <option value="혜택">혜택별</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Companies Grid */}
            <div className="max-w-6xl mx-auto px-5 py-8">
                {filteredCompanies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map((company) => (
                            <div
                                key={company.id}
                                onClick={() => handleCompanyClick(company.id)}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
                            >
                                {/* Company Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                                                {company.name || '회사명 미등록'}
                                            </h3>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {company.address || '주소 미등록'}
                                            </p>
                                        </div>
                                        <Building2 className="w-8 h-8 text-[#1E4B7B] opacity-50" />
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                                        {company.description || '회사 소개가 없습니다.'}
                                    </p>

                                    {/* Website */}
                                    {company.website && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                                            <Globe className="w-4 h-4" />
                                            <span className="truncate">{company.website}</span>
                                        </div>
                                    )}

                                    {/* Keywords */}
                                    {company.keywords.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-500 font-medium">채용 키워드</p>
                                            <div className="flex flex-wrap gap-1">
                                                {company.keywords.slice(0, 6).map((keyword, index) => (
                                                    <span
                                                        key={keyword?.id || index}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(keyword?.category)}`}
                                                    >
                                                        {keyword?.keyword}
                                                    </span>
                                                ))}
                                                {company.keywords.length > 6 && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        +{company.keywords.length - 6}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 px-6 py-3 border-t">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500">
                                            등록일: {new Date(company.created_at).toLocaleDateString()}
                                        </p>
                                        <span className="text-xs font-medium text-[#1E4B7B]">
                                            지원하기 →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Building2 className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            검색 결과가 없습니다
                        </h3>
                        <p className="text-gray-500">
                            다른 검색어를 입력하거나 필터를 변경해보세요
                        </p>
                    </div>
                )}
            </div>

            {/* Info Banner */}
            <div className="bg-[#1E4B7B] text-white py-8 mt-12">
                <div className="max-w-4xl mx-auto px-5 text-center">
                    <h3 className="text-xl font-bold mb-2">🚀 지금 바로 지원하세요!</h3>
                    <p className="text-sm opacity-90 mb-4">
                        로그인하면 AI가 당신에게 맞는 회사를 자동으로 매칭해드립니다
                    </p>
                    <button
                        onClick={() => {
                            localStorage.setItem('userType', 'user');
                            navigate('/login');
                        }}
                        className="px-8 py-3 bg-white text-[#1E4B7B] font-bold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        구직자로 로그인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompaniesListPage;