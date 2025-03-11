
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* ...existing code... */}
        <Routes>
          {/* Your route definitions */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;