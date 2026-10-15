import { createHttpClient } from '@/api/http';

export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface Notification {
  receiptId: number;
  body: {
    typeWebhook: string;
    idMessage?: string;
    timestamp: number;
    senderData?: { chatId: string; sender: string; senderName?: string };
    messageData?: {
      typeMessage: string;
      textMessageData?: { textMessage: string };
      extendedTextMessageData?: { text: string };
    };
  };
}

export interface HistoryMessage {
  type: 'incoming' | 'outgoing';
  idMessage: string;
  timestamp: number;
  typeMessage: string;
  chatId: string;
  textMessage?: string;
  extendedTextMessage?: { text: string };
}

export interface ContactInfo {
  chatId: string;
  name: string;
  contactName: string;
  username?: string;
}

export interface ChatInfo {
  chatId: string;
  name: string;
  type: 'user' | 'bot' | 'group' | 'channel' | string;
  username?: string;
}

export function createGreenApi({ apiUrl, idInstance, apiTokenInstance }: Credentials) {
  const api = createHttpClient(apiUrl);
  const path = (method: string, ...rest: (string | number)[]) =>
    [`waInstance${idInstance}`, method, apiTokenInstance, ...rest].join('/');

  return {
    sendMessage: (chatId: string, message: string) =>
      api.post<SendMessageResponse>(path('sendMessage'), { chatId, message }),

    receiveNotification: (signal?: AbortSignal) =>
      api.get<Notification | null>(path('receiveNotification'), {
        query: { receiveTimeout: 20 },
        signal,
      }),

    deleteNotification: (receiptId: number) =>
      api.delete<{ result: boolean }>(path('deleteNotification', receiptId)),

    getStateInstance: () => api.get<{ stateInstance: string }>(path('getStateInstance')),
    getContactInfo: (chatId: string) => api.post<ContactInfo>(path('getContactInfo'), { chatId }),

    getChats: (signal?: AbortSignal) => api.get<ChatInfo[]>(path('getChats'), { signal }),

    getChatHistory: (chatId: string, count = 100, signal?: AbortSignal) =>
      api.post<HistoryMessage[]>(path('getChatHistory'), { chatId, count }, { signal }),
  };
}

export type GreenApi = ReturnType<typeof createGreenApi>;
