// Dashboard.jsx（dayjsなし版）
import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box, LinearProgress } from "@mui/material";
import SummaryCard from "./SummaryCard.jsx";
// import AvatarPanel from "./AvatarPanel.jsx";

// "YYYY-MM" を生成（ローカル時刻基準）
const getYearMonth = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

// 残高に応じてランク判定
const saving = Number(balance ?? 0);
const rank = loadingGoal
  ? "bronze"
  : saving >= 100000 ? "gold"
  : saving >= 50000  ? "silver"
  :                   "bronze";

// 背景スタイル
const avatarBg = {
  gold: {
    background: "linear-gradient(135deg,#F7D14C 0%,#F1B90A 45%,#C08A00 100%)",
    boxShadow: "0 12px 28px rgba(192,138,0,0.35), inset 0 0 80px rgba(255,255,255,0.12)",
  },
  silver: {
    background: "linear-gradient(135deg,#E6EBEF 0%,#C9D1D9 45%,#9EA7B3 100%)",
    boxShadow: "0 12px 28px rgba(158,167,179,0.35), inset 0 0 80px rgba(255,255,255,0.10)",
  },
  bronze: {
    background: "linear-gradient(135deg,#E3A070 0%,#C07B46 45%,#8C4B24 100%)",
    boxShadow: "0 12px 28px rgba(140,75,36,0.35), inset 0 0 80px rgba(255,255,255,0.08)",
  },
};




const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5000";
const month = getYearMonth();
const userId = 1;

export default function Dashboard() {
  // 既存
  const [goalData, setGoalData] = useState({
    month, goal_amount: 0, total: 0, income_sum: 0, expense_sum: 0,
  });
  const [balance, setBalance] = useState(0);
  const [loadingGoal, setLoadingGoal] = useState(true);

  // 追加：character 用の state（level/exp/streak など）
  const [charData, setCharData] = useState({
    level: 1,
    streak: 0,
    exp: 0,
    next_threshold: 100, // 仕様未定なら仮で100
  });
  const [loadingChar, setLoadingChar] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoadingGoal(true);
        setLoadingChar(true);

        // ← ラッパ無しの素の fetch（1回でまとめて取る）
        const res = await fetch(
          `${API_BASE}/api/state?user_id=${userId}&month=${month}`
        );
        if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
        const data = await res.json();

        if (ignore) return;

        // 目標系
        const inc = data?.goals?.income_sum ?? 0;
        const expSum = data?.goals?.expense_sum ?? 0;
        const bal = data?.goals?.balance ?? (inc - expSum);
        setGoalData(g => ({ ...g, income_sum: inc, expense_sum: expSum }));
        setBalance(bal);

        // キャラ系
        const c = data?.character ?? {};
        setCharData({
          level: c.level ?? 1,
          streak: c.streak ?? 0,
          exp: c.exp ?? 0,
          next_threshold: c.next_threshold ?? 100,
        });
      } catch (e) {
        console.error("state取得エラー:", e);
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
    <Grid container spacing={2}>
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

      {/* 例：level/exp の表示 */}
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 2, borderRadius: 3, overflow: "hidden", ...avatarBg[rank] }}>
          <Typography>
            {loadingChar ? "読込中..." : `Lv.${charData.level} / 連続 ${charData.streak} 日`}
          </Typography>
          <Box sx={{ mt:1 }}>
            <Typography variant="body2">次のレベルまで</Typography>
            <LinearProgress
              variant="determinate"
              value={
                charData.next_threshold > 0
                  ? Math.min(100, Math.round((charData.exp / charData.next_threshold) * 100))
                  : 0
              }
            />
            <Typography variant="caption">
              {charData.exp} / {charData.next_threshold}
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* <AvatarPanel state={{ character: charData, goals: goalData }} loading={loadingChar} /> */}
    </Grid>
  );
}