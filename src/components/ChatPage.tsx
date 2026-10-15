import type { GreenApi } from '@/api/greenApi';
import { useChats } from '@/hooks/useChats';
import { ChatList } from '@/components/ChatList';
import { ChatWindow } from '@/components/ChatWindow';
import styles from './Chat.module.css';

export function ChatPage({
  api,
  idInstance,
  onLogout,
}: {
  api: GreenApi;
  idInstance: string;
  onLogout: () => void;
}) {
  const { chats, activeChatId, addChat, selectChat, sendMessage } = useChats(api, idInstance);
  const active = chats.find((c) => c.chatId === activeChatId);

  return (
    <div className={`${styles.layout} ${active ? styles.hasActive : ''}`}>
      <ChatList
        chats={chats}
        activeChatId={activeChatId}
        onSelect={selectChat}
        onCreate={addChat}
        onLogout={onLogout}
      />
      {active ? (
        <ChatWindow chat={active} onSend={sendMessage} />
      ) : (
        <div className={styles.empty}>Выберите чат или создайте новый</div>
      )}
    </div>
  );
}
