import { handleAdminRequest } from './handlers/admin.js';
import { handleSubscriptionRequest } from './handlers/subscription.js';
import { renderNginxWelcomePage } from './views/nginx.html.js';
import { ConfigService } from './services/config.js';

export async function handleRequest(request, env, ctx) {
  // 每次请求都初始化/加载最新的配置
  await ConfigService.init(env);

  const url = new URL(request.url);
  const pathname = url.pathname;

  // 管理后台路由
  if (pathname.startsWith('/admin')) {
    return handleAdminRequest(request, env);
  }

  // 提取 token (路径的第一部分)
  const token = pathname.slice(1).split('/')[0];
  if (token && token !== 'favicon.ico') {
    return handleSubscriptionRequest(request, token);
  }

  // 根路径或任何其他未知路径
  return new Response(renderNginxWelcomePage(), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
  });
}