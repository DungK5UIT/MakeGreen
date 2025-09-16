import React from 'react';

const Step2Location = ({
  pickupLocation, setPickupLocation,
  returnLocation, setReturnLocation,
  sameLocation, setSameLocation,
  selectedPreset, setSelectedPreset,
  locations
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
        {locations && (
          <div className="grid grid-cols-3 gap-2">
            {locations.map(loc => (
              <button
                key={loc}
                onClick={() => handlePresetClick(loc)}
                className={`p-2 rounded-lg border ${selectedPreset === loc ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
              >
                {loc}
              </button>
            ))}
          </div>
        )}
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
      </div>
    </div>
  );
};

export default Step2Location;