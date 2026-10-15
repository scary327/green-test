import type { Chat, Message } from '@/types/chat';

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
}

export type ChatAction =
  | { type: 'ADD_CHAT'; chatId: string; name: string }
  | { type: 'SET_ACTIVE'; chatId: string }
  | { type: 'ADD_MESSAGE'; chatId: string; message: Message }
  | { type: 'SET_HISTORY'; chatId: string; messages: Message[] };

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
        name: chat?.name ?? action.chatId,
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
  }
}
