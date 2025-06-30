// src/pages/employer/CompanyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import { useCheckUserType } from "../auth/checkUserType.js";
import {
    Building2,
    Users,
    Bell,
    Settings,
    LogOut,
    ChevronRight,
    MapPin,
    Globe,
    TrendingUp,
    Edit3,
    Target,
    UserCheck,
    Clock,
    BarChart3
} from 'lucide-react';

const CompanyDashboard = () => {
    const { isAuthorized, isLoading } = useCheckUserType('company');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [profile, setProfile] = useState(null);
    const [keywords, setKeywords] = useState([]);
    const [matchStats, setMatchStats] = useState({
        totalCandidates: 0,
        newCandidates: 0,
        contactedCount: 0
    });
    const [loading, setLoading] = useState(true);

    // 회사 프로필 정보 가져오기
    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // 키워드 정보 가져오기
    const fetchKeywords = async () => {
        try {
            const { data, error } = await supabase
                .from('company_keyword')
                .select(`
                    keyword:keyword_id (
                        id,
                        keyword,
                        category
                    )
                `)
                .eq('company_id', user.id);

            if (error) throw error;
            setKeywords(data?.map(item => item.keyword) || []);
        } catch (error) {
            console.error('Error fetching keywords:', error);
        }
    };

    // 매칭 통계 가져오기
    const fetchMatchStats = async () => {
        // 실제 구현시 매칭 테이블에서 데이터를 가져와야 함
        setMatchStats({
            totalCandidates: 25,
            newCandidates: 8,
            contactedCount: 12
        });
    };

    useEffect(() => {
        if (user) {
            Promise.all([
                fetchProfile(),
                fetchKeywords(),
                fetchMatchStats()
            ]).finally(() => setLoading(false));
        }
    }, [user]);

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4B7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    // 프로필 완성도 계산
    const calculateProfileCompletion = () => {
        if (!profile) return 0;
        const fields = ['name', 'description', 'website', 'address'];
        const filledFields = fields.filter(field => profile[field]).length;
        return Math.round((filledFields / fields.length) * 100);
    };

    const profileCompletion = calculateProfileCompletion();

    return (
        <div className="min-h-screen bg-[#F6F6F4]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1E4B7B] to-[#2A5A8A] text-white">
                <div className="max-w-6xl mx-auto px-5 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">WelKit Employer Dashboard</h1>
                            <p className="text-sm opacity-80">Welcome back, {profile?.name || 'Company'}!</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <div className="flex items-center justify-between mb-2">
                                <Users className="w-8 h-8 text-white/80" />
                                <span className="text-2xl font-bold">{matchStats.totalCandidates}</span>
                            </div>
                            <p className="text-sm opacity-80">Total Candidates</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <div className="flex items-center justify-between mb-2">
                                <Bell className="w-8 h-8 text-white/80" />
                                <span className="text-2xl font-bold">{matchStats.newCandidates}</span>
                            </div>
                            <p className="text-sm opacity-80">New Candidates</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <div className="flex items-center justify-between mb-2">
                                <UserCheck className="w-8 h-8 text-white/80" />
                                <span className="text-2xl font-bold">{matchStats.contactedCount}</span>
                            </div>
                            <p className="text-sm opacity-80">Contacted</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-5 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Company Profile & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Company Profile Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Company Profile</h2>
                                <button
                                    onClick={() => navigate('/employer/info')}
                                    className="text-[#1E4B7B] hover:text-[#164066]"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="text-center mb-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                                    <Building2 className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-gray-800">{profile?.name || 'Company Name'}</h3>
                                <p className="text-sm text-gray-600">{profile?.email}</p>
                            </div>

                            <div className="space-y-2 text-sm">
                                {profile?.website && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Globe className="w-4 h-4" />
                                        <span className="truncate">{profile.website}</span>
                                    </div>
                                )}
                                {profile?.address && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{profile.address}</span>
                                    </div>
                                )}
                            </div>

                            {/* Profile Completion */}
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Profile Completion</span>
                                    <span className="text-sm font-semibold text-[#1E4B7B]">{profileCompletion}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-[#1E4B7B] h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${profileCompletion}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/employer/info')}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium">Edit Company Info</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                                <button
                                    onClick={() => navigate('/employer/keywords')}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Target className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium">Manage Requirements</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                                <button
                                    onClick={() => navigate('/employer/matching')}
                                    className="w-full flex items-center justify-between p-3 bg-[#1E4B7B] hover:bg-[#164066] rounded-lg transition-colors text-white"
                                >
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5" />
                                        <span className="text-sm font-medium">View Candidates</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Requirements & Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Requirements */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Job Requirements</h2>
                                <button
                                    onClick={() => navigate('/employer/keywords')}
                                    className="text-sm text-[#1E4B7B] hover:underline"
                                >
                                    Edit Requirements
                                </button>
                            </div>

                            {keywords.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Group keywords by category */}
                                    {['Skills', 'Experience', 'Location', 'Benefits'].map(category => {
                                        const categoryKeywords = keywords.filter(k => k?.category === category);
                                        if (categoryKeywords.length === 0) return null;

                                        return (
                                            <div key={category}>
                                                <h4 className="text-sm font-medium text-gray-600 mb-2">{category}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {categoryKeywords.map((keyword, index) => (
                                                        <span
                                                            key={keyword?.id || index}
                                                            className="px-3 py-1 bg-[#1E4B7B] text-white rounded-full text-sm font-medium"
                                                        >
                                                            {keyword?.keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 mb-3">No requirements set yet</p>
                                    <button
                                        onClick={() => navigate('/employer/keywords')}
                                        className="px-4 py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors text-sm"
                                    >
                                        Set Requirements
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 pb-4 border-b">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bell className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">New candidate matched!</p>
                                        <p className="text-xs text-gray-600">A job seeker with 85% match rate appeared</p>
                                        <p className="text-xs text-gray-500 mt-1">30 minutes ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pb-4 border-b">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <UserCheck className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">Interview request sent</p>
                                        <p className="text-xs text-gray-600">Message sent to candidate #1234</p>
                                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <BarChart3 className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">Weekly report</p>
                                        <p className="text-xs text-gray-600">12 new candidates this week (+20%)</p>
                                        <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recruitment Tips */}
                        <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                            <h3 className="text-lg font-semibold text-green-900 mb-3">🎯 Recruitment Tips</h3>
                            <ul className="space-y-2 text-sm text-green-800">
                                <li>• Use AI to set requirements based on your ideal candidate description</li>
                                <li>• Check candidates daily to connect with fresh talent</li>
                                <li>• Clear job descriptions attract better candidates</li>
                                <li>• Respond quickly to increase hiring success rate</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;