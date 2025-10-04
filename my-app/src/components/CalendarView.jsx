import React, { useState, useMemo } from 'react';

// ユーティリティ関数（カレンダーの日付を計算）
// この例では、常に現在の月のカレンダーを生成します。
const getCalendarDays = (year, month) => {
  const date = new Date(year, month - 1, 1);
  const firstDayOfMonth = date.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const days = [];
  
  // 前月の日付でカレンダーの先頭を埋める (必要に応じて)
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayOfMonth; i > 0; i--) {
    days.push({ 
      day: prevMonthDays - i + 1, 
      isCurrentMonth: false 
    });
  }

  // 今月の日付
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ 
      day: i, 
      isCurrentMonth: true, 
      isToday: (new Date().toDateString() === new Date(year, month - 1, i).toDateString())
    });
  }

  // 翌月の日付でカレンダーの末尾を埋める
  const remainingDays = 42 - days.length; // 6週間 (42セル) を基準
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ 
      day: i, 
      isCurrentMonth: false 
    });
  }

  // 6週間分 (42日) のみ返す
  return days.slice(0, 42); 
};

/**
 * 基本的な月ビューのカレンダーコンポーネント
 * @param {object} props - コンポーネントのプロパティ
 * @param {function} props.onDateClick - 日付がクリックされたときに呼び出される関数
 */
const CalendarView = ({ onDateClick }) => {
  // 常に現在の日付を使用
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // getMonth() は 0-11

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="calendar-view">
      {/* ヘッダー: 月ナビゲーション */}
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <h2>{year} {monthName}</h2>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="calendar-week-days">
        {dayNames.map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="calendar-grid">
        {calendarDays.map((day, index) => (
          <div 
            key={index}
            className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.isToday ? 'today' : ''}`}
            onClick={() => day.isCurrentMonth && onDateClick && onDateClick(new Date(year, month - 1, day.day))}
          >
            {day.day}
          </div>
        ))}
      </div>

      <style jsx global>{`
        /* 簡易的なCSSスタイル。通常はApp.cssや専用のCSSファイルに記述します */
        .calendar-view {
          max-width: 600px;
          margin: 20px auto;
          border: 1px solid #ccc;
          padding: 10px;
          font-family: Arial, sans-serif;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .calendar-header h2 {
          margin: 0;
          font-size: 1.5em;
        }
        .calendar-header button {
          padding: 5px 10px;
          cursor: pointer;
        }
        .calendar-week-days, .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
        }
        .day-name {
          font-weight: bold;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        .calendar-day {
          padding: 10px 0;
          border: 1px solid #eee;
          cursor: pointer;
        }
        .calendar-day:hover {
          background-color: #f0f0f0;
        }
        .other-month {
          color: #aaa;
          background-color: #f9f9f9;
        }
        .today {
          background-color: #ffe0b2; /* 薄いオレンジ */
          font-weight: bold;
          border: 2px solid #ff9800;
        }
      `}</style>
    </div>
  );
};

export default CalendarView;