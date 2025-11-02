import { KVService } from './kv.js';

// 定义一套基础的默认配置
const DEFAULT_CONFIG = {
  adminPassword: '', // 强烈建议在 KV 中设置
  blockBots: true,
  fileName: 'cf-worker-sub',
  subUpdateTime: 4,
  subscriptionInfo: {
      totalTB: 99,
      expireDate: '2099-12-31',
  },
  telegram: {
    enabled: false,
    botToken: '',
    chatId: '',
    logAllAccess: false,
  },
  subconverter: {
    url: 'subsec.illusionlie.com',
    protocol: 'https',
    configUrl: 'https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini',
  },
};

let _config = null;
let _env = null;

export class ConfigService {
  static async init(env) {
    _env = env;
    const kvConfig = await KVService.getGlobalConfig().catch(() => null) || {};
    // 深层合并，防止覆盖整个对象
    _config = {
      ...DEFAULT_CONFIG,
      ...kvConfig,
      telegram: { ...DEFAULT_CONFIG.telegram, ...kvConfig.telegram },
      subconverter: { ...DEFAULT_CONFIG.subconverter, ...kvConfig.subconverter },
      subscriptionInfo: { ...DEFAULT_CONFIG.subscriptionInfo, ...kvConfig.subscriptionInfo },
    };
  }

  static get(key) {
    return key ? _config[key] : _config;
  }

  static getKV() {
    return _env.KV;
  }
}