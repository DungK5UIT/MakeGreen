import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const getCircleClass = (i) => {
    if (i < currentStep) return 'w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium';
    if (i === currentStep) return 'w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium';
    return 'w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium';
  };

  const getCircleContent = (i) => (i < currentStep ? '✓' : i);

  const getTextClass = (i) => {
    if (i < currentStep) return 'ml-2 text-sm font-medium text-green-600';
    if (i === currentStep) return 'ml-2 text-sm font-medium text-primary';
    return 'ml-2 text-sm font-medium text-gray-500';
  };

  const steps = [
    { id: 1, label: 'Thời gian' },
    { id: 2, label: 'Địa điểm' },
    { id: 3, label: 'Thông tin' },
    { id: 4, label: 'eKYC' },
    { id: 5, label: 'Thanh toán' },
    { id: 6, label: 'Xác nhận' },
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div className={getCircleClass(step.id)}>{getCircleContent(step.id)}</div>
              <span className={getTextClass(step.id)}>{step.label}</span>
            </div>
            {index < steps.length - 1 && <div className="w-8 h-px bg-gray-300"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;