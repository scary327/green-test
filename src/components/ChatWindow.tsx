import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { Chat } from '@/types/chat';
import { Avatar } from '@/components/Avatar';
import { Message } from '@/components/Message';
import styles from './Chat.module.css';

interface Props {
  chat: Chat;
  onSend: (chatId: string, text: string) => Promise<void>;
  onBack: () => void;
}

const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

function dayLabel(ts: number) {
  const date = new Date(ts * 1000);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Сегодня';
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
  return dayFormat.format(date);
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const BackIcon = () => (
  <svg {...iconProps} width="22" height="22">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const SendIcon = () => (
  <svg {...iconProps} width="20" height="20">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export function ChatWindow({ chat, onSend, onBack }: Props) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const isFirstScroll = useRef(true);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: isFirstScroll.current ? 'instant' : 'smooth' });
    isFirstScroll.current = false;
  }, [chat.messages.length]);

  async function send() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(chat.chatId, value);
      setText('');
    } catch {
      setError('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <section className={styles.window}>
      <header className={styles.windowHeader}>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.backButton}`}
          onClick={onBack}
          aria-label="Назад к чатам"
        >
          <BackIcon />
        </button>
        <Avatar name={chat.name} id={chat.chatId} size={36} />
        <span className={styles.windowTitle}>{chat.name}</span>
      </header>

      <div className={styles.messages} ref={messagesRef}>
        {chat.messages.length === 0 && (
          <div className={styles.noMessages}>Сообщений пока нет — напишите первым</div>
        )}

        {chat.messages.map((m, i) => {
          const prev = chat.messages[i - 1];
          const showDay = !prev || dayLabel(prev.timestamp) !== dayLabel(m.timestamp);
          return (
            <Fragment key={m.id}>
              {showDay && <div className={styles.daySeparator}>{dayLabel(m.timestamp)}</div>}
              <Message message={m} />
            </Fragment>
          );
        })}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <form className={styles.composer} onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение"
          rows={1}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!text.trim() || sending}
          aria-label="Отправить"
        >
          <SendIcon />
        </button>
      </form>
    </section>
  );
}
