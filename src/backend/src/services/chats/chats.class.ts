import shortid from "shortid";

interface Chat {
  id: string;
}

export default class ChatService {
  chats: Map<string, Chat> = new Map();

  async create() {
    const id = shortid.generate();
    const chat = { id };
    this.chats.set(id, chat);

    return chat;
  }

  async remove(id: string) {
    return this.chats.delete(id);
  }
}
