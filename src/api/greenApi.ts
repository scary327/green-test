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
  };
}

export type GreenApi = ReturnType<typeof createGreenApi>;
