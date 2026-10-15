import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { Chat } from '@/types/chat';
import { Message } from '@/components/Message';
import styles from './Chat.module.css';

interface Props {
  chat: Chat;
  onSend: (chatId: string, text: string) => Promise<void>;
}

export function ChatWindow({ chat, onSend }: Props) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      <header className={styles.windowHeader}>{chat.chatId.split('@')[0]}</header>

      <div className={styles.messages}>
        {chat.messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
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
        <button type="submit" disabled={!text.trim() || sending}>
          Отправить
        </button>
      </form>
    </section>
  );
}
