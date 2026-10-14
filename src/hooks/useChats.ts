import { useCallback, useReducer } from 'react';
import type { GreenApi, Notification } from '@/api/greenApi';
import { chatReducer, initialChatState } from '@/lib/chatReducer';
import { usePolling } from '@/hooks/usePolling';

function extractText(n: Notification): string | null {
  const data = n.body.messageData;
  return data?.textMessageData?.textMessage ?? data?.extendedTextMessageData?.text ?? null;
}

export function useChats(api: GreenApi) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);

  const handleNotification = useCallback((n: Notification) => {
    const { typeWebhook, senderData, idMessage, timestamp } = n.body;
    if (typeWebhook !== 'incomingMessageReceived' || !senderData || !idMessage) return;
    const text = extractText(n);
    if (!text) return;
    dispatch({
      type: 'ADD_MESSAGE',
      chatId: senderData.chatId,
      message: { id: idMessage, text, fromMe: false, timestamp },
    });
  }, []);

  usePolling(api, handleNotification);

  const sendMessage = useCallback(
    async (chatId: string, text: string) => {
      const { idMessage } = await api.sendMessage(chatId, text);
      dispatch({
        type: 'ADD_MESSAGE',
        chatId,
        message: { id: idMessage, text, fromMe: true, timestamp: Math.floor(Date.now() / 1000) },
      });
    },
    [api],
  );

  const addChat = useCallback((chatId: string) => dispatch({ type: 'ADD_CHAT', chatId }), []);
  const selectChat = useCallback((chatId: string) => dispatch({ type: 'SET_ACTIVE', chatId }), []);

  return { ...state, sendMessage, addChat, selectChat };
}
