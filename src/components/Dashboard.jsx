// Dashboard.jsx（dayjsなし + カレンダー表示あり + 収支は完全にバックエンド由来）
import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box, LinearProgress } from "@mui/material";
import SummaryCard from "./SummaryCard.jsx";
import CalendarView from "./CalendarView.jsx";
import AvatarPanel from "./AvatarPanel.jsx";
// "YYYY-MM" を生成（ローカル時刻基準）
const getYearMonth = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};
const API_BASE = "https://hackathon2025-10-backend.onrender.com";
const month = getYearMonth();
const userId = 1;
// カレンダー用の仮データ（必要に応じてAPIに置換OK）
const initialTransactions = [
  { id: 1, type: "expense", amount: 500,    date: "2025-10-01", category: "食費" },
  { id: 2, type: "income",  amount: 300000, date: "2025-10-01", category: "給与" },
  { id: 3, type: "expense", amount: 1200,   date: "2025-10-05", category: "交通費" },
  { id: 4, type: "expense", amount: 8500,   date: "2025-10-20", category: "趣味" },
];
// 収支ペイロードの正規化（/api/goals or /api/state(goals) どちらでも対応）
function normalizeGoalsPayload(payload) {
  const g = payload?.goals ?? payload ?? {};
  const income  = Number(g.income_sum ?? g.incomeSum ?? g.income ?? 0);
  const expense = Number(g.expense_sum ?? g.expenseSum ?? g.expense ?? 0);
  const hasBalKey = Object.prototype.hasOwnProperty.call(g, "balance")
                 || Object.prototype.hasOwnProperty.call(g, "total")
                 || Object.prototype.hasOwnProperty.call(g, "saving")
                 || Object.prototype.hasOwnProperty.call(g, "net");
  const balance = hasBalKey
    ? Number(g.balance ?? g.total ?? g.saving ?? g.net ?? 0)
    : (income - expense); // 最終手段（基本はサーバ値を使う）
  return { income, expense, balance };
}
export default function Dashboard() {
  // 収支（サマリー）
  const [goalData, setGoalData] = useState({
    month, goal_amount: 0, total: 0, income_sum: 0, expense_sum: 0,
  });
  const [balance, setBalance] = useState(0);
  const [loadingGoal, setLoadingGoal] = useState(true);
  // キャラ状態
  const [charData, setCharData] = useState({
    level: 1, streak: 0, exp: 0, next_threshold: 100,
  });
  const [loadingChar, setLoadingChar] = useState(true);
  // カレンダー表示用
  const [transactions, setTransactions] = useState(initialTransactions);
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoadingGoal(true);
        setLoadingChar(true);
        // 1) goals優先で収支をサーバから取得
        let goalsPayload = null;
        try {
          const rGoals = await fetch(`${API_BASE}/api/goals/${month}?user_id=${userId}`);
          if (rGoals.ok) {
            goalsPayload = await rGoals.json(); // 期待: { month, goal_amount, total, income_sum, expense_sum } など
          }
        } catch (_) { /* noop */ }
        // 2) stateでキャラ状態取得（goalsが無ければフォールバックとしても活用）
        let statePayload = null;
        try {
          const rState = await fetch(`${API_BASE}/api/state?user_id=${userId}&month=${month}`);
          if (rState.ok) statePayload = await rState.json();
        } catch (_) { /* noop */ }
        if (ignore) return;
        // ---- キャラ状態（level/streak/exp…）: /api/state からそのまま
        if (statePayload?.character) {
          const c = statePayload.character;
          setCharData({
            level: c.level ?? 1,
            streak: c.streak ?? 0,
            exp: c.exp ?? 0,
            next_threshold: c.next_threshold ?? 100,
          });
        }
        // ---- 収支（完全サーバ由来）
        // goalsが取れればそちらを採用。無ければstateからgoalsを正規化。
        let picked = null;
        if (goalsPayload) {
          picked = normalizeGoalsPayload(goalsPayload);
        } else if (statePayload) {
          picked = normalizeGoalsPayload(statePayload);
        } else {
          picked = { income: 0, expense: 0, balance: 0 };
        }
        setGoalData(g => ({
          ...g,
          income_sum: picked.income,
          expense_sum: picked.expense,
          total: picked.balance,
        }));
        setBalance(picked.balance);
        // 取引一覧をサーバから取りたい場合はここで（任意）
        // try {
        //   const rEntries = await fetch(`${API_BASE}/api/entries?user_id=${userId}&month=${month}`);
        //   if (rEntries.ok) {
        //     const p = await rEntries.json(); // 期待: { entries: [...] }
        //     setTransactions(Array.isArray(p.entries) ? p.entries : []);
        //   }
        // } catch (_) { /* noop */ }
      } finally {
        if (!ignore) {
          setLoadingGoal(false);
          setLoadingChar(false);
        }
      }
    })();
    return () => { ignore = true; };
  }, []);
 return (
  // 全体の中央寄せコンテナ（幅を絞る）
  <Box sx={{ py: 2 }}>
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* ▼ お金（3枚）行：中央寄せ */}
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={4}>
          <SummaryCard title="収入合計" amount={goalData.income_sum} type="income" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="支出合計" amount={goalData.expense_sum} type="expense" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            title={loadingGoal ? "今月残高（読込中）" : "今月残高"}
            amount={balance}
            type="balance"
          />
        </Grid>
      </Grid>
      {/* ▼ 育成アバター：1行専有（フル幅）かつコンテンツは中央寄せ */}
      {/* ▼ 育成アバター：Dashboardは呼ぶだけ */}
<Box sx={{ mt: 3 }}>
  <AvatarPanel
    character={charData}
    saving={balance}       // ← 今月残高をそのまま渡す
    loading={loadingChar}
  />
</Box>
      {/* ▼ カレンダー：1行専有（フル幅）かつカード幅を中央に */}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 2, maxWidth: 1000, mx: "auto" }}>
          <Typography variant="h5" gutterBottom>
            カレンダービュー
          </Typography>
          <CalendarView transactions={transactions} month={month} />
        </Paper>
      </Box>
    </Box>
  </Box>
);
}