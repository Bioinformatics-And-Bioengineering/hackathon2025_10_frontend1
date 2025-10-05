/** @type {import('tailwindcss').Config} */
export default {
  // content: Tailwindがスキャンするファイルパスを指定
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // srcフォルダ以下の全てのJS/TS/JSX/TSXファイルを対象にする
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
