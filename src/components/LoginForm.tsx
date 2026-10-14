import { useState, type FormEvent } from 'react';
import { createGreenApi, type Credentials } from '@/api/greenApi';
import { HttpError } from '@/api/http';

interface Props {
  onLogin: (credentials: Credentials, remember: boolean) => void;
}

export function LoginForm({ onLogin }: Props) {
  const [form, setForm] = useState<Credentials>({
    apiUrl: '',
    idInstance: '',
    apiTokenInstance: '',
  });
  const [remember, setRemember] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof Credentials) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value.trim() }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { stateInstance } = await createGreenApi(form).getStateInstance();
      if (stateInstance !== 'authorized') {
        setError(`Инстанс не авторизован (статус: ${stateInstance})`);
        return;
      }
      onLogin(form, remember);
    } catch (err) {
      setError(
        err instanceof HttpError && (err.status === 401 || err.status === 403)
          ? 'Неверный idInstance или apiTokenInstance'
          : 'Не удалось подключиться. Проверьте apiUrl',
      );
    } finally {
      setLoading(false);
    }
  }

  const isFilled = form.apiUrl && form.idInstance && form.apiTokenInstance;

  return (
    <form onSubmit={handleSubmit}>
      <h1>Вход через GREEN-API</h1>

      <label>
        apiUrl
        <input
          value={form.apiUrl}
          onChange={update('apiUrl')}
          placeholder="https://xxxx.api.green-api.com"
        />
      </label>

      <label>
        idInstance
        <input
          value={form.idInstance}
          onChange={update('idInstance')}
          inputMode="numeric"
          autoComplete="username"
        />
      </label>

      <label>
        apiTokenInstance
        <input
          type={showToken ? 'text' : 'password'}
          value={form.apiTokenInstance}
          onChange={update('apiTokenInstance')}
          autoComplete="current-password"
        />
        <button type="button" onClick={() => setShowToken((v) => !v)}>
          {showToken ? 'Скрыть' : 'Показать'}
        </button>
      </label>

      <label>
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        Запомнить меня
      </label>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={!isFilled || loading}>
        {loading ? 'Проверяем...' : 'Войти'}
      </button>
    </form>
  );
}
