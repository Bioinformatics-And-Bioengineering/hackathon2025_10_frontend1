// src/components/AvatarPanel.jsx
import React from "react";
import { Paper, Box, Typography, LinearProgress } from "@mui/material";
export default function AvatarPanel({
  character = { level: 1, streak: 0, exp: 0, next_threshold: 100 },
  saving = 0,          // ← 残高（貯金額）を受け取る
  loading = false,     // ← キャラ情報のローディング状態
  sx = {},             // ← 外から追加スタイルも渡せるように
}) {
  // ランク判定（10万以上=金、5万以上=銀、5万未満=銅）
  const rank =
    loading ? "bronze" :
    saving >= 100000 ? "gold" :
    saving >= 50000  ? "silver" :
                       "bronze";
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
  const exp = Number(character?.exp ?? 0);
  const next = Number(character?.next_threshold ?? 100);
  const percent = next > 0 ? Math.min(100, Math.round((exp / next) * 100)) : 0;
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        maxWidth: 900,
        mx: "auto",
        ...avatarBg[rank],
        ...sx,
      }}
    >
      {/* :力こぶ: アバター（後で画像に差し替え可能） */}
      <Box
        sx={{
          width: 160,
          height: 160,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          fontSize: 96,
          bgcolor: "background.default",
          flexShrink: 0,
        }}
      >
        :力こぶ:
      </Box>
      {/* レベル／連続日数／EXP */}
      <Box sx={{ minWidth: 260 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {loading ? "読込中..." : `Lv.${character?.level ?? 1} / 連続 ${character?.streak ?? 0} 日`}
        </Typography>
        <Typography variant="body2">次のレベルまで</Typography>
        <LinearProgress variant="determinate" value={percent} sx={{ mt: 0.5 }} />
        <Typography variant="caption">
          {exp} / {next}
        </Typography>
      </Box>
    </Paper>
  );
}