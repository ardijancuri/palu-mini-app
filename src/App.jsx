import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import WaitingRoom from './pages/WaitingRoom';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import PaluTools from './pages/PaluTools';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<WaitingRoom />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/community" element={<Community />} />
            <Route path="/tools" element={<PaluTools />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;