export interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: number;
}

export interface Chat {
  chatId: string;
  messages: Message[];
}
