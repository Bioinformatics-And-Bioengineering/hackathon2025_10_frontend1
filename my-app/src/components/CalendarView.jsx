import React, { useState, useMemo } from 'react';
import './CalendarView.css'; // ★追加: 外部CSSファイルをインポート

// ====================================================================
// 型定義 (TypeScriptではないですが、データの構造を明確にするために記述)
// type Transaction = {
//   id: string;
//   date: string; // "YYYY-MM-DD"形式
//   type: 'income' | 'expense';
//   amount: number;
// };
// ====================================================================

// 取引データを日付ごとの集計データに変換するヘルパー関数
const aggregateTransactions = (transactions) => {
  const aggregatedData = {};

  transactions.forEach(t => {
    // 日付をキーとして使用
    const dateKey = t.date; 

    if (!aggregatedData[dateKey]) {
      aggregatedData[dateKey] = { income: 0, expense: 0 };
    }

    if (t.type === 'income') {
      aggregatedData[dateKey].income += t.amount;
    } else if (t.type === 'expense') {
      aggregatedData[dateKey].expense += t.amount;
    }
  });

  return aggregatedData;
};

/**
 * カレンダーの日付を計算するヘルパー関数
 */
const getCalendarDays = (year, month) => {
  const date = new Date(year, month - 1, 1);
  const firstDayOfMonth = date.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const days = [];
  
  // 前月の日付でカレンダーの先頭を埋める (必要に応じて)
  // month - 1 は現在の月 (0-11)。前月は month - 2。
  // new Date(year, month - 2, day) で日付キーを生成
  const prevMonthDaysCount = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayOfMonth; i > 0; i--) {
    const dayNum = prevMonthDaysCount - i + 1;
    const prevMonthYear = month === 1 ? year - 1 : year;
    const prevMonthNum = month === 1 ? 12 : month - 1;
    days.push({ 
      day: dayNum, 
      isCurrentMonth: false,
      dateKey: `${prevMonthYear}-${String(prevMonthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    });
  }

  // 今月の日付
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ 
      day: i, 
      isCurrentMonth: true, 
      isToday: (new Date().toDateString() === new Date(year, month - 1, i).toDateString()),
      dateKey: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }

  // 翌月の日付でカレンダーの末尾を埋める
  const remainingDays = 42 - days.length; 
  // month + 1 は現在の月 (1-12)。翌月は month + 1。
  // new Date(year, month, day) で日付キーを生成
  const nextMonthYear = month === 12 ? year + 1 : year;
  const nextMonthNum = month === 12 ? 1 : month + 1;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ 
      day: i, 
      isCurrentMonth: false,
      dateKey: `${nextMonthYear}-${String(nextMonthNum).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }

  return days.slice(0, 42); 
};

/**
 * 家計簿アプリ向けカレンダーコンポーネント
 * @param {object} props 
 * @param {Array<object>} props.transactions - 取引データの配列
 * @param {function} props.onDateClick - 日付がクリックされたときに呼び出される関数
 */
const CalendarView = ({ transactions = [], onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12

  // 取引データを集計
  const aggregatedData = useMemo(() => aggregateTransactions(transactions), [transactions]);

  // カレンダーの日付を取得
  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const monthName = currentDate.toLocaleString('ja-JP', { year: 'numeric', month: 'long' }); // 日本語の月名表示
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']; // 日本語化

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // 金額を日本円形式にフォーマットするヘルパー関数
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="calendar-view">
      {/* ヘッダー: 月ナビゲーション */}
      <div className="calendar-header">
        <button className="nav-button" onClick={handlePrevMonth}>&lt;</button>
        <h2 className="current-month-display">{monthName}</h2>
        <button className="nav-button" onClick={handleNextMonth}>&gt;</button>
      </div>
      
      {/* 曜日ヘッダー */}
      <div className="calendar-week-days">
        {dayNames.map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          // この日付の集計データを取得
          const data = aggregatedData[day.dateKey];
          
          return (
            <div 
              key={index}
              className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.isToday ? 'today' : ''}`}
              // 現在の月の日にちのみクリック可能にする
              onClick={() => day.isCurrentMonth && onDateClick && onDateClick(day.dateKey)}
            >
              <div className="day-number">{day.day}</div>
              
              {/* 収入と支出の表示 */}
              {data && (
                <div className="transaction-summary">
                  {/* 収入 (緑色で表示) */}
                  {data.income > 0 && (
                    <div className="income-amount" title="収入">
                      +{formatCurrency(data.income)}
                    </div>
                  )}
                  {/* 支出 (赤色で表示) */}
                  {data.expense > 0 && (
                    <div className="expense-amount" title="支出">
                      -{formatCurrency(data.expense)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;