import { useCallback, useEffect, useReducer } from 'react';
import type { GreenApi, HistoryMessage, Notification } from '@/api/greenApi';
import { chatReducer } from '@/lib/chatReducer';
import { usePolling } from '@/hooks/usePolling';
import { loadChats, saveChats } from '@/lib/chatStorage';
import type { Message } from '@/types/chat';

function extractText(n: Notification): string | null {
  const data = n.body.messageData;
  return data?.textMessageData?.textMessage ?? data?.extendedTextMessageData?.text ?? null;
}

function historyToMessage(m: HistoryMessage): Message | null {
  const text = m.textMessage ?? m.extendedTextMessage?.text;
  if (!text) return null; // фото, стикеры и т. п. пропускаем, по ТЗ только текст
  return { id: m.idMessage, text, fromMe: m.type === 'outgoing', timestamp: m.timestamp };
}

export function useChats(api: GreenApi, idInstance: string) {
  const [state, dispatch] = useReducer(chatReducer, idInstance, loadChats);

  useEffect(() => {
    saveChats(idInstance, state);
  }, [idInstance, state]);

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

  const addChat = useCallback(
    async (phone: string) => {
      const info = await api.getContactInfo(`${phone}@c.us`);
      dispatch({
        type: 'ADD_CHAT',
        chatId: info.chatId,
        name: info.name || info.contactName || phone,
      });
    },
    [api],
  );

  const loadHistory = useCallback(
    async (chatId: string) => {
      const history = await api.getChatHistory(chatId);
      const messages = history.map(historyToMessage).filter((m): m is Message => m !== null);
      dispatch({ type: 'SET_HISTORY', chatId, messages });
    },
    [api],
  );

  useEffect(() => {
    if (state.activeChatId) loadHistory(state.activeChatId).catch(console.error);
  }, [state.activeChatId, loadHistory]);

  const selectChat = useCallback((chatId: string) => dispatch({ type: 'SET_ACTIVE', chatId }), []);

  return { ...state, sendMessage, addChat, selectChat };
}
