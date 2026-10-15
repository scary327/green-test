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

export function ChatList({ chats, activeChatId, onSelect, onCreate, onLogout }: Props) {
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const digits = phone.replace(/\D/g, '');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? chats.filter((c) => c.name.toLowerCase().includes(q)) : chats;
  }, [chats, search]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (digits.length < 10 || creating) return;
    setCreating(true);
    setError(null);
    try {
      await onCreate(digits);
      setPhone('');
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
        <button type="button" onClick={onLogout}>
          Выйти
        </button>
      </header>

      <form className={styles.newChat} onSubmit={handleSubmit}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер телефона: 79001234567"
          inputMode="tel"
        />
        <button type="submit" disabled={digits.length < 10 || creating} title="Новый чат">
          {creating ? '…' : '+'}
        </button>
      </form>
      {error && <p className={styles.sidebarError}>{error}</p>}

      <div className={styles.search}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск"
        />
      </div>

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
        {filtered.length === 0 && <li className={styles.listEmpty}>Ничего не найдено</li>}
      </ul>
    </aside>
  );
}
