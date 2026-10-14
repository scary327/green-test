import { useMemo, useState } from 'react';
import { createGreenApi, type Credentials } from '@/api/greenApi';
import { LoginForm } from '@/components/LoginForm';
import { clearCredentials, loadCredentials, saveCredentials } from '@/lib/credentialsStorage';

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials);
  const api = useMemo(() => (credentials ? createGreenApi(credentials) : null), [credentials]);

  function handleLogin(next: Credentials, remember: boolean) {
    saveCredentials(next, remember);
    setCredentials(next);
  }

  function handleLogout() {
    clearCredentials();
    setCredentials(null);
  }

  if (!credentials || !api) return <LoginForm onLogin={handleLogin} />;

  return (
    <div>
      <button onClick={handleLogout}>Выйти</button>
      {/* здесь будет чат, сюда передаёшь api */}
    </div>
  );
}
