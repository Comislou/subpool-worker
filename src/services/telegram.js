import { ConfigService } from './config.js';

export class TelegramService {
  static async sendMessage(message) {
    const config = ConfigService.get('telegram');
    if (!config.enabled || !config.botToken || !config.chatId) {
      return;
    }

    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const params = new URLSearchParams({
      chat_id: config.chatId,
      text: message,
      parse_mode: 'HTML'
    });

    try {
      // 使用 ctx.waitUntil 避免阻塞响应
      const ctx = ConfigService.getCtx();
      if (ctx) {
        ctx.waitUntil(fetch(`${url}?${params.toString()}`));
      } else {
        await fetch(`${url}?${params.toString()}`);
      }
    } catch (error) {
      // 如果TG发送失败，我们只能在控制台记录，避免循环依赖
      console.error('Telegram send failed:', JSON.stringify(error));
    }
  }
}