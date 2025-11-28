"use client";

import dynamic from 'next/dynamic';

// Import cái file cũ (vừa đổi tên) với chế độ ssr: false
// ssr: false nghĩa là: "Cấm Server đụng vào file này, chỉ chạy ở Browser thôi"
const TripMapComponent = dynamic(() => import('./TripMapComponent'), {
  ssr: false, 
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent mx-auto"></div>
        <p className="mt-2 text-gray-500 font-medium">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
});

export default function Page() {
  return <TripMapComponent />;
}