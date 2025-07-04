/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Noto Sans KR',
          'sans-serif',
        ],
      },
      colors: {
        background: '#eeeeef', // 매우 연한 그레이
        primary: '#2563eb', // 파랑
        secondary: '#f97316', // 주황
        success: '#22c55e', // 연두
        warning: '#facc15', // 노랑
        error: '#ef4444', // 빨강
        info: '#6366f1', // 보라
      },
    },
  },
}; 