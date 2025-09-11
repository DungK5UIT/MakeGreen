# MakeGreen – Next.js + Tailwind (App Router)

Dự án demo front-end cho website **MakeGreen** (thuê xe điện), chuyển đổi từ file HTML một trang sang Next.js đa trang.

## Chạy dự án

```bash
# 1) Cài deps
npm install

# 2) Chạy dev
npm run dev

# 3) Build production
npm run build && npm start
```

## Công nghệ
- Next.js 14 (App Router)
- React 18
- Tailwind CSS 3

## Cấu trúc chính

```
app/
  page.jsx               # Trang chủ
  vehicles/page.jsx      # Danh sách xe
  vehicles/[slug]/page.jsx  # Chi tiết xe động
  booking/page.jsx       # Quy trình đặt xe (stepper)
  account/page.jsx       # Tài khoản: hồ sơ/eKYC, chuyến đi...
  news/page.jsx          # Tin tức & cẩm nang
  support/page.jsx       # Hỗ trợ & FAQ
components/
  Header.jsx, Footer.jsx, VehicleCard.jsx
data/
  vehicles.js            # Dữ liệu xe mẫu
```

> Đây là demo UI tĩnh (chưa có backend). Bạn có thể cắm API thật (eKYC, thanh toán VNPay/MoMo, bản đồ) vào các trang tương ứng.
