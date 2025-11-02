import { handleRequest } from './router';

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (err) {
      console.error(err.stack);
      // 可以在这里添加 Telegram 错误通知
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};