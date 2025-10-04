import React, { useState } from 'react';
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
// date-fnsの日本語ロケールを使用（必要に応じて）
import { ja } from 'date-fns/locale'; 

// 仮のカテゴリデータ
const categories = ['食費', '交通費', '趣味', '給与', 'その他'];

const TransactionForm = () => {
  // フォームの初期状態をuseStateで定義
  const [formData, setFormData] = useState({
    type: 'expense', // 'expense' または 'income'
    amount: 0,
    category: categories[0],
    date: new Date(),
    memo: '',
  });

  // テキスト入力やラジオボタン変更時のハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 金額フィールドの場合はNumber型に変換
    setFormData({ 
      ...formData, 
      [name]: name === 'amount' ? Number(value) : value 
    });
  };

  // Selectボックス変更時のハンドラ
  const handleSelectChange = (e) => {
    setFormData({ ...formData, category: e.target.value });
  };

  // DatePicker変更時のハンドラ
  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  // フォーム送信時のハンドラ
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('登録データ:', formData);
    // TODO: ここでバックエンドAPIへデータを送信する処理を実装
    alert('取引を登録しました！ (コンソールを確認)');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
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

        {/* 金額 */}
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
        {/* MUI v5ではrenderInputは不要になりつつありますが、互換性のため残すこともあります */}
        <DatePicker
          label="日付"
          value={formData.date}
          onChange={handleDateChange}
          renderInput={(params) => <TextField {...params} margin="normal" fullWidth required />}
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
        >
          登録
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default TransactionForm;