import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
// 仮のカテゴリデータ
const categories = ['食費', '交通費', '趣味', '給与', 'その他'];
// Dateオブジェクトを "YYYY-MM-DD" 形式の文字列に変換するヘルパー
const formatDateToKey = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Propsとして onAddTransaction を受け取る
const TransactionForm = ({ onAddTransaction }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: 0,
    category: categories[0],
    date: new Date(),
    memo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? Number(value) : value
    });
  };
  const handleSelectChange = (e) => {
    setFormData({ ...formData, category: e.target.value });
  };
  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };
  // フォーム送信時のハンドラ (非同期関数)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newTransactionData = {
      type: formData.type,
      amount: formData.amount,
      category: formData.category,
      memo: formData.memo,
      date: formatDateToKey(formData.date),
    };
    try {
      // バックエンドAPIへの POST リクエスト
      const API_URL = 'http://localhost:5000/api/entries';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransactionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.message || response.statusText}`);
      }
      const savedTransaction = await response.json();
      // 親コンポーネント (App.jsx) の状態を更新
    //   onAddTransaction(savedTransaction);
      alert(':チェックマーク_緑: 取引が正常に登録されました！');
      // 画面遷移を実行
      navigate('/');
    } catch (error) {
      console.error("取引登録エラー:", error);
      alert(`取引登録中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ maxWidth: 400, mx: 'auto', p: 2, border: '1px solid #ccc', borderRadius: 2 }}
      >
        <Typography variant="h5" gutterBottom>
          新規取引の登録
        </Typography>
        {/* 収入/支出の選択 */}
        <FormControl component="fieldset" margin="normal" fullWidth>
          <RadioGroup row name="type" value={formData.type} onChange={handleChange}>
            <FormControlLabel value="expense" control={<Radio color="error" />} label="支出" />
            <FormControlLabel value="income" control={<Radio color="primary" />} label="収入" />
          </RadioGroup>
        </FormControl>
        {/* :お金の袋: 金額 (¥) - 復元した部分 :お金の袋: */}
        <TextField
          label="金額 (¥)"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          margin="normal"
          fullWidth
          required
        />
        {/* 日付 */}
        <DatePicker
          label="日付"
          value={formData.date}
          onChange={handleDateChange}
          slotProps={{ textField: { margin: "normal", fullWidth: true, required: true } }}
        />
        {/* カテゴリ */}
        <FormControl margin="normal" fullWidth required>
          <InputLabel id="category-label">カテゴリ</InputLabel>
          <Select
            labelId="category-label"
            name="category"
            value={formData.category}
            label="カテゴリ"
            onChange={handleSelectChange}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* メモ */}
        <TextField
          label="メモ (任意)"
          name="memo"
          value={formData.memo}
          onChange={handleChange}
          margin="normal"
          fullWidth
          multiline
          rows={2}
        />
        {/* 登録ボタン */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? '登録中...' : '登録'}
        </Button>
      </Box>
    </LocalizationProvider>
  );
};
export default TransactionForm;