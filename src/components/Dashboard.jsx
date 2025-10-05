import React, { useEffect, useState, useMemo } from "react";
import { Grid, Typography, Paper } from "@mui/material";
import SummaryCard from "./SummaryCard.jsx";
import CalendarView from "./CalendarView.jsx";
import AvatarPanel from "./AvatarPanel.jsx";
const API_BASE = "http://localhost:5000";
// ---- 現在の年月を "YYYY-MM" 形式で取得
const getYearMonth = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};
// ---- フォールバック用のダミーデータ
const initialTransactions = [
  { id: 1, type: "expense", amount: 500, date: "2025-10-01", category: "食費" },
  { id: 2, type: "income", amount: 300000, date: "2025-10-01", category: "給与" },
  { id: 3, type: "expense", amount: 1200, date: "2025-10-05", category: "交通費" },
  { id: 4, type: "expense", amount: 8500, date: "2025-10-20", category: "趣味" },
];
const Dashboard = () => {
  const month = useMemo(() => getYearMonth(), []);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [txError, setTxError] = useState("");
  const [stateData, setStateData] = useState(null); // ← AvatarPanelに渡す
  // ---- 取引データ取得
  useEffect(() => {
    const fetchEntries = async () => {
      setTxError("");
      try {
        const res = await fetch(`${API_BASE}/api/entries?month=${month}&user_id=1`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const tx = (data.entries || []).map((r) => ({
          id: r.id,
          date: r.date,
          category: r.category,
          type: Number(r.amount) >= 0 ? "income" : "expense",
          amount: Math.abs(Number(r.amount) || 0),
        }));
        setTransactions(tx);
      } catch (e) {
        console.error(e);
        setTxError("取引データの取得に失敗しました（ダミーデータを表示中）");
        setTransactions(initialTransactions);
      }
    };
    fetchEntries();
  }, [month]);
  // ---- /api/state を直接呼び出して AvatarPanel に渡す
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/state?month=${month}&user_id=1`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setStateData(data);
      } catch (err) {
        console.error("state取得失敗:", err);
        // 仮データ（サーバーがまだない場合）
        setStateData({
          character: { level: 3, streak: 7 },
          goals: { goal_amount: 50000, total: 32000 },
        });
      }
    };
    fetchState();
  }, [month]);
  return (
    <Grid container spacing={3}>
      {/* 左側：カレンダーやサマリー */}
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <SummaryCard
                title="今月残高"
                amount={stateData?.goals?.total ?? 0}
                type="balance"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SummaryCard
                title="今月の収入"
                amount={transactions
                  .filter((t) => t.type === "income")
                  .reduce((sum, t) => sum + t.amount, 0)}
                type="income"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SummaryCard
                title="今月の支出"
                amount={transactions
                  .filter((t) => t.type === "expense")
                  .reduce((sum, t) => sum + t.amount, 0)}
                type="expense"
              />
            </Grid>
          </Grid>
          <Typography variant="h5" sx={{ mt: 4 }}>
            カレンダービュー
          </Typography>
          <CalendarView transactions={transactions} />
          {txError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {txError}
            </Typography>
          )}
        </Paper>
      </Grid>
      {/* 右側：AvatarPanel */}
      <Grid item xs={12} md={5}>
        <AvatarPanel state={stateData} month={month} userId={1} />
      </Grid>
    </Grid>
  );
};
export default Dashboard;