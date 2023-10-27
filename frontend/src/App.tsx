// import Home from './pages/Home';
import Navbar from "./components/Navbar";
import "./styles/index.css";
import { Routes, Route } from 'react-router-dom';
// import Home from '../pages/Home';
import Budget from './pages/Budget';
import Expense from './pages/Expense';
import Income from './pages/Income';

function App() {
  return (
    <>
      <div className="App"> 
        <Navbar/>
      </div>

      <Routes>
        <Route path="*" element={<Budget />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expense" element={<Expense />} />
      </Routes>
    </>
  );
}

export default App;