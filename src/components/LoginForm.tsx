import { useState, type ChangeEvent, type FormEvent } from 'react';
import { createGreenApi, type Credentials } from '@/api/greenApi';
import { HttpError } from '@/api/http';
import styles from './LoginForm.module.css';

function getLoginError(err: unknown): string {
  if (!(err instanceof HttpError))
    return 'Не удалось подключиться. Проверьте apiUrl и интернет-соединение';
  switch (err.status) {
    case 401:
    case 403:
    case 404:
      return 'Инстанс не найден: проверьте idInstance и apiTokenInstance';
    case 429:
      return 'Слишком много попыток. Подождите минуту и попробуйте снова';
    default:
      return `Ошибка сервера GREEN-API (${err.status})`;
  }
}

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

  const update = (field: keyof Credentials) => (e: ChangeEvent<HTMLInputElement>) =>
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
      setError(getLoginError(err));
    } finally {
      setLoading(false);
    }
  }

  const isFilled = form.apiUrl && form.idInstance && form.apiTokenInstance;

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.logo} aria-hidden>
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.1-4.6A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />
          </svg>
        </div>

        <h1 className={styles.title}>Вход в чат</h1>
        <p className={styles.subtitle}>
          Введите данные инстанса из{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            консоли GREEN-API
          </a>
        </p>

        <label className={styles.field}>
          <span className={styles.label}>apiUrl</span>
          <input
            className={styles.input}
            value={form.apiUrl}
            onChange={update('apiUrl')}
            placeholder="https://xxxx.api.green-api.com"
            inputMode="url"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>idInstance</span>
          <input
            className={styles.input}
            value={form.idInstance}
            onChange={update('idInstance')}
            placeholder="1101000001"
            inputMode="numeric"
            autoComplete="username"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>apiTokenInstance</span>
          <span className={styles.inputWrap}>
            <input
              className={styles.input}
              type={showToken ? 'text' : 'password'}
              value={form.apiTokenInstance}
              onChange={update('apiTokenInstance')}
              placeholder="••••••••••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.eye}
              onClick={() => setShowToken((v) => !v)}
              aria-label={showToken ? 'Скрыть токен' : 'Показать токен'}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
                {showToken && <path d="M3 3l18 18" />}
              </svg>
            </button>
          </span>
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Запомнить меня
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={!isFilled || loading}>
          {loading ? <span className={styles.spinner} aria-label="Проверяем" /> : 'Войти'}
        </button>
      </form>
    </main>
  );
}
