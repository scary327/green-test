import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { GreenApi, HistoryMessage, Notification } from '@/api/greenApi';
import { chatReducer } from '@/lib/chatReducer';
import { usePolling } from '@/hooks/usePolling';
import { loadChats, saveChats } from '@/lib/chatStorage';
import type { Message } from '@/types/chat';

const HISTORY_COUNT = 100;

function extractText(n: Notification): string | null {
  const data = n.body.messageData;
  return data?.textMessageData?.textMessage ?? data?.extendedTextMessageData?.text ?? null;
}

function historyToMessage(m: HistoryMessage): Message | null {
  const text = m.textMessage ?? m.extendedTextMessage?.text;
  if (!text) return null;
  return { id: m.idMessage, text, fromMe: m.type === 'outgoing', timestamp: m.timestamp };
}

export function useChats(api: GreenApi, idInstance: string) {
  const [state, dispatch] = useReducer(chatReducer, idInstance, loadChats);
  const loadedHistory = useRef(new Set<string>());

  useEffect(() => {
    saveChats(idInstance, state);
  }, [idInstance, state]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .getChats(controller.signal)
      .then((chats) =>
        dispatch({
          type: 'MERGE_CHATS',
          chats: chats.map((c) => ({ chatId: c.chatId, name: c.name || c.username || c.chatId })),
        }),
      )
      .catch((e) => {
        if (!controller.signal.aborted) console.error(e);
      });
    return () => controller.abort();
  }, [api]);

  useEffect(() => {
    const chatId = state.activeChatId;
    if (!chatId || loadedHistory.current.has(chatId)) return;

    const controller = new AbortController();
    api
      .getChatHistory(chatId, HISTORY_COUNT, controller.signal)
      .then((history) => {
        const messages = history.map(historyToMessage).filter((m): m is Message => m !== null);
        dispatch({ type: 'SET_HISTORY', chatId, messages });
        loadedHistory.current.add(chatId);
      })
      .catch((e) => {
        if (!controller.signal.aborted) console.error(e);
      });
    return () => controller.abort();
  }, [api, state.activeChatId]);

  const handleNotification = useCallback((n: Notification) => {
    const { typeWebhook, senderData, idMessage, timestamp } = n.body;
    const isIncoming = typeWebhook === 'incomingMessageReceived';
    const isOutgoing =
      typeWebhook === 'outgoingMessageReceived' || typeWebhook === 'outgoingAPIMessageReceived';
    if ((!isIncoming && !isOutgoing) || !senderData || !idMessage) return;

    const text = extractText(n);
    if (!text) return;

    dispatch({
      type: 'ADD_MESSAGE',
      chatId: senderData.chatId,
      name: isIncoming ? senderData.senderName : undefined,
      message: { id: idMessage, text, fromMe: isOutgoing, timestamp },
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

  const selectChat = useCallback(
    (chatId: string | null) => dispatch({ type: 'SET_ACTIVE', chatId }),
    [],
  );

  return { ...state, sendMessage, addChat, selectChat };
}
