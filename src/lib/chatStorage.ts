import type { Chat } from '@/types/chat';
import type { ChatState } from '@/lib/chatReducer';
import { initialChatState } from '@/lib/chatReducer';

const key = (idInstance: string) => `green-api-chats:${idInstance}`;

function normalizeChat(raw: Partial<Chat> & { chatId: string }): Chat {
  return {
    chatId: raw.chatId,
    name: raw.name || raw.chatId,
    messages: Array.isArray(raw.messages) ? raw.messages : [],
  };
}

export function loadChats(idInstance: string): ChatState {
  try {
    const raw = localStorage.getItem(key(idInstance));
    if (!raw) return initialChatState;
    const parsed = JSON.parse(raw) as Partial<ChatState>;
    return {
      chats: (parsed.chats ?? []).filter((c) => c?.chatId).map(normalizeChat),
      activeChatId: parsed.activeChatId ?? null,
    };
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
