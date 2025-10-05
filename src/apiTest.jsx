import React, { useState, useEffect } from 'react';

// Flaskサーバーが動いているURLを指定
// ローカル開発環境では通常 http://localhost:5000 です
const API_URL = 'http://localhost:5000/api/message';

function ApiTest() {
  // 1. APIから取得したメッセージを保持するstate
  const [message, setMessage] = useState('Loading...');
  // 2. データ取得中の状態を保持するstate
  const [isLoading, setIsLoading] = useState(true);
  // 3. エラーメッセージを保持するstate
  const [error, setError] = useState(null);

  useEffect(() => {
    // データをフェッチする非同期関数
    const fetchMessage = async () => {
      try {
        // ① APIへリクエストを送信
        const response = await fetch(API_URL);

        // HTTPステータスコードが200番台以外ならエラーを投げる
        if (!response.ok) {
          throw new Error(`HTTPエラー！ステータス: ${response.status}`);
        }

        // ② JSONデータをパース
        const data = await response.json();
        
        // ③ stateを更新
        setMessage(data.message);
        setError(null); // 成功したらエラーをクリア
        
      } catch (err) {
        // ネットワークエラーやJSONパースエラーが発生した場合
        console.error('API通信エラー:', err);
        setError(`通信に失敗しました: ${err.message}. Flaskサーバーがポート5000で起動しているか確認してください。`);
        setMessage('エラー');
      } finally {
        // データの取得が完了したのでローディングを終了
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, []); // 空の依存配列[]により、コンポーネントのマウント時に一度だけ実行される

  // 画面に表示する内容
  if (isLoading) {
    return <div>APIからデータを取得中...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', border: '1px solid red', padding: '10px' }}>エラー: {error}</div>;
  }

  return (
    <div>
      <h2>Flask APIからのメッセージ</h2>
      <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'green' }}>
        {message} 
      </p>
      <p>ステータスは成功です。</p>
    </div>
  );
}

export default ApiTest;