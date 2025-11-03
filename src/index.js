import { handleRequest } from './router';
import LoggerService from './services/logger.js';

export default {
  async fetch(request, env, ctx) {
    const logger = new LoggerService(request, env, ctx);
    try {
      return await handleRequest(request, env, ctx, logger);
    } catch (err) {
      logger.error(err, { customMessage: 'Unhandled exception in fetch handler' });
      // 可以在这里添加 Telegram 错误通知
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};