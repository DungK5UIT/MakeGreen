import React from 'react';

const Step1Time = ({ pickupDate, setPickupDate, pickupTime, setPickupTime, returnDate, setReturnDate, returnTime, setReturnTime, isValidDuration, bookedPeriods }) => {
  const today = new Date().toISOString().split('T')[0]; // Định dạng YYYY-MM-DD cho ngày hiện tại

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Chọn thời gian thuê xe</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày nhận xe</label>
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            min={today} // Không cho chọn ngày trước hiện tại
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giờ nhận xe</label>
          <select
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {Array.from({ length: 11 }, (_, i) => {
              const hour = 8 + i;
              const time = `${hour}:00`;
              return <option key={time} value={time}>{time}</option>;
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày trả xe</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={pickupDate || today} // Không cho chọn ngày trước ngày nhận xe hoặc hiện tại
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giờ trả xe</label>
          <select
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {Array.from({ length: 11 }, (_, i) => {
              const hour = 8 + i;
              const time = `${hour}:00`;
              return <option key={time} value={time}>{time}</option>;
            })}
          </select>
        </div>
      </div>
      <div className={`mt-6 p-4 rounded-xl ${isValidDuration ? 'bg-blue-50' : 'bg-red-50'}`}>
        <div className="flex items-center">
          {isValidDuration ? (
            <>
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <span className="text-sm text-blue-800">Thời gian thuê tối thiểu: 2 giờ</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-800">Thời gian thuê phải ít nhất 2 giờ.</span>
            </>
          )}
        </div>
      </div>
      {bookedPeriods.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Thời gian xe đã được thuê:</h3>
          <ul className="list-disc pl-5 text-sm text-yellow-700">
            {bookedPeriods.map((period, index) => (
              <li key={index}>
                Từ {period.start.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })} đến {period.end.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-yellow-600">Vui lòng chọn thời gian không trùng với các khoảng trên.</p>
        </div>
      )}
    </div>
  );
};

export default Step1Time;