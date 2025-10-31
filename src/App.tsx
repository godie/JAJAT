// src/App.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HomePage />
    </GoogleOAuthProvider>
  );
}

export default App;