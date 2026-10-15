import type { ChatState } from '@/lib/chatReducer';
import { initialChatState } from '@/lib/chatReducer';

const key = (idInstance: string) => `green-api-chats:${idInstance}`;

export function loadChats(idInstance: string): ChatState {
  try {
    const raw = localStorage.getItem(key(idInstance));
    return raw ? (JSON.parse(raw) as ChatState) : initialChatState;
  } catch {
    return initialChatState;
  }
}

export function saveChats(idInstance: string, state: ChatState) {
  try {
    localStorage.setItem(key(idInstance), JSON.stringify(state));
  } catch {
    // переполнено хранилище или приватный режим, не критично
  }
}
