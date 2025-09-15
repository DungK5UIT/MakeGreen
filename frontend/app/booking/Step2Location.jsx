// app/booking/Step2Location.jsx
import React from 'react';

const Step2Location = ({
  pickupLocation, setPickupLocation,
  returnLocation, setReturnLocation,
  sameLocation, setSameLocation,
  selectedPreset, setSelectedPreset,
}) => {
  const handleSameChange = (e) => {
    setSameLocation(e.target.checked);
    if (e.target.checked) {
      setReturnLocation(pickupLocation);
    }
  };

  const handlePickupChange = (e) => {
    setPickupLocation(e.target.value);
  };

  const handleReturnChange = (e) => {
    if (!sameLocation) {
      setReturnLocation(e.target.value);
    }
  };

  const handlePresetClick = (name) => {
    setPickupLocation(name);
    setSelectedPreset(name);
    if (sameLocation) {
      setReturnLocation(name);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Chọn địa điểm nhận và trả xe</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm nhận xe</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Nhập địa chỉ nhận xe" 
              value={pickupLocation}
              onChange={handlePickupChange}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm trả xe</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Nhập địa chỉ trả xe" 
              value={returnLocation}
              onChange={handleReturnChange}
              disabled={sameLocation}
              className={`w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${sameLocation ? 'bg-gray-100' : ''}`}
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
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
          />
          <label htmlFor="same-location" className="ml-2 text-sm text-gray-700">Trả xe tại cùng địa điểm nhận xe</label>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div 
            className={`p-4 border rounded-xl hover:border-primary cursor-pointer transition-colors ${selectedPreset === 'Sân bay Nội Bài' ? 'border-primary bg-blue-50' : 'border-gray-200'}`} 
            onClick={() => handlePresetClick('Sân bay Nội Bài')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Sân bay Nội Bài</h3>
              <p className="text-sm text-gray-500">Miễn phí giao nhận</p>
            </div>
          </div>
          <div 
            className={`p-4 border rounded-xl hover:border-primary cursor-pointer transition-colors ${selectedPreset === 'Ga Hà Nội' ? 'border-primary bg-blue-50' : 'border-gray-200'}`} 
            onClick={() => handlePresetClick('Ga Hà Nội')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Ga Hà Nội</h3>
              <p className="text-sm text-gray-500">Phí giao nhận: 50k</p>
            </div>
          </div>
          <div 
            className={`p-4 border rounded-xl hover:border-primary cursor-pointer transition-colors ${selectedPreset === 'Trung tâm TP' ? 'border-primary bg-blue-50' : 'border-gray-200'}`} 
            onClick={() => handlePresetClick('Trung tâm TP')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Trung tâm TP</h3>
              <p className="text-sm text-gray-500">Phí giao nhận: 30k</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Location;