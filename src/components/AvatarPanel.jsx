import * as React from "react";
import { Box, Stack, Typography, LinearProgress } from "@mui/material";
// import dayjs from "dayjs";
//import { getState } from "../api/state";
//import { getCharacterImageBase64 } from "../api/character";

/**
 * props:
 * - userId, month ... オプション。未指定なら自分で当月+userId=1で取る
 * - state ............ 親(Dashboard)が /api/state を1回だけ取得して渡してくる場合用（推奨）
 */
export default function AvatarPanel({ userId = 1, month = dayjs().format("YYYY-MM"), state: injectedState }) {
  const [state, setState] = React.useState(injectedState || null);
  const [imgSrc, setImgSrc] = React.useState("");
  const [loading, setLoading] = React.useState(!injectedState);

  // 親からstateが来なければ自前で /api/state を取得
  React.useEffect(() => {
    let alive = true;
    if (!injectedState) {
      (async () => {
        setLoading(true);
        try {
          const s = await getState({ month, userId });
          if (alive) setState(s);
        } finally {
          if (alive) setLoading(false);
        }
      })();
    } else {
      setState(injectedState);
    }
    return () => { alive = false; };
  }, [injectedState, month, userId]);

  const character = state?.character;
  const goals = state?.goals;

  const level = character?.level ?? 1;
  const streak = character?.streak ?? 0;

  const isTargetAchieved =
    goals?.goal_amount != null ? (goals.total >= goals.goal_amount) : false;

  // Base64画像を取得（任意機能なので、未実装でも絵文字で表示継続）
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!state) return;
      const b64 = await getCharacterImageBase64({ days: streak, isTargetAchieved });
      if (alive) setImgSrc(b64); // ""なら絵文字フォールバック
    })();
    return () => { alive = false; };
  }, [state, streak, isTargetAchieved]);

  return (
    <Stack spacing={2} alignItems="center">
      <Typography variant="h6">育成パネル</Typography>

      {imgSrc ? (
        <Box
          component="img"
          src={imgSrc}
          alt="avatar"
          sx={{ width: 160, height: 160, objectFit: "contain", borderRadius: 2 }}
        />
      ) : (
        <Box
          sx={{
            width: 160, height: 160, borderRadius: 2,
            display: "grid", placeItems: "center", fontSize: 64, bgcolor: "background.default"
          }}
          aria-label="avatar-fallback"
        >
          💪
        </Box>
      )}

      <Typography>Lv.{level} / 連続 {streak} 日</Typography>

      {/* exp/閾値仕様が固まるまでの仮バー（streakベース） */}
      <Box width="100%">
        <Typography variant="body2">次のレベルまで</Typography>
        <LinearProgress variant="determinate" value={Math.min(100, (streak % 7) * (100/7))} />
      </Box>

      {loading && <Typography color="text.secondary">読み込み中...</Typography>}
    </Stack>
  );
}
