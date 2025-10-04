import React, { useState } from 'react'; // useStateをインポート
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
// 作成したコンポーネントをインポート
import TransactionForm from './components/TransactionForm.jsx';
import Dashboard from './components/Dashboard.jsx';
function App() {
  // アプリケーション全体で取引データを管理するための状態
  const [transactions, setTransactions] = useState([]);
  /**
   * TransactionFormから新しい取引データを受け取り、一覧に追加する関数
   * @param {object} newTransaction - TransactionFormから渡される新しい取引オブジェクト
   */
  const handleAddTransaction = (newTransaction) => {
    // 既存のリストに新しい取引を追加して状態を更新
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
    console.log('新しい取引がApp.jsxで受け取られました:', newTransaction);
    // ここでDashboardのデータを更新するなどの処理も可能
  };
  return (
    <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: 3,
      }}>
      <Router>
        {/* 画面上部のナビゲーションバー */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              家計簿アプリ
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
            {/* Dashboardにも取引データを渡せるようにしておく */}
            <Route path="/" element={<Dashboard transactions={transactions} />} />
            {/* 登録画面：TransactionFormを表示 */}
            {/* ★★★ ここが重要 ★★★
                onAddTransactionという名前で、作成した関数を渡す */}
            <Route
              path="/add"
              element={<TransactionForm onAddTransaction={handleAddTransaction} />}
            />
          </Routes>
        </Container>
      </Router>
    </Box>
  );
}
export default App;