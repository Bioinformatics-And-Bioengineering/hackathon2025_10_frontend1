import { api } from "./client.js";

/**
 * バックエンドが返すJSON例:
 * { "imageBase64": "data:image/png;base64,...." }
 * もしくは { "imageBase64": "<純Base64文字列>", "mime": "image/png" }
 */
export async function getCharacterImageBase64({ days, isTargetAchieved }) {
  try {
    const { data } = await api.post("/api/character-image", {
      days,
      isTargetAchieved,
    });

    const raw = data?.imageBase64 || "";
    if (!raw) return "";

    // すでに "data:*;base64," 形式ならそのまま返す
    if (raw.startsWith("data:")) return raw;

    // 純Base64のみ来た場合は data URL に整形（MIMEはサーバが返すならそれを使用）
    const mime = data?.mime || "image/png";
    return `data:${mime};base64,${raw}`;
  } catch {
    return ""; // エンドポイント未実装・エラー時は空文字で返す（＝フロントは絵文字表示）
  }
}
