import type { Chat, Message } from '@/types/chat';

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
}

export type ChatAction =
  | { type: 'ADD_CHAT'; chatId: string }
  | { type: 'SET_ACTIVE'; chatId: string }
  | { type: 'ADD_MESSAGE'; chatId: string; message: Message };

export const initialChatState: ChatState = { chats: [], activeChatId: null };

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_CHAT': {
      const exists = state.chats.some((c) => c.chatId === action.chatId);
      return {
        chats: exists ? state.chats : [{ chatId: action.chatId, messages: [] }, ...state.chats],
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
        messages: [...(chat?.messages ?? []), action.message],
      };
      return {
        ...state,
        chats: [updated, ...state.chats.filter((c) => c.chatId !== action.chatId)],
      };
    }
  }
}
