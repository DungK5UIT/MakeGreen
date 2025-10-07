import React from 'react';

const Step2Location = ({
  pickupTramId,
  setPickupTramId,
  returnTramId,
  setReturnTramId,
  sameLocation,
  setSameLocation,
  selectedPreset,
  setSelectedPreset,
  vehicleTramList,
  allTramList,
}) => {
  const handleSameChange = (e) => {
    setSameLocation(e.target.checked);
    if (e.target.checked) {
      setReturnTramId(pickupTramId);
    }
  };

  const handlePickupChange = (e) => {
    const tramId = e.target.value;
    setPickupTramId(tramId);
    setSelectedPreset(tramId);
    if (sameLocation) {
      setReturnTramId(tramId);
    }
    // Nếu trạm trả đang trùng với trạm nhận cũ, reset nó
    if (returnTramId === tramId) {
      setReturnTramId('');
    }
  };

  const handleReturnChange = (e) => {
    if (!sameLocation) {
      setReturnTramId(e.target.value);
    }
  };

  const handlePresetClick = (tramId) => {
    setPickupTramId(tramId);
    setSelectedPreset(tramId);
    if (sameLocation) {
      setReturnTramId(tramId);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Chọn trạm nhận và trả xe</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trạm nhận xe</label>
          <div className="relative">
            <select
              value={pickupTramId || ''}
              onChange={handlePickupChange}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="" disabled>
                Chọn trạm nhận xe
              </option>
              {vehicleTramList.map((tram) => (
                <option key={tram.id} value={tram.id}>
                  {tram.ten} - {tram.dia_chi}
                </option>
              ))}
            </select>
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>
       
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trạm trả xe</label>
          <div className="relative">
            <select
              value={returnTramId || ''}
              onChange={handleReturnChange}
              disabled={sameLocation || !pickupTramId}
              className={`w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                sameLocation || !pickupTramId ? 'bg-gray-100' : ''
              }`}
            >
              <option value="" disabled>
                {pickupTramId ? 'Chọn trạm trả xe' : 'Vui lòng chọn trạm nhận xe trước'}
              </option>
              {/* ✨ SỬA: Lọc danh sách trạm trả để loại bỏ trạm đã chọn làm điểm nhận */}
              {allTramList
                .filter(tram => tram.id !== pickupTramId)
                .map((tram) => (
                  <option key={tram.id} value={tram.id}>
                    {tram.ten} - {tram.dia_chi}
                  </option>
              ))}
            </select>
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="same-location"
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            checked={sameLocation}
            onChange={handleSameChange}
            disabled={!pickupTramId}
          />
          <label htmlFor="same-location" className="ml-2 text-sm text-gray-700">
            Trả xe tại cùng trạm nhận xe
          </label>
        </div>
      </div>
    </div>
  );
};

export default Step2Location;