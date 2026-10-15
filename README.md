# Telegram Chat · GREEN-API

Тестовое задание на позицию «Фронтенд-разработчик React».

Веб-интерфейс для отправки и получения текстовых сообщений в **Telegram** через [GREEN-API](https://green-api.com).

> В ТЗ указан мессенджер MAX с возможностью заменить его на WhatsApp или Telegram — в проекте используется **Telegram-инстанс** GREEN-API.

## Возможности

- Вход по `idInstance` и `apiTokenInstance` с проверкой статуса инстанса
- Создание чата по номеру телефона пользователя Telegram
- Отправка текстовых сообщений — [`SendMessage`](https://green-api.com/telegram/docs/api/sending/SendMessage/)
- Получение сообщений через HTTP API — `ReceiveNotification` / `DeleteNotification`
- Загрузка списка чатов и истории переписки из Telegram-аккаунта
- Светлая и тёмная тема (по системной настройке), адаптивная вёрстка

## Стек

React 19 · TypeScript · Vite · CSS Modules

Без state-менеджеров и UI-библиотек — состояние на `useReducer`, запросы через тонкую обёртку над `fetch`.

## Запуск

### Docker (рекомендуется)

Требуется [Docker](https://docs.docker.com/get-docker/) с Compose.

```bash
git clone https://github.com/scary327/green-test.git
cd green-test
docker compose up --build
```

Откройте http://localhost:8080

Остановить: `Ctrl+C` или `docker compose down`.

### Локально

Требуется Node.js 24.15.0+ (версия указана в `.nvmrc`).

```bash
git clone https://github.com/scary327/green-test.git
cd green-test
npm ci
npm run dev
```

Откройте http://localhost:5173

Версии зависимостей зафиксированы в `package.json` и `package-lock.json` — используйте `npm ci`, а не `npm install`, чтобы установить их в точности.

## Настройка инстанса GREEN-API

1. Зарегистрируйтесь в [консоли GREEN-API](https://console.green-api.com) и создайте **Telegram**-инстанс
2. Авторизуйте инстанс своим Telegram-аккаунтом — сообщения будут отправляться от его имени
3. В настройках инстанса включите:
   - **Получать уведомления о входящих сообщениях** (`incomingWebhook`)
   - **Получать уведомления о сообщениях, отправленных с телефона** (`outgoingMessageWebhook`) — опционально, чтобы в чате появлялись сообщения, написанные из приложения Telegram
4. Поле `webhookUrl` оставьте пустым — иначе уведомления не попадут в очередь HTTP API
5. Скопируйте `apiUrl`, `idInstance` и `apiTokenInstance` в форму входа

> Применение настроек на стороне GREEN-API может занять несколько минут.

Для проверки понадобится второй Telegram-аккаунт: с него отвечаете на сообщения, отправленные из приложения.

## Как это работает

- **Получение сообщений** — long polling: `ReceiveNotification` с `receiveTimeout=20` держит запрос открытым до появления уведомления. Цикл строго последовательный: следующее уведомление запрашивается только после обработки и удаления текущего (`DeleteNotification`). Очередь отдаёт уведомления по одному, поэтому несколько сообщений подряд приходят последовательно.
- **Только текст** — обрабатываются `textMessage` и `extendedTextMessage`, остальные типы уведомлений удаляются из очереди без отображения.
- **chatId в Telegram** — это числовой ID пользователя, а не номер телефона. При создании чата номер преобразуется в `chatId` через `GetContactInfo`, иначе ответы собеседника попадали бы в отдельный чат.
- **Хранение данных** — учётные данные хранятся в `localStorage` (или `sessionStorage` без «Запомнить меня»), список чатов кэшируется локально и синхронизируется с сервером при входе (`GetChats`, `GetChatHistory`).

> Токен хранится на клиенте, так как по ТЗ пользователь вводит его в браузере, а API GREEN-API передаёт токен в URL запроса. Для production-сценария стоит использовать backend-прокси, который хранит токен на сервере.

## Структура

```
src/
  api/          # обёртка над fetch и методы GREEN-API
  components/   # LoginForm, ChatPage, ChatList, ChatWindow, Message, Avatar
  hooks/        # useChats — состояние чатов, usePolling — получение уведомлений
  lib/          # редьюсер, работа с localStorage
  types/
```
