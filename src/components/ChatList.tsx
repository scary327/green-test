import { useMemo, useState, type FormEvent } from 'react';
import type { Chat } from '@/types/chat';
import { Avatar } from '@/components/Avatar';
import styles from './Chat.module.css';

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreate: (phone: string) => Promise<void>;
  onLogout: () => void;
}

const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

function formatTime(ts: number) {
  const date = new Date(ts * 1000);
  return date.toDateString() === new Date().toDateString()
    ? timeFormat.format(date)
    : dateFormat.format(date);
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const EditIcon = () => (
  <svg {...iconProps} width="20" height="20">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const CloseIcon = () => (
  <svg {...iconProps} width="20" height="20">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const LogoutIcon = () => (
  <svg {...iconProps} width="20" height="20">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const SearchIcon = () => (
  <svg {...iconProps} width="18" height="18" className={styles.fieldIcon}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const ArrowIcon = () => (
  <svg {...iconProps} width="18" height="18" strokeWidth={2.5}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export function ChatList({ chats, activeChatId, onSelect, onCreate, onLogout }: Props) {
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [creatingMode, setCreatingMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const digits = phone.replace(/\D/g, '');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? chats.filter((c) => c.name.toLowerCase().includes(q)) : chats;
  }, [chats, search]);

  function openCreate() {
    setCreatingMode(true);
    setError(null);
  }

  function closeCreate() {
    setCreatingMode(false);
    setPhone('');
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (digits.length < 10 || creating) return;
    setCreating(true);
    setError(null);
    try {
      await onCreate(digits);
      closeCreate();
    } catch {
      setError('Не удалось найти пользователя с этим номером');
    } finally {
      setCreating(false);
    }
  }

  return (
    <aside className={styles.sidebar}>
      <header className={styles.sidebarHeader}>
        <h2>Чаты</h2>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={creatingMode ? closeCreate : openCreate}
            aria-label={creatingMode ? 'Отмена' : 'Новый чат'}
            title={creatingMode ? 'Отмена' : 'Новый чат'}
          >
            {creatingMode ? <CloseIcon /> : <EditIcon />}
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onLogout}
            aria-label="Выйти"
            title="Выйти"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      {creatingMode ? (
        <form className={styles.field} onSubmit={handleSubmit}>
          <input
            autoFocus
            className={styles.fieldInput}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && closeCreate()}
            placeholder="Номер телефона"
            inputMode="tel"
          />
          <button
            type="submit"
            className={styles.fieldAction}
            disabled={digits.length < 10 || creating}
            aria-label="Создать чат"
          >
            {creating ? '…' : <ArrowIcon />}
          </button>
        </form>
      ) : (
        <div className={styles.field}>
          <SearchIcon />
          <input
            type="search"
            className={`${styles.fieldInput} ${styles.withIcon}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск"
          />
        </div>
      )}
      {error && <p className={styles.sidebarError}>{error}</p>}

      <ul className={styles.chatList}>
        {filtered.map((chat) => {
          const last = chat.messages.at(-1);
          return (
            <li key={chat.chatId}>
              <button
                type="button"
                className={chat.chatId === activeChatId ? styles.chatItemActive : styles.chatItem}
                onClick={() => onSelect(chat.chatId)}
              >
                <Avatar name={chat.name} id={chat.chatId} />
                <span className={styles.chatBody}>
                  <span className={styles.chatTop}>
                    <span className={styles.chatName}>{chat.name}</span>
                    {last && <time className={styles.chatTime}>{formatTime(last.timestamp)}</time>}
                  </span>
                  <span className={styles.chatPreview}>
                    {last ? `${last.fromMe ? 'Вы: ' : ''}${last.text}` : '\u00A0'}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className={styles.listEmpty}>{search ? 'Ничего не найдено' : 'Чатов пока нет'}</li>
        )}
      </ul>
    </aside>
  );
}
