import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import React, { useState, useEffect } from 'react';
// アイコンを使う場合は、ここでインポート（例: lucide-reactから）
// import { Zap } from 'lucide-react'; 

// FlaskサーバーのURL（ポート5000）
const API_URL = 'http://localhost:5000/api/message';

// Tailwind CSSクラスを直接使用（Viteプロジェクトの一般的な設定）

const App = () => {
  // カウンターの状態管理
  const [count, setCount] = useState(0);
  // APIメッセージの状態管理
  const [apiMessage, setApiMessage] = useState('APIからのメッセージを待機中...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // コンポーネントがマウントされた後にAPIを呼び出す
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTPエラー: ${response.status}。サーバーが起動しているか確認してください。`);
        }

        const data = await response.json();
        setApiMessage(data.message);
        setError(null);
      } catch (err) {
        console.error("API通信エラー:", err);
        // エラーが発生した場合、メッセージを表示し、エラー状態を記録
        setError(`接続エラー: ${err.message}. Flaskサーバーがポート5000で起動しているか確認してください。`);
        setApiMessage('APIに接続できませんでした。');
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, []); // []でマウント時のみ実行

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8 space-y-8">
        
        <h1 className="text-3xl font-extrabold text-gray-800 text-center border-b-2 pb-4">
          ハッカソン フロントエンドテストアプリ (Vite + React)
        </h1>
        
        {/* API通信結果表示エリア */}
        <div className="p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg">
          <h2 className="text-xl font-semibold text-indigo-800 mb-2">
            Flask バックエンド連携テスト
          </h2>
          {loading && (
            <p className="text-indigo-600 animate-pulse">📡 サーバー接続中...</p>
          )}
          {error && (
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          )}
          {!loading && !error && (
            <p className="text-lg font-bold text-gray-700">
              メッセージ: <span className="text-indigo-700">{apiMessage}</span>
            </p>
          )}
        </div>

        {/* カウンター機能エリア */}
        <div className="flex flex-col items-center space-y-4 pt-4 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            カウンターステータス
          </h2>
          <p className="text-6xl font-black text-blue-600">
            {count}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setCount(c => c + 1)}
              className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition duration-150 transform hover:scale-105"
            >
              カウントアップ
            </button>
            <button
              onClick={() => setCount(0)}
              className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-600 transition duration-150 transform hover:scale-105"
            >
              リセット
            </button>
          </div>
        </div>

      </div>
      
      <p className="mt-6 text-sm text-gray-500">
        このファイルを編集して、開発を始めましょう！
      </p>
    </div>
  );
};

export default App;
