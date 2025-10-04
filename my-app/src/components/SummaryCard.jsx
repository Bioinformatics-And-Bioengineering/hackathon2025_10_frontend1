import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; 
import MoneyOffIcon from '@mui/icons-material/MoneyOff'; 
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// 金額を円形式にフォーマットする関数
const formatCurrency = (amount) => {
  return amount.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
};

// propsとして title, amount, type を受け取る
const SummaryCard = ({ title, amount, type }) => {
  // propsの type に応じて表示スタイルを決定
  let color = 'primary';
  let IconComponent = AccountBalanceIcon;

  if (type === 'income') {
    color = 'success';
    IconComponent = AttachMoneyIcon;
  } else if (type === 'expense') {
    color = 'error';
    IconComponent = MoneyOffIcon;
  }

  // MUIのカラーシステムを適用するために、bgcolorプロパティで色の濃淡を指定
  // 例: primary.light, success.light, error.light
  return (
    <Card sx={{ minWidth: 275, bgcolor: `${color}.light`, color: '#fff' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* タイトル */}
          <Typography variant="h6" component="div" sx={{ color: '#fff' }}>
            {title}
          </Typography>
          {/* アイコン */}
          <IconComponent fontSize="large" sx={{ opacity: 0.8 }} />
        </Box>

        {/* 金額 */}
        <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold' }}>
          {formatCurrency(amount)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;