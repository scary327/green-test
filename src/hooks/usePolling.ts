import { useEffect, useRef } from 'react';
import type { GreenApi, Notification } from '@/api/greenApi';

const RETRY_DELAY_MS = 3000;

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export function usePolling(api: GreenApi | null, onNotification: (n: Notification) => void) {
  const callbackRef = useRef(onNotification);

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!api) return;
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      while (!signal.aborted) {
        try {
          const notification = await api.receiveNotification(signal);
          if (!notification) continue;

          try {
            callbackRef.current(notification);
          } catch (e) {
            console.error('Ошибка обработки уведомления', e);
          }
          await api.deleteNotification(notification.receiptId);
        } catch (e) {
          if (signal.aborted) return;
          console.error('Ошибка получения уведомлений', e);
          await sleep(RETRY_DELAY_MS, signal);
        }
      }
    })();

    return () => controller.abort();
  }, [api]);
}
