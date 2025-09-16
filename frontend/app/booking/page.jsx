'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

import Step1Time from './Step1Time';
import Step2Location from './Step2Location';
import Step3Info from './Step3Info';
import Step4EKYC from './Step4EKYC';
import Step5Payment from './Step5Payment';
import Step6Confirmation from './Step6Confirmation';
import ProgressBar from './ProgressBar';

const BookingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleSlug = searchParams.get('slug');

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [callbackLoading, setCallbackLoading] = useState(false);

  const [vehicle, setVehicle] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('08:00');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('12:00');
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [sameLocation, setSameLocation] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    licenseNumber: '',
    notes: '',
  });

  const [uploads, setUploads] = useState({
    frontID: null,
    backID: null,
    gplx: null,
  });

  const [selectedPayment, setSelectedPayment] = useState('cash');

  const frontIDRef = useRef(null);
  const backIDRef = useRef(null);
  const gplxRef = useRef(null);

  // Redirect nếu thiếu slug
  useEffect(() => {
    if (!vehicleSlug) {
      router.push('/vehicles');
    }
  }, [vehicleSlug, router]);

  // Load xe
  useEffect(() => {
    if (!vehicleSlug) return;
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('v_fe_vehicle_cards')
          .select('*')
          .eq('slug', vehicleSlug)
          .single();
        if (error) throw new Error(error.message);
        setVehicle(data);
      } catch (err) {
        setError('Lỗi tải thông tin xe: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [vehicleSlug]);

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkAuth = async () => {
      try {
const { data: { user }, error: userError } = await supabase.auth.getUser();        console.log('CheckAuth - User:', user, 'Error:', userError); // Log để debug
        if (userError) {
          console.error('Lỗi lấy thông tin người dùng:', userError);
          setIsLoggedIn(false);
          setIsVerified(false);
          return;
        }
        if (user) {
          setIsLoggedIn(true);
          const { data, error } = await supabase
            .from('nguoi_dung')
            .select('ho_ten, email, sdt, trang_thai')
            .eq('id', user.id)
            .single();
          console.log('User data:', data, 'Error:', error); // Log để debug
          if (data && !error) {
            setCustomerInfo({
              fullName: data.ho_ten || '',
              email: data.email || '',
              phone: data.sdt || '',
              idNumber: '',
              licenseNumber: '',
              notes: '',
            });
            const verified = data.trang_thai === 'ACTIVE';
            setIsVerified(verified);
            console.log('User verified status:', verified); // Log để debug
          } else {
            setIsVerified(false);
          }
        } else {
          setIsLoggedIn(false);
          setIsVerified(false);
        }
      } catch (err) {
        console.error('Lỗi kiểm tra đăng nhập:', err);
        setIsLoggedIn(false);
        setIsVerified(false);
      }
    };

    // Gọi kiểm tra ban đầu
    checkAuth();

    // Lắng nghe thay đổi trạng thái đăng nhập
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, 'Session:', session); // Log để debug
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoggedIn(true);
        checkAuth(); // Tải lại thông tin người dùng khi đăng nhập
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setIsVerified(false);
        setCustomerInfo({
          fullName: '',
          phone: '',
          email: '',
          idNumber: '',
          licenseNumber: '',
          notes: '',
        });
      }
    });

    // Hủy đăng ký listener khi component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Tính tổng tiền
  useEffect(() => {
    if (vehicle && pickupDate && returnDate) {
      const d1 = new Date(pickupDate);
      const d2 = new Date(returnDate);
      const days = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
      if (Number.isFinite(days) && days > 0) {
        const rentalPrice = vehicle.price * days;
        const deliveryFee = 50000;
        const insuranceFee = 100000;
        setTotalAmount(rentalPrice + deliveryFee + insuranceFee);
      } else {
        setTotalAmount(0);
      }
    }
  }, [vehicle, pickupDate, returnDate]);

  // Xử lý callback VNPay
  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const donThueId = searchParams.get('donThueId');
    const totalFromParams = searchParams.get('total');

    if (status && donThueId) {
      console.log('VNPay callback - Status:', status, 'donThueId:', donThueId, 'Total:', totalFromParams); // Log để debug
      setPaymentStatus(status);
      setPaymentMessage(message || null);
      setBookingId(donThueId.slice(-8).toUpperCase());
      setBookingSuccess(status === 'SUCCESS');
      setCurrentStep(6);
      setCallbackLoading(true);

      const fetchTotalWithRetry = async (retries = 3) => {
        if (totalFromParams) {
          setTotalAmount(parseInt(totalFromParams, 10));
          setCallbackLoading(false);
          return;
        }
        if (vehicle && pickupDate && returnDate) {
          const d1 = new Date(pickupDate);
          const d2 = new Date(returnDate);
          const days = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
          const deliveryFee = 50000;
          const insuranceFee = 100000;
          const rentalPrice = vehicle?.price && days > 0 ? vehicle.price * days : 0;
          setTotalAmount(rentalPrice + deliveryFee + insuranceFee);
          setCallbackLoading(false);
          return;
        }
        try {
          const { data, error } = await supabase
            .from('don_thue')
            .select('chi_phi_uoc_tinh')
            .eq('id', donThueId)
            .single();
          if (error) {
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              return fetchTotalWithRetry(retries - 1);
            }
            console.error('Lỗi lấy tổng tiền từ Supabase:', error);
            setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
            setTotalAmount(0);
          } else if (data) {
            setTotalAmount(data.chi_phi_uoc_tinh || 0);
          }
        } catch (err) {
          console.error('Lỗi bất ngờ khi lấy tổng tiền:', err);
          setError('Lỗi hệ thống khi tải đơn hàng.');
          setTotalAmount(0);
        } finally {
          setCallbackLoading(false);
        }
      };

      fetchTotalWithRetry();
    }
  }, [searchParams, vehicle, pickupDate, returnDate]);

  const getDateFromInputs = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(dateStr);
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return date;
  };

  const isValidDuration = () => {
    const pickupDateTime = getDateFromInputs(pickupDate, pickupTime);
    const returnDateTime = getDateFromInputs(returnDate, returnTime);
    if (!pickupDateTime || !returnDateTime || pickupDateTime >= returnDateTime) return false;
    const diffInMs = returnDateTime - pickupDateTime;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours >= 2;
  };

  useEffect(() => {
    if (sameLocation) {
      setReturnLocation(pickupLocation);
    }
  }, [pickupLocation, sameLocation]);

  // Bỏ qua bước 3 và 4 nếu đã verified (trạng thái ACTIVE)
  useEffect(() => {
    if (isVerified && (currentStep === 3 || currentStep === 4)) {
      console.log('Bỏ qua bước', currentStep, 'vì đã verified (ACTIVE)'); // Log để debug
      setCurrentStep(5);
    }
  }, [isVerified, currentStep]);

  const nextStep = async () => {
    console.log('nextStep - Bước hiện tại:', currentStep, 'Đã đăng nhập:', isLoggedIn, 'Đã verified:', isVerified); // Log để debug
    if (currentStep === 1) {
      if (!isValidDuration()) {
        setError('Thời gian thuê phải ít nhất 2 giờ.');
        return;
      }
      setError('');
      setCurrentStep(2); // Sang bước 2, sẽ kiểm tra verified sau
      return;
    }

    if (currentStep === 2) {
      if (!pickupLocation || (!sameLocation && !returnLocation)) {
        setError('Vui lòng chọn địa điểm nhận và trả xe.');
        return;
      }
      setError('');
      if (isVerified) {
        console.log('Nhảy từ bước 2 sang bước 5 vì đã verified (ACTIVE)'); // Log để debug
        setCurrentStep(5);
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      const requiredFields = ['fullName', 'phone', 'email', 'idNumber', 'licenseNumber'];
      const isValidInfo = requiredFields.every(field => (customerInfo[field] || '').trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^0[3-9]\d{8}$/;
      if (!isValidInfo || !emailRegex.test(customerInfo.email) || !phoneRegex.test(customerInfo.phone)) {
        setError('Vui lòng điền đầy đủ và đúng định dạng thông tin bắt buộc (*). Email và số điện thoại phải hợp lệ.');
        return;
      }
      setError('');
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      const isValidEKYC = uploads.frontID && uploads.backID && uploads.gplx;
      if (!isValidEKYC) {
        setError('Vui lòng tải lên đầy đủ ảnh giấy tờ.');
        return;
      }
      setError('');
      setCurrentStep(5);
      return;
    }

    if (currentStep === 5) {
      if (!selectedPayment) {
        setError('Vui lòng chọn phương thức thanh toán.');
        return;
      }
      setError('');
      await submitBooking();
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

const submitBooking = async () => {
  setLoading(true);
  setError('');
  console.log('submitBooking - Đã đăng nhập:', isLoggedIn, 'Đã verified:', isVerified);
  try {
    // Kiểm tra tối thiểu
    if (!pickupDate || !returnDate || !pickupTime || !returnTime) {
      throw new Error('Thiếu thời gian nhận/trả xe.');
    }
    if (!pickupLocation || (!sameLocation && !returnLocation)) {
      throw new Error('Thiếu địa điểm nhận/trả xe.');
    }

    // Kiểm tra người dùng
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Lỗi lấy thông tin người dùng:', userError);
      throw new Error('Lỗi xác thực người dùng: ' + userError.message);
    }

    let nguoi_dung_id = user?.id;

    if (!user) {
      console.log('Không tìm thấy người dùng, tạo tài khoản anonymous');
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw new Error('Lỗi tạo tài khoản tạm thời: ' + authError.message);
      nguoi_dung_id = authData.user.id;

      const { data: existingUser, error: existingUserError } = await supabase
        .from('nguoi_dung')
        .select('id, sdt, trang_thai')
        .eq('id', nguoi_dung_id)
        .single();
      if (existingUserError && existingUserError.code !== 'PGRST116') {
        throw existingUserError;
      }

      if (!existingUser) {
        const { data: phoneCheck } = await supabase
          .from('nguoi_dung')
          .select('id')
          .eq('sdt', customerInfo.phone)
          .single();
        if (phoneCheck) {
          throw new Error('Số điện thoại đã tồn tại. Vui lòng đăng nhập để tiếp tục.');
        }

        const { error: userError } = await supabase
          .from('nguoi_dung')
          .insert({
            id: nguoi_dung_id,
            sdt: customerInfo.phone,
            ho_ten: customerInfo.fullName,
            email: customerInfo.email,
            trang_thai: 'ANONYMOUS',
            ngay_tao: new Date(),
          })
          .select('id')
          .single();
        if (userError) {
          throw new Error('Lỗi tạo hồ sơ người dùng: ' + userError.message);
        }
      }
    } else {
      console.log('Tìm thấy người dùng, ID:', user.id);
      const updateFields = {
        ho_ten: customerInfo.fullName || undefined,
        sdt: customerInfo.phone || undefined,
        email: customerInfo.email || undefined,
      };
      const { error: updateError } = await supabase
        .from('nguoi_dung')
        .update(updateFields)
        .eq('id', nguoi_dung_id);
      if (updateError) {
        throw new Error('Lỗi cập nhật hồ sơ: ' + updateError.message);
      }
    }

    console.log('Sử dụng nguoi_dung_id:', nguoi_dung_id);

    // Nếu đi qua bước 4 (EKYC), cập nhật trạng thái thành ACTIVE
    if (!isVerified && uploads.frontID && uploads.backID && uploads.gplx) {
      const { error: verifyError } = await supabase
        .from('nguoi_dung')
        .update({ trang_thai: 'ACTIVE' })
        .eq('id', nguoi_dung_id);
      if (verifyError) throw new Error('Lỗi cập nhật trạng thái verified: ' + verifyError.message);
      setIsVerified(true);
    }

    // Tạo đơn thuê
    const dongXeRes = await supabase
      .from('dong_xe')
      .select('id')
      .eq('slug', vehicleSlug)
      .single();
    if (!dongXeRes.data) throw new Error('Không tìm thấy dòng xe');

    const vungRes = await supabase
      .from('vung')
      .select('id')
      .eq('loai', 'hoat_dong')
      .ilike('ten', `%${pickupLocation}%`)
      .single();
    if (!vungRes.data) throw new Error('Không tìm thấy vùng phù hợp');

    const { data: availableXe, error: xeError } = await supabase
      .from('xe')
      .select('id')
      .eq('dong_xe_id', dongXeRes.data.id)
      .eq('trang_thai', 'AVAILABLE')
      .eq('vung_id', vungRes.data.id)
      .limit(1)
      .single();
    if (xeError || !availableXe) throw new Error('Không có xe khả dụng');

    const batDauLuc = new Date(`${pickupDate}T${pickupTime}:00`);
    const ketThucLuc = new Date(`${returnDate}T${returnTime}:00`);
    const days = Math.ceil((ketThucLuc - batDauLuc) / (1000 * 60 * 60 * 24));
    const deliveryFee = 50000;
    const insuranceFee = 100000;
    const rentalPrice = vehicle?.price && days > 0 ? vehicle.price * days : 0;
    const total = rentalPrice + deliveryFee + insuranceFee;
    setTotalAmount(total);

    const { data: booking, error: bookingError } = await supabase
      .from('don_thue')
      .insert({
        nguoi_dung_id,
        xe_id: availableXe.id,
        bat_dau_luc: batDauLuc,
        ket_thuc_luc: ketThucLuc,
        trang_thai: 'PENDING',
        so_tien_coc: total * 0.5,
        chi_phi_uoc_tinh: total,
      })
      .select('id')
      .single();
    if (bookingError) throw new Error('Lỗi tạo đơn thuê: ' + bookingError.message);

    // Ghi lại thanh toán
    const depositAmount = total * 0.5;
    const { error: paymentError } = await supabase
      .from('thanh_toan')
      .insert({
        nguoi_dung_id,
        don_thue_id: booking.id,
        loai: 'deposit',
        phuong_thuc: selectedPayment,
        so_tien: depositAmount,
        trang_thai: 'PENDING',
        thanh_toan_luc: new Date(),
      });
    if (paymentError) throw new Error('Lỗi tạo thanh toán: ' + paymentError.message);

    // Chuyển hướng VNPay
    if (selectedPayment === 'vnpay') {
      // 🚫 XÓA HOÀN TOÀN VIỆC GỬI TOKEN SUPABASE — KHÔNG CẦN THIẾT!
      const headers = {
        'Content-Type': 'application/json',
        // Không có Authorization header → backend Spring Boot không yêu cầu!
      };

      console.log('Khởi tạo thanh toán VNPay cho donThueId:', booking.id);

      const response = await fetch(
        `http://localhost:8080/api/pay/vnpay/initiate?donThueId=${booking.id}&test=true`,
        { method: 'POST', headers }
      );

      // XỬ LÝ LỖI CHÍNH XÁC
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        console.error('Lỗi từ server:', errorData);
        throw new Error(errorData.message || 'Lỗi khởi tạo thanh toán VNPay');
      }

      const { paymentUrl } = await response.json();
      window.location.href = paymentUrl;
      return;
    }

    // Xác nhận đơn (thanh toán tiền mặt)
    const { error: confirmError } = await supabase
      .from('don_thue')
      .update({ trang_thai: 'CONFIRMED' })
      .eq('id', booking.id);
    if (confirmError) throw new Error('Lỗi xác nhận đơn: ' + confirmError.message);

    setBookingId(booking.id.slice(-8).toUpperCase());
    setBookingSuccess(true);
    setPaymentStatus('SUCCESS');
    setPaymentMessage('Thanh toán hoàn tất!');
    setCurrentStep(6);

  } catch (err) {
    console.error('🔥 Lỗi đặt xe chi tiết:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      originalError: err
    });
    if (err.message.includes('Số điện thoại đã tồn tại')) {
      setError('Số điện thoại đã được sử dụng. Vui lòng <a href="/login" className="underline">đăng nhập</a> hoặc dùng số khác.');
    } else if (err.message.includes('Không có xe khả dụng')) {
      setError('Không có xe khả dụng tại thời gian và địa điểm này. Vui lòng thử lại.');
    } else if (err.message.includes('Lỗi xác thực người dùng')) {
      setError('Phiên đăng nhập không hợp lệ. Vui lòng <a href="/login" className="underline">đăng nhập lại</a>.');
    } else {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
    }
  } finally {
    setLoading(false);
  }
};

  const prevStep = () => {
    if (currentStep > 1) {
      if (currentStep === 5 && isVerified) {
        console.log('Quay lại bước 2 từ bước 5 vì đã verified (ACTIVE)'); // Log để debug
        setCurrentStep(2);
      } else {
        setCurrentStep(prev => prev - 1);
      }
      setError('');
    }
  };

  const renderStep = () => {
    console.log('Render bước:', currentStep, 'Đã đăng nhập:', isLoggedIn, 'Đã verified:', isVerified); // Log để debug
    switch (currentStep) {
      case 1:
        return (
          <Step1Time
            pickupDate={pickupDate}
            setPickupDate={setPickupDate}
            pickupTime={pickupTime}
            setPickupTime={setPickupTime}
            returnDate={returnDate}
            setReturnDate={setReturnDate}
            returnTime={returnTime}
            setReturnTime={setReturnTime}
            isValidDuration={isValidDuration()}
          />
        );
      case 2:
        return (
          <Step2Location
            pickupLocation={pickupLocation}
            setPickupLocation={setPickupLocation}
            returnLocation={returnLocation}
            setReturnLocation={setReturnLocation}
            sameLocation={sameLocation}
            setSameLocation={setSameLocation}
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            locations={vehicle?.locations}
          />
        );
      case 3:
        return (
          <Step3Info
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
            isLoggedIn={isLoggedIn}
          />
        );
      case 4:
        return (
          <Step4EKYC
            uploads={uploads}
            setUploads={setUploads}
            frontIDRef={frontIDRef}
            backIDRef={backIDRef}
            gplxRef={gplxRef}
            isLoggedIn={isLoggedIn}
          />
        );
      case 5:
        return (
          <Step5Payment
            vehicle={vehicle}
            pickupDate={pickupDate}
            returnDate={returnDate}
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
            total={totalAmount}
          />
        );
      case 6:
        return (
          <Step6Confirmation
            bookingId={bookingId}
            total={totalAmount}
            status={paymentStatus}
            message={paymentMessage}
            router={router}
          />
        );
      default:
        return null;
    }
  };

  if (loading || callbackLoading) {
    return <div className="text-center py-12">Đang xử lý đơn hàng...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Đặt Xe - {vehicle?.name}</h1>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {renderStep()}
          <div className="flex justify-between mt-8">
            <button
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              style={{ display: currentStep === 1 || currentStep === 6 ? 'none' : 'block' }}
              onClick={prevStep}
              disabled={loading}
            >
              Quay lại
            </button>
            <button
              className={`px-8 py-3 text-white rounded-xl font-medium transition-colors ${
                currentStep === totalSteps ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary-hover'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={currentStep === totalSteps ? () => router.push('/') : nextStep}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (currentStep === totalSteps ? 'Về trang chủ' : 'Tiếp tục')}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600" dangerouslySetInnerHTML={{ __html: error }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;