import type { Chat, Message } from '@/types/chat';

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
}

export type ChatAction =
  | { type: 'ADD_CHAT'; chatId: string; name: string }
  | { type: 'SET_ACTIVE'; chatId: string }
  | { type: 'ADD_MESSAGE'; chatId: string; name?: string; message: Message }
  | { type: 'SET_HISTORY'; chatId: string; messages: Message[] }
  | { type: 'MERGE_CHATS'; chats: { chatId: string; name: string }[] };

export const initialChatState: ChatState = { chats: [], activeChatId: null };

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_CHAT': {
      const exists = state.chats.some((c) => c.chatId === action.chatId);
      return {
        chats: exists
          ? state.chats
          : [{ chatId: action.chatId, name: action.name, messages: [] }, ...state.chats],
        activeChatId: action.chatId,
      };
    }
    case 'SET_ACTIVE':
      return { ...state, activeChatId: action.chatId };
    case 'ADD_MESSAGE': {
      const chat = state.chats.find((c) => c.chatId === action.chatId);
      if (chat?.messages.some((m) => m.id === action.message.id)) return state; // дубль
      const updated: Chat = {
        chatId: action.chatId,
        name: chat?.name ?? action.name ?? action.chatId,
        messages: [...(chat?.messages ?? []), action.message],
      };
      return {
        ...state,
        chats: [updated, ...state.chats.filter((c) => c.chatId !== action.chatId)],
      };
    }
    case 'SET_HISTORY': {
      return {
        ...state,
        chats: state.chats.map((c) => {
          if (c.chatId !== action.chatId) return c;
          const byId = new Map(c.messages.map((m) => [m.id, m]));
          for (const m of action.messages) byId.set(m.id, m);
          const messages = [...byId.values()].sort((a, b) => a.timestamp - b.timestamp);
          return { ...c, messages };
        }),
      };
    }
    case 'MERGE_CHATS': {
      const local = new Map(state.chats.map((c) => [c.chatId, c]));
      const fromServer = action.chats.map((s) => {
        const existing = local.get(s.chatId);
        local.delete(s.chatId);
        return existing ? { ...existing, name: s.name || existing.name } : { ...s, messages: [] };
      });
      return { ...state, chats: [...local.values(), ...fromServer] };
    }
  }
}
