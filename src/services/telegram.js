import { ConfigService } from './config.js';

export class TelegramService {
  static async #sendMessage(message) {
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
      await fetch(`${url}?${params.toString()}`);
    } catch (error) {
      console.error('Telegram send failed:', error);
    }
  }
  
  static async sendSubscriptionLog(request, groupName) {
    const config = ConfigService.get('telegram');
    if (!config.enabled || (!config.logAllAccess && groupName)) return;

    const ip = request.headers.get('CF-Connecting-IP') || 'N/A';
    const userAgent = request.headers.get('User-Agent') || 'N/A';
    const type = groupName ? `#获取订阅: ${groupName}` : '#异常访问';
    
    const msg = [
        `<b>${type}</b>`,
        `IP: ${ip}`,
        `UA: <tg-spoiler>${userAgent}</tg-spoiler>`
    ].join('\n');

    await this.#sendMessage(msg);
  }

  static async sendAdminLog(action, details = '') {
      const msg = `<b>#管理操作: ${action}</b>\n<tg-spoiler>${details}</tg-spoiler>`;
      await this.#sendMessage(msg);
  }
}