"use client";

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
  const vehicleId = searchParams.get('vehicleId');

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
  const [pickupTramId, setPickupTramId] = useState('');
  const [returnTramId, setReturnTramId] = useState('');
  const [sameLocation, setSameLocation] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  const [vehicleTramList, setVehicleTramList] = useState([]); // Chỉ các trạm xe đang đỗ
  const [allTramList, setAllTramList] = useState([]);       // Tất cả các trạm đang hoạt động

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

  useEffect(() => {
    if (!vehicleId) {
        console.log('DEBUG: No vehicleId provided, redirecting to /vehicles');
        router.push('/vehicles');
        return;
    }

    const fetchInitialData = async () => {
        setLoading(true);
        setError('');

        try {
            console.log('DEBUG: Starting fetchInitialData for vehicleId:', vehicleId);

            const { data: vehicleData, error: vehicleError } = await supabase
                .from('xe')
                .select('*')
                .eq('id', vehicleId)
                .single();

            if (vehicleError) {
                console.error('DEBUG: Vehicle fetch error:', vehicleError);
                throw new Error('Không tìm thấy xe hoặc có lỗi khi tải thông tin xe: ' + vehicleError.message);
            }
            
            console.log('DEBUG: Vehicle data fetched successfully:', vehicleData);
            setVehicle({
                ...vehicleData,
                price: Number(vehicleData.price) || 0,
                deposit: Number(vehicleData.deposit) || 0,
                rating: Number(vehicleData.rating) || 0,
                range_km: Number(vehicleData.range_km) || 0,
                top_speed_kmh: Number(vehicleData.top_speed_kmh) || 0,
                weight_kg: Number(vehicleData.weight_kg) || 0,
                so_km_da_di: Number(vehicleData.so_km_da_di) || 0,
                pin_phan_tram: Number(vehicleData.pin_phan_tram) || 0,
            });

            // --- Bắt đầu tải danh sách trạm ---
            // Bước 1: Lấy ID các trạm liên quan đến XE (danh sách cho trạm NHẬN)
            const { data: associatedTrams, error: assocError } = await supabase
                .from('tram_xe')
                .select('tram_id')
                .eq('xe_id', vehicleId);

            if (assocError) {
                console.error('DEBUG: Associated trams fetch error:', assocError);
                throw new Error('Lỗi khi tìm các trạm liên kết: ' + assocError.message);
            }

            const tramIds = associatedTrams.map(a => a.tram_id);

            if (tramIds.length === 0) {
                setVehicleTramList([]);
                setError('Xe này hiện không được gán cho bất kỳ trạm nào.');
            } else {
                const { data: activeVehicleTrams, error: tramsError } = await supabase
                    .from('tram')
                    .select('id, ten, dia_chi, trang_thai')
                    .in('id', tramIds)
                    .eq('trang_thai', 'hoat_dong');

                if (tramsError) {
                    console.error('DEBUG: Active trams fetch error:', tramsError);
                    throw new Error('Lỗi khi tải chi tiết các trạm: ' + tramsError.message);
                }
                
                if (activeVehicleTrams.length === 0) {
                    setError('Xe này hiện không có sẵn tại bất kỳ trạm nào đang hoạt động.');
                    setVehicleTramList([]);
                } else {
                    setVehicleTramList(activeVehicleTrams);
                }
            }

            // Bước 2: Lấy TOÀN BỘ các trạm đang hoạt động (danh sách cho trạm TRẢ)
            console.log('DEBUG: Fetching ALL active trams from "tram" table');
            const { data: allActiveTrams, error: allTramsError } = await supabase
                .from('tram')
                .select('id, ten, dia_chi')
                .eq('trang_thai', 'hoat_dong');

            if (allTramsError) {
                throw new Error('Lỗi khi tải danh sách tất cả các trạm: ' + allTramsError.message);
            }
            
            console.log('DEBUG: All active trams data:', allActiveTrams);
            setAllTramList(allActiveTrams);

        } catch (err) {
            console.error('DEBUG: Full error in fetchInitialData:', err.message, err.stack);
            setError(err.message);
            setVehicle(null);
            setVehicleTramList([]);
            setAllTramList([]);
        } finally {
            console.log('DEBUG: fetchInitialData completed, setting loading to false');
            setLoading(false);
        }
    };

    fetchInitialData();
  }, [vehicleId, router]);

  const checkAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('Lỗi lấy session:', sessionError.message);
        setIsLoggedIn(false);
        setIsVerified(false);
        return;
      }

      if (!session?.user) {
        setIsLoggedIn(false);
        setIsVerified(false);
        return;
      }

      setIsLoggedIn(true);
      const { data, error } = await supabase
        .from('nguoi_dung')
        .select('ho_ten, email, sdt, trang_thai')
        .eq('id', session.user.id)
        .single();

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
        console.log('User verified status:', verified);
      } else {
        setIsVerified(false);
      }
    } catch (err) {
      console.error('Lỗi kiểm tra đăng nhập:', err);
      setIsLoggedIn(false);
      setIsVerified(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, 'Session:', session);
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoggedIn(true);
        checkAuth();
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

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

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

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const donThueId = searchParams.get('donThueId');
    const totalFromParams = searchParams.get('total');

    if (status && donThueId) {
      console.log('VNPay callback - Status:', status, 'donThueId:', donThueId, 'Total:', totalFromParams);
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
      setReturnTramId(pickupTramId);
    }
  }, [pickupTramId, sameLocation]);

  useEffect(() => {
    if (isVerified && (currentStep === 3 || currentStep === 4)) {
      console.log('Bỏ qua bước', currentStep, 'vì đã verified (ACTIVE)');
      setCurrentStep(5);
    }
  }, [isVerified, currentStep]);

  const nextStep = async () => {
    console.log('nextStep - Bước hiện tại:', currentStep, 'Đã đăng nhập:', isLoggedIn, 'Đã verified:', isVerified);
    if (currentStep === 1) {
      if (!isValidDuration()) {
        setError('Thời gian thuê phải ít nhất 2 giờ.');
        return;
      }
      setError('');
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!pickupTramId || (!sameLocation && !returnTramId)) {
        setError('Vui lòng chọn trạm nhận và trả xe.');
        return;
      }
      setError('');
      if (isVerified) {
        console.log('Nhảy từ bước 2 sang bước 5 vì đã verified (ACTIVE)');
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
    console.log('submitBooking - Input:', {
      isLoggedIn,
      isVerified,
      pickupTramId,
      returnTramId,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      vehicleId,
      selectedPayment,
    });

    try {
      if (!pickupDate || !returnDate || !pickupTime || !returnTime) {
        throw new Error('Thiếu thời gian nhận/trả xe.');
      }
      if (!pickupTramId || (!sameLocation && !returnTramId)) {
        throw new Error('Thiếu trạm nhận/trả xe.');
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      let nguoi_dung_id = session?.user?.id;

      if (!session?.user) {
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
        console.log('Tìm thấy người dùng, ID:', session.user.id);
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

      if (!isVerified && uploads.frontID && uploads.backID && uploads.gplx) {
        const { error: verifyError } = await supabase
          .from('nguoi_dung')
          .update({ trang_thai: 'ACTIVE' })
          .eq('id', nguoi_dung_id);
        if (verifyError) throw new Error('Lỗi cập nhật trạng thái verified: ' + verifyError.message);
        setIsVerified(true);
      }

      const batDauLuc = new Date(`${pickupDate}T${pickupTime}:00Z`);
      const ketThucLuc = new Date(`${returnDate}T${returnTime}:00Z`);

      const { data: busyXeData, error: busyXeError } = await supabase
        .from('don_thue')
        .select('xe_id')
        .in('trang_thai', ['PENDING', 'CONFIRMED', 'IN_PROGRESS'])
        .lt('bat_dau_luc', ketThucLuc.toISOString())
        .gt('ket_thuc_luc', batDauLuc.toISOString());

      if (busyXeError) {
        console.error('Lỗi lấy danh sách xe bận:', busyXeError);
        throw new Error('Lỗi kiểm tra xe khả dụng');
      }

      const busyXeIds = busyXeData.map(row => row.xe_id);

      let query = supabase
        .from('xe')
        .select('id')
        .eq('trang_thai', 'AVAILABLE')
        .eq('id', vehicleId);

      if (busyXeIds.length > 0) {
        query = query.not('id', 'in', `(${busyXeIds.join(',')})`);
      }

      const { data: availableXe, error: xeError } = await query
        .limit(1)
        .single();

      if (xeError || !availableXe) {
        console.error('Lỗi tìm xe khả dụng:', xeError?.message || 'Xe không còn khả dụng');
        throw new Error('Xe không còn khả dụng tại thời gian này. Vui lòng chọn xe khác.');
      }

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
          bat_dau_luc: batDauLuc.toISOString(),
          ket_thuc_luc: ketThucLuc.toISOString(),
          trang_thai: 'PENDING',
          so_tien_coc: total * 0.5,
          chi_phi_uoc_tinh: total,
          tram_thue_id: pickupTramId,
          tram_tra_id: returnTramId,
        })
        .select('id')
        .single();
      if (bookingError) {
        console.error('Lỗi tạo đơn thuê:', bookingError);
        throw new Error('Lỗi tạo đơn thuê: ' + bookingError.message);
      }

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
          thanh_toan_luc: new Date().toISOString(),
        });
      if (paymentError) {
        console.error('Lỗi tạo thanh toán:', paymentError);
        throw new Error('Lỗi tạo thanh toán: ' + paymentError.message);
      }

      if (selectedPayment === 'vnpay') {
        const headers = {
          'Content-Type': 'application/json',
        };

        console.log('Khởi tạo thanh toán VNPay cho donThueId:', booking.id);

        const response = await fetch(
          `http://localhost:8080/api/pay/vnpay/initiate?donThueId=${booking.id}&test=true`,
          { method: 'POST', headers }
        );

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

      const { error: confirmError } = await supabase
        .from('don_thue')
        .update({ trang_thai: 'CONFIRMED' })
        .eq('id', booking.id);
      if (confirmError) {
        console.error('Lỗi xác nhận đơn:', confirmError);
        throw new Error('Lỗi xác nhận đơn: ' + confirmError.message);
      }

      setBookingId(booking.id.slice(-8).toUpperCase());
      setBookingSuccess(true);
      setPaymentStatus('SUCCESS');
      setPaymentMessage('Thanh toán hoàn tất!');
      setCurrentStep(6);
      if (status === 'SUCCESS') {
        const fetchXeStatus = async () => {
          const { data } = await supabase.from('xe').select('trang_thai').eq('id', vehicleId).single();
          if (data.trang_thai === 'UNAVAILABLE') {
            console.log('Xe is now UNAVAILABLE after payment');
          }
        };
        fetchXeStatus();
      }
    } catch (err) {
      console.error('🔥 Lỗi đặt xe chi tiết:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        originalError: err,
      });
      if (err.message.includes('Số điện thoại đã tồn tại')) {
        setError('Số điện thoại đã được sử dụng. Vui lòng <a href="/login" className="underline">đăng nhập</a> hoặc dùng số khác.');
      } else if (err.message.includes('Xe không còn khả dụng')) {
        setError('Xe không còn khả dụng tại thời gian này. Vui lòng chọn xe khác.');
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
        console.log('Quay lại bước 2 từ bước 5 vì đã verified (ACTIVE)');
        setCurrentStep(2);
      } else {
        setCurrentStep(prev => prev - 1);
      }
      setError('');
    }
  };

  const renderStep = () => {
    console.log('Render bước:', currentStep, 'Đã đăng nhập:', isLoggedIn, 'Đã verified:', isVerified);
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
            pickupTramId={pickupTramId}
            setPickupTramId={setPickupTramId}
            returnTramId={returnTramId}
            setReturnTramId={setReturnTramId}
            sameLocation={sameLocation}
            setSameLocation={setSameLocation}
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            vehicleTramList={vehicleTramList}
            allTramList={allTramList}
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