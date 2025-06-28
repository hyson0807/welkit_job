import React, { useState } from 'react';
import { Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import {useNavigate} from "react-router-dom";
import {supabase} from "../services/supabase/client.js";

const PhoneAuthForm = ({ userType = 'user' }) => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [errors, setErrors] = useState({ phone: '', otp: '' });
    const navigate = useNavigate();


    const formatPhoneNumber = (value) => {
        // 숫자만 추출
        const numbers = value.replace(/[^\d]/g, '');

        // 010-1234-5678 형식으로 포맷팅
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const validatePhone = (phoneNumber) => {
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        return phoneRegex.test(phoneNumber);
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
        setErrors({ ...errors, phone: '' });
    };

    // 전화번호를 국제 형식으로 변환하는 함수
    const convertToInternationalFormat = (phoneNumber) => {
        // 010-1234-5678 -> +821012345678
        const numbers = phoneNumber.replace(/[^\d]/g, '');
        return `+82${numbers}`;
    };

    async function sendOtp() {
        if (!validatePhone(phone)) {
            setErrors({ ...errors, phone: '올바른 전화번호 형식이 아닙니다 (010-1234-5678)' });
            return;
        }

        setLoading(true);
        try {
            // 전화번호를 국제 형식으로 변환
            const internationalPhone = convertToInternationalFormat(phone);
            console.log('Sending OTP to:', internationalPhone); // 디버깅용

            const { error } = await supabase.auth.signInWithOtp({
                phone: internationalPhone
            });
            if (error) throw error;



            setOtpSent(true);
            alert(`인증번호가 ${internationalPhone}로 발송되었습니다.`);
        } catch (error) {
            alert(`오류: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function verifyOtp() {
        if (!otp || otp.length !== 6) {
            setErrors({ ...errors, otp: '6자리 인증번호를 입력해주세요' });
            return;
        }

        setLoading(true);
        try {
            // 전화번호를 국제 형식으로 변환
            const internationalPhone = convertToInternationalFormat(phone);


            const { data: { session }, error } = await supabase.auth.verifyOtp({
                phone: internationalPhone,
                token: otp,
                type: 'sms',
            });

            if (error || !session) throw error;

            const { data: user } = await supabase
                .from('profiles')
                .select('*')
                .eq('phone_number', internationalPhone)
                .eq('user_type', userType)
                .single();

            if (!user) {
                const { error: insertError } = await supabase.from('profiles').insert({
                    phone_number: internationalPhone,
                    user_type: userType,
                }).select().single();

                if (insertError) throw insertError;
            }

            if (userType === 'user') {
                navigate('/jobseeker/info');
            } else {
                navigate('/employer/info');
            }



            alert(`${userType === 'user' ? '구직자' : '고용주'}로 로그인되었습니다. (${internationalPhone})`);

        } catch (error) {
            alert(`오류: ${error?.message || '인증에 실패했습니다.'}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">


            <div className="space-y-6">
                {/* 전화번호 입력 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        휴대폰 번호
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="010-1234-5678"
                            className={`w-full pl-10 pr-3 py-3 border ${
                                errors.phone ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                            maxLength={13}
                        />
                    </div>
                    {errors.phone && (
                        <p className="text-sm text-red-600">{errors.phone}</p>
                    )}
                </div>

                {/* OTP 입력 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        인증번호
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^\d]/g, '');
                                setOtp(value);
                                setErrors({ ...errors, otp: '' });
                            }}
                            placeholder="6자리 인증번호"
                            className={`w-full pl-10 pr-3 py-3 border ${
                                errors.otp ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                            maxLength={6}
                            disabled={!otpSent}
                        />
                    </div>
                    {errors.otp && (
                        <p className="text-sm text-red-600">{errors.otp}</p>
                    )}
                </div>

                {/* 버튼들 */}
                <div className="space-y-3">
                    <button
                        onClick={sendOtp}
                        disabled={loading || otpSent}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                            loading || otpSent
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-800 text-white hover:bg-gray-700 active:scale-[0.98]'
                        }`}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : otpSent ? (
                            '인증번호 발송됨'
                        ) : (
                            '인증번호 받기'
                        )}
                    </button>

                    <button
                        onClick={verifyOtp}
                        disabled={loading || !otpSent}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                            loading || !otpSent
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                        }`}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                로그인
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </button>
                </div>

                {/* 재발송 링크 */}
                {otpSent && !loading && (
                    <div className="text-center">
                        <button
                            onClick={() => {
                                setOtpSent(false);
                                setOtp('');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 underline"
                        >
                            인증번호 재발송
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhoneAuthForm;