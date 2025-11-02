import { ConfigService } from '../services/config.js';
import { KVService } from '../services/kv.js';
import { renderAdminPage } from '../views/admin.html.js';
import { jsonResponse, generateToken } from '../utils.js';
import { TelegramService } from '../services/telegram.js';


async function isAuthenticated(request) {
  const password = ConfigService.get('adminPassword');
  // 如果未在 KV 中设置密码，则认为认证通过（用于首次设置）
  if (!password) {
      const config = await KVService.getGlobalConfig();
      if (!config || !config.adminPassword) return true;
  }
  
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return authHeader.substring(7) === password;
}

async function handleApiRequest(request) {
    if (!await isAuthenticated(request)) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const url = new URL(request.url);
    const method = request.method;
    const pathParts = url.pathname.split('/').filter(Boolean); // ['admin', 'api', 'groups', 'token123']

    // 路由到不同的 API 处理器
    if (pathParts[2] === 'config' && method === 'GET') {
        const config = await KVService.getGlobalConfig() || ConfigService.get();
        return jsonResponse(config);
    }
    if (pathParts[2] === 'config' && method === 'PUT') {
        const newConfig = await request.json();
        // 合并而不是完全替换，防止丢失未在前端展示的配置项
        const oldConfig = await KVService.getGlobalConfig() || {};
        const mergedConfig = { ...oldConfig, ...newConfig };
        await KVService.saveGlobalConfig(mergedConfig);
        await TelegramService.sendAdminLog('更新全局配置');
        return jsonResponse({ success: true });
    }
    if (pathParts[2] === 'groups' && method === 'GET') {
        const groups = await KVService.getAllGroups();
        return jsonResponse(groups);
    }
    if (pathParts[2] === 'groups' && method === 'POST') {
        const newGroup = await request.json();
        if (!newGroup.token) newGroup.token = generateToken();
        await KVService.saveGroup(newGroup);
        await TelegramService.sendAdminLog('创建订阅组', `名称: ${newGroup.name}`);
        return jsonResponse(newGroup);
    }
    if (pathParts[2] === 'groups' && pathParts[3] && method === 'PUT') {
        const token = pathParts[3];
        const groupData = await request.json();
        groupData.token = token;
        await KVService.saveGroup(groupData);
        await TelegramService.sendAdminLog('更新订阅组', `名称: ${groupData.name}`);
        return jsonResponse(groupData);
    }
    if (pathParts[2] === 'groups' && pathParts[3] && method === 'DELETE') {
        const token = pathParts[3];
        await KVService.deleteGroup(token);
        await TelegramService.sendAdminLog('删除订阅组', `Token: ${token}`);
        return jsonResponse({ success: true });
    }
    if (pathParts[2] === 'utils' && pathParts[3] === 'gentoken' && method === 'GET') {
        return jsonResponse({ token: generateToken() });
    }

    return jsonResponse({ error: 'Not Found' }, 404);
}


export async function handleAdminRequest(request) {
  const url = new URL(request.url);
  
  // 1. 如果是API请求, 交给API处理器 (它内部会进行认证)
  if (url.pathname.startsWith('/admin/api/')) {
    return handleApiRequest(request);
  }

  // 2. 如果是获取页面的GET请求, 直接渲染页面外壳
  if (request.method === 'GET') {
    // 不再预加载数据，前端JS将负责获取
    const html = renderAdminPage();
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  return new Response('Method Not Allowed', { status: 405 });
}