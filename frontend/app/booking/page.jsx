'use client';

import React, { useState, useRef, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import Step1Time from './Step1Time';
import Step2Location from './Step2Location';
import Step3Info from './Step3Info';
import Step4EKYC from './Step4EKYC';
import Step5Payment from './Step5Payment';
import Step6Confirmation from './Step6Confirmation';

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  // State cho Step 1
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('08:00');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('12:00');

  // State cho Step 2
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [sameLocation, setSameLocation] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // State cho Step 4
  const [uploads, setUploads] = useState({
    frontID: null,
    backID: null,
    gplx: null,
  });

  const frontIDRef = useRef(null);
  const backIDRef = useRef(null);
  const gplxRef = useRef(null);

  // Hàm chuyển đổi thành đối tượng Date
  const getDateFromInputs = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(dateStr);
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return date;
  };

  // Tính khoảng thời gian giữa nhận và trả xe
  const isValidDuration = () => {
    const pickupDateTime = getDateFromInputs(pickupDate, pickupTime);
    const returnDateTime = getDateFromInputs(returnDate, returnTime);

    if (!pickupDateTime || !returnDateTime) return false; // Chưa điền đủ thì báo lỗi

    const diffInMs = returnDateTime - pickupDateTime;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return diffInHours >= 2;
  };

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(localStorage.getItem("mg_auth") === "1");
    };

    window.addEventListener("mg-auth-changed", handleAuthChange);
    handleAuthChange(); // initial check

    return () => window.removeEventListener("mg-auth-changed", handleAuthChange);
  }, []);

  useEffect(() => {
    if (sameLocation) {
      setReturnLocation(pickupLocation);
    }
  }, [pickupLocation, sameLocation]);

  const nextStep = () => {
    if (currentStep === 1) {
      if (!isValidDuration()) {
        setError('Thời gian thuê phải ít nhất 2 giờ.');
        return;
      }
      setError('');
    }

    if (currentStep < totalSteps) {
      if (currentStep === 2 && isLoggedIn) {
        setCurrentStep(5);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
      // TODO: Ở đây có thể gửi data lên backend trước khi next
      // Ví dụ: if (currentStep === 1) { await submitStep1Data(); }
    } else {
      alert('Đặt xe thành công! Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      if (currentStep === 5 && isLoggedIn) {
        setCurrentStep(2);
      } else {
        setCurrentStep((prev) => prev - 1);
      }
      setError('');
    }
  };

  const renderStep = () => {
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
          />
        );
      case 3:
        return <Step3Info />;
      case 4:
        return (
          <Step4EKYC
            uploads={uploads}
            setUploads={setUploads}
            frontIDRef={frontIDRef}
            backIDRef={backIDRef}
            gplxRef={gplxRef}
          />
        );
      case 5:
        return <Step5Payment />;
      case 6:
        return <Step6Confirmation />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Đặt Xe</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} isLoggedIn={isLoggedIn} />

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {renderStep()}

          <div className="flex justify-between mt-8">
            <button
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              style={{ display: currentStep === 1 ? 'none' : 'block' }}
              onClick={prevStep}
            >
              Quay lại
            </button>
            <button
              className={`px-8 py-3 text-white rounded-xl font-medium transition-colors ${
                currentStep === totalSteps ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary-hover'
              }`}
              onClick={nextStep}
            >
              {currentStep === totalSteps ? 'Hoàn thành' : 'Tiếp tục'}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;