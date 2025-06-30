// src/pages/jobseeker/JobSeekerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { supabase } from '../../services/supabase/client';
import { useCheckUserType } from "../auth/checkUserType.js";
import {
    User,
    Briefcase,
    Bell,
    Settings,
    LogOut,
    ChevronRight,
    MapPin,
    Calendar,
    Star,
    TrendingUp,
    Edit3,
    Target,
    FileText,
    Clock
} from 'lucide-react';

const JobSeekerDashboard = () => {
    const { isAuthorized, isLoading } = useCheckUserType('user');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [profile, setProfile] = useState(null);
    const [keywords, setKeywords] = useState([]);
    const [matchStats, setMatchStats] = useState({
        totalMatches: 0,
        newMatches: 0,
        appliedCount: 0
    });
    const [loading, setLoading] = useState(true);

    // 프로필 정보 가져오기
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
                .from('user_keyword')
                .select(`
                    keyword:keyword_id (
                        id,
                        keyword,
                        category
                    )
                `)
                .eq('user_id', user.id);

            if (error) throw error;
            setKeywords(data?.map(item => item.keyword) || []);
        } catch (error) {
            console.error('Error fetching keywords:', error);
        }
    };

    // 매칭 통계 가져오기 (실제로는 매칭 테이블이 필요하지만 임시로 설정)
    const fetchMatchStats = async () => {
        // 실제 구현시 매칭 테이블에서 데이터를 가져와야 함
        setMatchStats({
            totalMatches: 15,
            newMatches: 3,
            appliedCount: 5
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
        const fields = ['name', 'birth', 'country', 'visa', 'address', 'phone_number', 'korean_level', 'description'];
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
                            <h1 className="text-3xl font-bold mb-1">WelKit Dashboard</h1>
                            <p className="text-sm opacity-80">Welcome back, {profile?.name || 'Job Seeker'}!</p>
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
                                <TrendingUp className="w-8 h-8 text-white/80" />
                                <span className="text-2xl font-bold">{matchStats.totalMatches}</span>
                            </div>
                            <p className="text-sm opacity-80">Total Matches</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <div className="flex items-center justify-between mb-2">
                                <Bell className="w-8 h-8 text-white/80" />
                                <span className="text-2xl font-bold">{matchStats.newMatches}</span>
                            </div>
                            <p className="text-sm opacity-80">New Matches</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <div className="flex items-center justify-between mb-2">
                                <Briefcase className="w-8 h-8 text-white/80" />
                                <span className="text-2xl font-bold">{matchStats.appliedCount}</span>
                            </div>
                            <p className="text-sm opacity-80">Applied Jobs</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-5 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
                                <button
                                    onClick={() => navigate('/jobseeker/info')}
                                    className="text-[#1E4B7B] hover:text-[#164066]"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="text-center mb-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                                    <User className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-gray-800">{profile?.name || 'Name not set'}</h3>
                                <p className="text-sm text-gray-600">{profile?.email}</p>
                            </div>

                            <div className="space-y-2 text-sm">
                                {profile?.country && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span>🌍</span>
                                        <span>{profile.country}</span>
                                    </div>
                                )}
                                {profile?.visa && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span>📄</span>
                                        <span>{profile.visa}</span>
                                    </div>
                                )}
                                {profile?.address && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{profile.address}</span>
                                    </div>
                                )}
                                {profile?.korean_level && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span>🇰🇷</span>
                                        <span>Korean: {profile.korean_level}</span>
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
                                    onClick={() => navigate('/jobseeker/info')}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium">Edit Profile</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                                <button
                                    onClick={() => navigate('/jobseeker/keywords')}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Target className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium">Manage Keywords</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                                <button
                                    onClick={() => navigate('/jobseeker/matching')}
                                    className="w-full flex items-center justify-between p-3 bg-[#1E4B7B] hover:bg-[#164066] rounded-lg transition-colors text-white"
                                >
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-5 h-5" />
                                        <span className="text-sm font-medium">View Matches</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Keywords & Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Keywords */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">My Keywords</h2>
                                <button
                                    onClick={() => navigate('/jobseeker/keywords')}
                                    className="text-sm text-[#1E4B7B] hover:underline"
                                >
                                    Edit Keywords
                                </button>
                            </div>

                            {keywords.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {keywords.map((keyword, index) => (
                                        <span
                                            key={keyword?.id || index}
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                keyword?.category === '직무' ? 'bg-red-100 text-red-700' :
                                                    keyword?.category === '지역' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                            }`}
                                        >
                                            {keyword?.keyword}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 mb-3">No keywords selected yet</p>
                                    <button
                                        onClick={() => navigate('/jobseeker/keywords')}
                                        className="px-4 py-2 bg-[#1E4B7B] text-white rounded-lg hover:bg-[#164066] transition-colors text-sm"
                                    >
                                        Add Keywords
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
                                        <p className="text-sm font-medium text-gray-800">New match found!</p>
                                        <p className="text-xs text-gray-600">ABC Company is looking for candidates like you</p>
                                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pb-4 border-b">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">Application sent</p>
                                        <p className="text-xs text-gray-600">Your application to XYZ Corp was sent successfully</p>
                                        <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Star className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">Profile updated</p>
                                        <p className="text-xs text-gray-600">Your profile completion increased to {profileCompletion}%</p>
                                        <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Pro Tips</h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li>• Complete your profile to increase match rate by up to 40%</li>
                                <li>• Add more keywords to get better job matches</li>
                                <li>• Check your matches daily for new opportunities</li>
                                <li>• Update your availability date regularly</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerDashboard;