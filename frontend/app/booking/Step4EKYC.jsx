// app/booking/Step4EKYC.jsx
import React from 'react';

const Step4EKYC = ({ uploads, setUploads, frontIDRef, backIDRef, gplxRef }) => {
  const handleUpload = (key, file) => {
    setUploads((prev) => ({ ...prev, [key]: file ? file.name : null }));
  };

  const getUploadClass = (key) => {
    const isUploaded = uploads[key];
    return `border-2 border-dashed rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer ${
      isUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300'
    }`;
  };

  const getUploadH4 = (key, defaultText) => {
    return uploads[key] ? 'Đã tải lên' : defaultText;
  };

  const getUploadP = (key, defaultText) => {
    return uploads[key] ? uploads[key] : defaultText;
  };

  const getUploadSvgClass = (key) => {
    return uploads[key] ? 'text-green-500' : 'text-gray-400';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Xác thực danh tính (eKYC)</h2>
      
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chụp ảnh CMND/CCCD</h3>
          <p className="text-gray-600 mb-6">Vui lòng chụp ảnh mặt trước và mặt sau của CMND/CCCD</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div 
            className={getUploadClass('frontID')}
            onClick={() => frontIDRef.current.click()}
          >
            <svg className={`w-12 h-12 mx-auto mb-4 ${getUploadSvgClass('frontID')}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
            </svg>
            <h4 className="font-medium text-gray-900 mb-2">{getUploadH4('frontID', 'Mặt trước CMND/CCCD')}</h4>
            <p className="text-sm text-gray-500">{getUploadP('frontID', 'Nhấn để chụp ảnh')}</p>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={frontIDRef} 
            className="hidden" 
            onChange={(e) => handleUpload('frontID', e.target.files[0])} 
          />

          <div 
            className={getUploadClass('backID')}
            onClick={() => backIDRef.current.click()}
          >
            <svg className={`w-12 h-12 mx-auto mb-4 ${getUploadSvgClass('backID')}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
            </svg>
            <h4 className="font-medium text-gray-900 mb-2">{getUploadH4('backID', 'Mặt sau CMND/CCCD')}</h4>
            <p className="text-sm text-gray-500">{getUploadP('backID', 'Nhấn để chụp ảnh')}</p>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={backIDRef} 
            className="hidden" 
            onChange={(e) => handleUpload('backID', e.target.files[0])} 
          />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chụp ảnh GPLX</h3>
          <p className="text-gray-600 mb-6">Chụp ảnh mặt trước của Giấy phép lái xe</p>
          
          <div 
            className={`${getUploadClass('gplx')} max-w-md mx-auto`}
            onClick={() => gplxRef.current.click()}
          >
            <svg className={`w-12 h-12 mx-auto mb-4 ${getUploadSvgClass('gplx')}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
            </svg>
            <h4 className="font-medium text-gray-900 mb-2">{getUploadH4('gplx', 'Mặt trước GPLX')}</h4>
            <p className="text-sm text-gray-500">{getUploadP('gplx', 'Nhấn để chụp ảnh')}</p>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={gplxRef} 
            className="hidden" 
            onChange={(e) => handleUpload('gplx', e.target.files[0])} 
          />
        </div>

        <div className="p-4 bg-green-50 rounded-xl">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <div>
              <p className="text-sm text-green-800 font-medium">Hướng dẫn chụp ảnh:</p>
              <ul className="text-sm text-green-700 mt-1 space-y-1">
                <li>• Đảm bảo ảnh rõ nét, không bị mờ</li>
                <li>• Chụp trong điều kiện ánh sáng tốt</li>
                <li>• Không che khuất thông tin trên giấy tờ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4EKYC;