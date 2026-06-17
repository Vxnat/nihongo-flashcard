import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shiba Town',
    short_name: 'Shiba Town',
    description: 'Khám phá tiếng Nhật cùng bé Shiba!',
    start_url: '/',
    display: 'standalone', // Bắt buộc là 'standalone' để ẩn thanh địa chỉ trình duyệt
    background_color: '#FDFBF7', // Màu nền lúc app đang load
    theme_color: '#FF7096', // Màu của thanh trạng thái (status bar) trên điện thoại
    orientation: 'portrait', // Khóa màn hình dọc
    icons: [
      {
        src: '/images/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}