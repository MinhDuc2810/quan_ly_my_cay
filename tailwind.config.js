/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#DC2626', // đỏ cay
        secondary: '#F97316', // cam nóng
        accent: '#FACC15', // vàng mì
        background: '#fcfaf2', // nền kem giấy ấm
        sidebar: '#111827', // nền sidebar
        "text-main": '#111827', // text chính
        "text-muted": '#6B7280', // text phụ
        border: '#E5E7EB', // viền
        success: '#22C55E', // trạng thái thành công
        warning: '#F59E0B', // trạng thái cảnh báo
        error: '#EF4444', // trạng thái lỗi
      }
    },
  },
  plugins: [],
}
