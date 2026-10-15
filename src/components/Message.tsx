import type { Message as MessageType } from '@/types/chat';
import styles from './Chat.module.css';

const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

export function Message({ message }: { message: MessageType }) {
  return (
    <div className={`${styles.message} ${message.fromMe ? styles.mine : styles.theirs}`}>
      <span className={styles.text}>{message.text}</span>
      <time className={styles.time}>{timeFormat.format(message.timestamp * 1000)}</time>
    </div>
  );
}
