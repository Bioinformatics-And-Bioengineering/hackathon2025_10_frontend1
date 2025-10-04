// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

// 作成したコンポーネントをインポート (拡張子に注意)
import TransactionForm from './components/TransactionForm.jsx';
// Dashboardは、TransactionFormやSummaryCardを組み込む親コンポーネントとして仮に作成します。
import Dashboard from './components/Dashboard.jsx'; 

// 🚨 注意: Dashboard.jsx は別途作成が必要です 🚨

function App() {
  return (
    <Box sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: 3, // 見やすさのために追加
        }}>
      <Router>
      {/* 画面上部のナビゲーションバー */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            家計簿アプリ 💰
          </Typography>
          <Button color="inherit" component={Link} to="/">
            概要
          </Button>
          <Button color="inherit" component={Link} to="/add">
            登録
          </Button>
        </Toolbar>
      </AppBar>

      {/* ページコンテンツ用のコンテナ */}
      <Container sx={{ mt: 4, mb: 4 }}>
        <Routes>
          {/* ホーム画面：SummaryCardやTransactionListを表示 */}
          <Route path="/" element={<Dashboard />} />
          
          {/* 登録画面：TransactionFormを表示 */}
          <Route path="/add" element={<TransactionForm />} />
        </Routes>
      </Container>
    </Router>

    </Box>
    
  );
}

export default App;