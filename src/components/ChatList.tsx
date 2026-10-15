import { useState, type FormEvent } from 'react';
import type { Chat } from '@/types/chat';
import { phoneToChatId } from '@/lib/chatId';
import styles from './Chat.module.css';

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreate: (chatId: string) => void;
  onLogout: () => void;
}

export function ChatList({ chats, activeChatId, onSelect, onCreate, onLogout }: Props) {
  const [phone, setPhone] = useState('');
  const digits = phone.replace(/\D/g, '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (digits.length < 10) return;
    onCreate(phoneToChatId(digits));
    setPhone('');
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
          placeholder="Номер телефона, например 79001234567"
          inputMode="tel"
        />
        <button type="submit" disabled={digits.length < 10}>
          +
        </button>
      </form>

      <ul className={styles.chatList}>
        {chats.map((chat) => {
          const last = chat.messages.at(-1);
          return (
            <li key={chat.chatId}>
              <button
                type="button"
                className={chat.chatId === activeChatId ? styles.chatItemActive : styles.chatItem}
                onClick={() => onSelect(chat.chatId)}
              >
                <span className={styles.chatName}>{chat.chatId.split('@')[0]}</span>
                {last && (
                  <span className={styles.chatPreview}>
                    {last.fromMe ? 'Вы: ' : ''}
                    {last.text}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
