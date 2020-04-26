import { Message } from "../../../../schemas";

export default class MessageService {
  messageLog: Message[] = [];
  videoChats: Map<string, Message> = new Map();

  async find() {
    // Just return all our messages
    return this.messageLog;
  }

  async get(chatId: string) {
    return this.videoChats.get(chatId);
  }

  async create(message: Message) {
    this.messageLog.push(message);
    if (message.type == "hostOffer") {
      this.videoChats.set(message.chatId, message);
    }
    // console.log("START ALL MESSAGES");
    // console.log(this.messageLog);
    // console.log("END ALL MESSAGES");
    console.log("START ALL VIDEO CHATS");
    console.log(this.videoChats);
    console.log("END ALL VIDEOs CHATS");
    return message;
  }
}
