import React, { useEffect, useState, useMemo } from 'react';
import { Grid, Typography, Paper } from '@mui/material';
import SummaryCard from './SummaryCard.jsx';
import CalendarView from './CalendarView.jsx';
// import AvatarPanel from './AvatarPanel.jsx';
// ---- ユーティリティ: ローカル時間で "YYYY-MM" を生成（UTCズレ対策）
const getYearMonth = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};
// API ベースURL（.env で VITE_API_BASE を設定していればそちら優先）
const API_BASE = import.meta?.env?.VITE_API_BASE || 'https://hackathon2025-10-backend.onrender.com';
// 仮の全取引データ（そのまま残してOK）
const initialTransactions = [
  { id: 1, type: 'expense', amount: 500, date: '2025-10-01', category: '食費' },
  { id: 2, type: 'income',  amount: 300000, date: '2025-10-01', category: '給与' },
  { id: 3, type: 'expense', amount: 1200, date: '2025-10-05', category: '交通費' },
  { id: 4, type: 'expense', amount: 8500, date: '2025-10-20', category: '趣味' },
];
const Dashboard = () => {
  const month = getYearMonth();
  // 画面用の仮トランザクション（カレンダーに表示）
  const [transactions, setTransactions] = useState(initialTransactions);
  // 目標/残高データ（{ month, goal_amount, total } を想定）
  const [goalData, setGoalData] = useState({ month, goal_amount: 0, total: 0, income_sum: 0, expense_sum: 0, });
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [goalError, setGoalError] = useState('');
  // ---- 目標データ（= 今月残高 total を含む）をバックエンドから取得
  useEffect(() => {
    const fetchGoalData = async () => {
      setLoadingGoal(true);
      setGoalError('');
      try {
        const res = await fetch(`${API_BASE}/api/goals/${month}?user_id=1`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch goal data: ${res.status} ${text}`);
        }
        const data = await res.json(); // { month, goal_amount, total } を想定
        setGoalData(data);
      } catch (e) {
        console.error(e);
        setGoalError('目標データの取得に失敗しました');
        setGoalData({ month, goal_amount: 0, total: 0 }); // フォールバック
      } finally {
        setLoadingGoal(false);
      }
    };
    fetchGoalData();
  }, [month]);
  // タイトル表示（"YYYY-MM" → "YYYY年MM月"）
  const monthTitle = useMemo(() => {
    const [y, m] = month.split('-');
    return `${y}年${m}月`;
  }, [month]);
  // ---- 今月残高（バックエンド total）をランク判定に利用
  const balance = goalData?.total ?? 0;
  // ランク判定：金/銀/銅（読み込み中は normal）
  const rank = loadingGoal
    ? 'normal'
    : balance >= 100000 ? 'gold'
    : balance >= 50000  ? 'silver'
    :                    'bronze';
  // 背景スタイル
  const avatarBgStyles = {
    gold: {
      background: 'linear-gradient(135deg, #F7D14C 0%, #F1B90A 45%, #C08A00 100%)',
      boxShadow: '0 12px 28px rgba(192,138,0,0.35), inset 0 0 80px rgba(255,255,255,0.12)',
    },
    silver: {
      background: 'linear-gradient(135deg, #E6EBEF 0%, #C9D1D9 45%, #9EA7B3 100%)',
      boxShadow: '0 12px 28px rgba(158,167,179,0.35), inset 0 0 80px rgba(255,255,255,0.10)',
    },
    bronze: {
      background: 'linear-gradient(135deg, #E3A070 0%, #C07B46 45%, #8C4B24 100%)',
      boxShadow: '0 12px 28px rgba(140,75,36,0.35), inset 0 0 80px rgba(255,255,255,0.08)',
    },
    normal: {
      background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 50%, #A855F7 100%)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.25), inset 0 0 80px rgba(255,255,255,0.08)',
    },
  };
  return (
    <Grid container spacing={2} alignItems="stretch">
      {/* 左カラム：サマリー＋カレンダー */}
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 2, height: '100%', width: '100%' }}>
          <Typography variant="h4" gutterBottom>
            月間サマリー ({monthTitle})
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              {/* ★ backend の収入合計を表示 */}
              <SummaryCard title="収入合計" amount={goalData.income_sum} type="income" />
            </Grid>
            <Grid item xs={12} sm={4}>
              {/* ★ backend の支出合計を表示 */}
              <SummaryCard title="支出合計" amount={goalData.expense_sum} type="expense" />
            </Grid>
            <Grid item xs={12} sm={4}>
              {/* ★ backend の total を「今月残高」として表示 */}
              <SummaryCard
                title={loadingGoal ? '今月残高（読込中）' : '今月残高'}
                amount={balance}
                type="balance"
              />
            </Grid>
          </Grid>
          {goalError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {goalError}
            </Typography>
          )}
          <br />
          <br />
          {/* 育成デモ（背景は残高ランクに応じて切替） */}
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
                minHeight: 300,
                ...avatarBgStyles[rank], // ★ ランク別背景を適用
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
      {/* 右カラム（今は未使用。将来、統計パネルなどを置くスペース） */}
      {/* <Grid item xs={12} md={5}> ... </Grid> */}
    </Grid>
  );
};
export default Dashboard;
