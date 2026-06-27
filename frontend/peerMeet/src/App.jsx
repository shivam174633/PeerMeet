import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing';
import AuthenticationPage from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeet from './pages/videomeet';
import HomeComponent from './pages/home';
import History from './pages/history';

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthenticationPage/>} />
        <Route path="/home" element ={<HomeComponent/>} />
        <Route path="/history" element={<History/>} />
        <Route path="/:url" element={<VideoMeet/>} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
