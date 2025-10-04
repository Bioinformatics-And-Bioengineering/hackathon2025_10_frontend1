// components/Dashboard.jsx

import React, { useState } from 'react';
import { Grid, Typography } from '@mui/material';
import SummaryCard from './SummaryCard.jsx';
import CalendarView from './CalendarView.jsx'; // 月間カレンダー

// 仮の全取引データ（日付のフォーマットは CalendarView.jsx と整合性を合わせています）
const initialTransactions = [
  { id: 1, type: 'expense', amount: 500, date: '2025-10-01', category: '食費' },
  { id: 2, type: 'income', amount: 300000, date: '2025-10-01', category: '給与' },
  { id: 3, type: 'expense', amount: 1200, date: '2025-10-05', category: '交通費' },
  { id: 4, type: 'expense', amount: 8500, date: '2025-10-20', category: '趣味' },
];

const Dashboard = () => {
  // データを保持
  const [transactions, setTransactions] = useState(initialTransactions); 

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        月間サマリー (2025年10月)
      </Typography>
      
      {/* SummaryCardを横並びに配置するためのMUI Gridコンポーネント */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="収入合計" amount={350000} type="income" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="支出合計" amount={150000} type="expense" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="今月残高" amount={200000} type="balance" />
        </Grid>
      </Grid>
      
      <Typography variant="h5" sx={{ mt: 4 }}>
        カレンダービュー
      </Typography>
      
      {/* 修正後: 正しくデータ（transactions）を渡す */}
      <CalendarView transactions={transactions} />
      
      <Typography variant="h5" sx={{ mt: 4 }}>
        取引一覧（TODO）
      </Typography>
    </div>
  );
};

export default Dashboard;