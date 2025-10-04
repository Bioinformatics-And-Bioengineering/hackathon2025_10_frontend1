import React, { useState } from 'react';
import { Grid, Typography, Paper } from '@mui/material';
import SummaryCard from './SummaryCard.jsx';
import CalendarView from './CalendarView.jsx';
import AvatarPanel from './AvatarPanel.jsx';
// 仮の全取引データ
const initialTransactions = [
  { id: 1, type: 'expense', amount: 500, date: '2025-10-01', category: '食費' },
  { id: 2, type: 'income',  amount: 300000, date: '2025-10-01', category: '給与' },
  { id: 3, type: 'expense', amount: 1200, date: '2025-10-05', category: '交通費' },
  { id: 4, type: 'expense', amount: 8500, date: '2025-10-20', category: '趣味' },
];
const Dashboard = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  return (
    <Grid container spacing={2} alignItems="stretch">
      {/* 左カラム：サマリー＋カレンダー */}
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 2, height: '100%', width: '100%' }}>
          <Typography variant="h4" gutterBottom>
            月間サマリー (2025年10月)
          </Typography>
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
          <br></br>
          <br></br>

          <Grid item xs={12} md={5}>
  <Paper
    elevation={8}
    sx={{
      p: { xs: 2, md: 3 },
      height: '300px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 3,
      position: 'relative',
      overflow: 'hidden',
      // グラデ背景（ヒーロー感）
      background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 50%, #A855F7 100%)',
      // 強めのシャドウ
      boxShadow:
        '0 10px 25px rgba(0,0,0,0.25), inset 0 0 80px rgba(255,255,255,0.08)',
      // ほんのり光るオーバーレイ
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: -80,
        background: 'radial-gradient(closest-side, rgba(255,255,255,0.18), transparent 70%)',
        filter: 'blur(30px)',
        transform: 'translate(20%, -20%)',
      },
    }}
  >
    <AvatarPanel userId={1} size={240} highlight showStats />
  </Paper>
</Grid>
          <Typography variant="h5" sx={{ mt: 4 }}>
            カレンダービュー
          </Typography>
          <CalendarView transactions={transactions} />
          <Typography variant="h5" sx={{ mt: 4 }}>
            取引一覧（TODO）
          </Typography>
        </Paper>
      </Grid>
      {/* 右カラム：育成（Base64画像） */}
      
    </Grid>
  );
};
export default Dashboard;