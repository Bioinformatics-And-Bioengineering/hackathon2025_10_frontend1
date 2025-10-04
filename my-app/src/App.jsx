import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Target, DollarSign, Calendar, RefreshCw, Loader2, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';

// =================================================================
// 1. 環境変数と定数の設定
// =================================================================
// グローバル変数からFirebase設定を取得（Canvas環境用）
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// APIエンドポイント (Imagen 3.0)
const IMAGE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=";
const API_KEY = ""; // Canvas環境では自動で付与されるため空のまま

// ユーザーデータが保存されるFirestoreパス
const getDocPath = (db, userId) => doc(db, 'artifacts', appId, 'users', userId, 'financial_fitness', 'profile');

// =================================================================
// 2. カレンダーコンポーネント
// =================================================================

/**
 * 記入済みの実績を表示するカレンダーコンポーネント
 * @param {string} lastEntryDate - 最後に記入した日付 'YYYY-MM-DD'
 * @param {number} consecutiveDays - 継続日数
 */
const MonthlyCalendar = ({ lastEntryDate, consecutiveDays }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  // その月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0:日, 1:月, ... 6:土

  const daysInMonth = Array.from({ length: lastDateOfMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => null);
  const calendarDays = [...paddingDays, ...daysInMonth];

  const todayString = today.toISOString().split('T')[0];
  
  // 継続ハイライト用の計算
  const isContinuousDay = (day) => {
    // 最後に記入した日付を取得
    if (!lastEntryDate) return false;
    
    // 現在カレンダーが表示している日付の文字列
    const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // 最後に記入した日から遡って継続日数の範囲内であればハイライト
    const lastEntryTime = new Date(lastEntryDate).getTime();
    const currentTime = new Date(currentDateString).getTime();
    const dayDifference = Math.floor((lastEntryTime - currentTime) / (1000 * 60 * 60 * 24));
    
    // 記入日当日か、記入日から継続日数（-1日）以内に収まっていれば継続ハイライト
    if (dayDifference >= 0 && dayDifference < consecutiveDays) {
      return true;
    }

    return false;
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-xl border border-indigo-100 h-full">
      <h3 className="text-xl font-bold text-indigo-700 mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2" /> 
        {year}年 {month + 1}月 の記入状況
      </h3>
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className={day === '日' ? 'text-red-500' : day === '土' ? 'text-blue-500' : ''}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dayString === todayString;
          const isEntryDay = dayString === lastEntryDate;
          const isContinuous = isContinuousDay(day);

          return (
            <div key={index} className="aspect-square flex items-center justify-center">
              {day !== null ? (
                <div 
                  className={`w-full h-full flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                    ${isToday ? 'bg-indigo-500 text-white font-bold ring-2 ring-indigo-300' : ''}
                    ${isContinuous && !isToday ? 'bg-green-100 text-green-700 font-bold' : ''}
                    ${isEntryDay && !isToday ? 'bg-green-500 text-white font-bold shadow-lg' : ''}
                    ${!isToday && !isEntryDay && !isContinuous ? 'text-gray-700 hover:bg-gray-100' : ''}
                  `}
                  title={isEntryDay ? '最終記入日' : isContinuous ? '継続中の日' : ''}
                >
                  {day}
                </div>
              ) : (
                <div></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <div className="flex items-center"><span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>今日</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>最終記入日</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-green-100 rounded-full mr-2"></span>継続記入期間</div>
        <p className="mt-2 text-sm font-semibold text-indigo-500">継続日数: {consecutiveDays} 日</p>
      </div>
    </div>
  );
};


// =================================================================
// 3. メインアプリケーション
// =================================================================

const App = () => {
  // Firebaseの状態
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // アプリケーションの状態
  const [appState, setAppState] = useState({
    consecutiveDays: 0,
    currentBalance: 0,
    targetAmount: 50000,
    isTargetAchieved: false,
    lastEntryDate: '', // YYYY-MM-DD
    entries: [] // ログ用
  });

  // UIの状態
  const [entryType, setEntryType] = useState('income'); // 'income' or 'expense'
  const [newEntryAmount, setNewEntryAmount] = useState('');
  const [newEntryMemo, setNewEntryMemo] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [loadingImage, setLoadingImage] = useState(false);
  const [characterImageUrl, setCharacterImageUrl] = useState('');
  const [uiMessage, setUiMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // 画像再生成トリガー

  // Firebase初期化と認証
  useEffect(() => {
    try {
      if (Object.keys(firebaseConfig).length === 0) return;

      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const userAuth = getAuth(app);

      setDb(firestore);
      setAuth(userAuth);

      const unsubscribe = onAuthStateChanged(userAuth, async (user) => {
        if (!user) {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(userAuth, initialAuthToken);
            } else {
              await signInAnonymously(userAuth);
            }
          } catch (error) {
            console.error("Firebase Auth Error:", error);
          }
        }
        setUserId(userAuth.currentUser?.uid || 'anonymous');
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase initialization failed:", e);
    }
  }, []);

  // =================================================================
  // 4. 画像生成ロジック (ムキムキ度を反映)
  // =================================================================

  const generateCharacterImage = useCallback(async (days) => {
    setLoadingImage(true);
    let fitnessLevel;
    
    if (days >= 60) {
      fitnessLevel = "a god-like bodybuilder, extremely muscular, full chrome armor, epic lighting";
    } else if (days >= 30) {
      fitnessLevel = "a very muscular, toned body, in a heroic pose, dynamic shadows";
    } else if (days >= 7) {
      fitnessLevel = "a slightly defined and athletic body, standing confidently";
    } else {
      fitnessLevel = "a slim, casual person, looking determined";
    }
    
    // 目標達成度を背景のプロンプトに反映
    const environment = appState.isTargetAchieved ? 
        "in a luxurious, futuristic marble gym with gold accents" : 
        "in a simple, functional concrete gym";
    
    const prompt = `A fantasy warrior character, male, standing ${environment}, with ${fitnessLevel}, wearing simple training gear, digital art, high detail, no text, clean background. The warrior looks determined and proud.`;

    const payload = { 
        instances: [{ prompt: prompt }], 
        parameters: { "sampleCount": 1 } 
    };

    try {
      const response = await fetch(IMAGE_API_URL + API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`画像APIエラー: HTTP ${response.status}`);
      }
      
      const result = await response.json();
      const base64Data = result?.predictions?.[0]?.bytesBase64Encoded;
      
      if (base64Data) {
        setCharacterImageUrl(`data:image/png;base64,${base64Data}`);
        setUiMessage(`継続${days}日に応じた姿に進化しました！`);
      } else {
        throw new Error("画像データが応答に含まれていません。");
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      setUiMessage(`画像生成に失敗しました: ${error.message}`);
    } finally {
      setLoadingImage(false);
    }
  }, [appState.isTargetAchieved]); // isTargetAchievedが変わるとプロンプトが変わるため依存に追加

  // =================================================================
  // 5. データフェッチと同期 (onSnapshot)
  // =================================================================
  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;

    setLoadingData(true);
    const docRef = getDocPath(db, userId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      let data = {
        consecutiveDays: 0,
        currentBalance: 0,
        targetAmount: 50000,
        isTargetAchieved: false,
        lastEntryDate: '',
        entries: []
      };

      if (docSnap.exists()) {
        data = docSnap.data();
      }

      setAppState(data);
      setLoadingData(false);

      // データのロードまたは更新時、画像がないか更新トリガーがあれば生成
      if (!characterImageUrl || refreshKey > 0) {
        generateCharacterImage(data.consecutiveDays);
        if (refreshKey > 0) setRefreshKey(0); // トリガー解除
      }
    }, (error) => {
      console.error("Firestore Snapshot Error:", error);
      setLoadingData(false);
    });

    return () => unsubscribe();
  }, [isAuthReady, db, userId, characterImageUrl, generateCharacterImage, refreshKey]);

  // =================================================================
  // 6. 家計簿記入と状態更新ロジック
  // =================================================================

  const handleNewEntry = async () => {
    const amountValue = parseInt(newEntryAmount, 10);
    const memo = newEntryMemo.trim();
    const amount = entryType === 'income' ? amountValue : -amountValue;

    if (isNaN(amountValue) || amountValue <= 0 || !memo) {
      setUiMessage('金額は正の数、メモは必須です。');
      return;
    }

    setUiMessage('記入中...');

    const today = new Date().toISOString().split('T')[0];
    let newConsecutiveDays = appState.consecutiveDays;
    let newLastEntryDate = appState.lastEntryDate;
    let shouldRegenerateImage = false;

    // 継続日数の計算ロジック
    if (today !== appState.lastEntryDate) {
      const lastDate = appState.lastEntryDate ? new Date(appState.lastEntryDate) : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      if (lastDate === null || yesterdayString === appState.lastEntryDate) {
        newConsecutiveDays += 1;
      } else {
        newConsecutiveDays = 1; // 途切れた
      }
      newLastEntryDate = today;
      shouldRegenerateImage = true; // 継続日数が変わったら画像を再生成
    }

    // 残高と目標達成の更新
    const newBalance = appState.currentBalance + amount;
    const newTargetAchieved = newBalance >= appState.targetAmount;
    
    // 目標達成ステータスが変わったら画像を再生成（背景更新のため）
    if (newTargetAchieved !== appState.isTargetAchieved) {
        shouldRegenerateImage = true;
        if (newTargetAchieved) {
            setUiMessage(`目標金額${appState.targetAmount.toLocaleString()}円を達成！背景がリッチに！`);
        } else {
            // 目標から外れた場合
            setUiMessage(`残念ながら目標を下回りました。次こそ達成しましょう！`);
        }
    }

    // 新しい状態の構築
    const newState = {
      ...appState,
      consecutiveDays: newConsecutiveDays,
      currentBalance: newBalance,
      isTargetAchieved: newTargetAchieved,
      lastEntryDate: newLastEntryDate,
      entries: [...appState.entries, { date: today, amount: amount, memo: memo, type: entryType }]
    };

    try {
      // **将来のバックエンド連携を想定した処理**
      // await fetch('YOUR_BACKEND_API/save-entry', { method: 'POST', body: JSON.stringify(newState) });
      
      // 今回はFirestoreに保存
      await setDoc(getDocPath(db, userId), newState);
      setNewEntryAmount('');
      setNewEntryMemo('');
      setUiMessage(shouldRegenerateImage ? '記入と成長データを保存しました。' : '記入データを保存しました。');
      
      // 画像再生成
      if (shouldRegenerateImage) {
        setRefreshKey(prev => prev + 1); // useEffectで画像生成をトリガー
      }

    } catch (error) {
      console.error("Data Save Error:", error);
      setUiMessage(`データの保存に失敗しました: ${error.message}`);
    }
  };

  // =================================================================
  // 7. UIレンダリング
  // =================================================================

  // 背景の動的クラス
  const backgroundClass = appState.isTargetAchieved
    ? 'bg-gradient-to-br from-yellow-50 to-amber-100' // リッチな感じ
    : 'bg-gradient-to-br from-indigo-50 to-gray-100'; // 通常の背景

  if (!isAuthReady || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="ml-2 text-indigo-600">データをロード中...</p>
      </div>
    );
  }

  const progress = Math.min(1, appState.currentBalance / appState.targetAmount);
  const displayedUserId = userId ? `${userId.substring(0, 8)}...` : '未認証';

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 transition-all duration-500 ${backgroundClass}`}>
      <div className="w-full max-w-6xl bg-white bg-opacity-95 shadow-2xl rounded-3xl p-8 space-y-8 border-4 border-indigo-200">
        
        <header className="text-center pb-4 border-b border-indigo-200">
          <h1 className="text-4xl font-extrabold text-indigo-800">
            家計簿フィットネス💪
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ユーザーID: {displayedUserId} | 最後に記入した日: {appState.lastEntryDate || 'なし'}
          </p>
        </header>

        {/* メインレイアウト: カレンダー(左) + ステータス/キャラクター(右) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左側: カレンダー (1/3幅) */}
          <div className="lg:col-span-1">
            <MonthlyCalendar 
              lastEntryDate={appState.lastEntryDate} 
              consecutiveDays={appState.consecutiveDays} 
            />
          </div>

          {/* 右側: ステータスとキャラクター (2/3幅) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 右上: ステータスカード */}
            <div className="grid md:grid-cols-3 gap-4">
              <StatCard 
                icon={DollarSign} 
                title="現在の貯蓄残高" 
                value={`${appState.currentBalance.toLocaleString()} 円`} 
                color="text-blue-600"
              />
              <StatCard 
                icon={Target} 
                title="目標達成率" 
                value={`${(progress * 100).toFixed(0)} %`} 
                color={appState.isTargetAchieved ? "text-amber-600" : "text-red-500"}
              />
              <StatCard 
                icon={BookOpen} 
                title="目標金額" 
                value={`${appState.targetAmount.toLocaleString()} 円`} 
                color="text-gray-600"
              />
            </div>
            
            {/* 右下: キャラクター表示 */}
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                あなたのファイナンシャル・ウォリアー
              </h2>
              <div className="w-full md:w-3/4 h-80 border-4 border-dashed border-indigo-300 rounded-lg flex items-center justify-center overflow-hidden relative bg-gray-50">
                {loadingImage ? (
                  <div className="flex flex-col items-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
                    <p className="mt-3 text-indigo-600 font-medium">画像を生成中...</p>
                  </div>
                ) : characterImageUrl ? (
                  <img 
                    src={characterImageUrl} 
                    alt="Financial Fitness Character" 
                    className="object-cover w-full h-full transform transition duration-500 hover:scale-105"
                    onError={() => setUiMessage("画像のロードに失敗しました。")}
                  />
                ) : (
                  <p className="text-gray-400">継続記入でキャラの姿が現れます。</p>
                )}
              </div>
              <p className="text-sm mt-3 font-medium text-indigo-500 h-6">{uiMessage}</p>
            </div>

          </div>
        </div>

        {/* 下部: 家計簿記入フォーム */}
        <div className="p-6 bg-green-50 rounded-2xl shadow-xl border border-green-200">
          <h2 className="text-2xl font-bold text-green-700 flex items-center mb-4 border-b pb-2">
            <TrendingUp className="w-6 h-6 mr-2" /> 今日の入出金（トレーニング）
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* 1. 収入/支出選択 */}
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">取引タイプ</label>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setEntryType('income')}
                        className={`flex-1 p-3 rounded-lg font-bold transition ${entryType === 'income' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        <TrendingUp className="w-4 h-4 inline mr-1" /> 収入
                    </button>
                    <button
                        onClick={() => setEntryType('expense')}
                        className={`flex-1 p-3 rounded-lg font-bold transition ${entryType === 'expense' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        <TrendingDown className="w-4 h-4 inline mr-1" /> 支出
                    </button>
                </div>
            </div>

            {/* 2. 金額入力 */}
            <div className="col-span-1">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">金額 (円)</label>
                <input
                    id="amount"
                    type="number"
                    value={newEntryAmount}
                    onChange={(e) => setNewEntryAmount(e.target.value)}
                    placeholder="例: 5000"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full"
                    min="1"
                />
            </div>

            {/* 3. メモ入力 */}
            <div className="col-span-1">
                <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                <input
                    id="memo"
                    type="text"
                    value={newEntryMemo}
                    onChange={(e) => setNewEntryMemo(e.target.value)}
                    placeholder="例: 給料日、食費"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full"
                />
            </div>

            {/* 4. 実行ボタン */}
            <div className="col-span-1">
                <button
                    onClick={handleNewEntry}
                    disabled={loadingData || loadingImage}
                    className="w-full p-3 h-full bg-indigo-500 text-white font-bold rounded-lg shadow-md hover:bg-indigo-600 transition duration-150 transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center mt-6 md:mt-0"
                >
                    {loadingData || loadingImage ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        '記入して成長！'
                    )}
                </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ステータスカードコンポーネント
const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Icon className={`w-5 h-5 mr-2 ${color}`} />
        <h3 className="text-md font-semibold text-gray-600">{title}</h3>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  </div>
);

export default App;
