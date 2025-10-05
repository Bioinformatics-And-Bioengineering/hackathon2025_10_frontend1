import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// リポジトリ名をここで設定します。
// 例: https://<ユーザー名>.github.io/my-react-app/
const repoName = 'hackathon2025_10_frontend1'; // 👈 あなたのリポジトリ名に変更してください

export default defineConfig({
  plugins: [react()],
  // 【重要】GitHub PagesのベースURLを設定
  base: `/${repoName}/`, 
  
  // 必要に応じてビルド出力先も確認 (デフォルトは 'dist')
  build: {
    outDir: 'dist',
  }
});