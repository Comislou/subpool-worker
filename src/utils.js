export function applyFilter(content, filterConfig) {
  if (!filterConfig || !filterConfig.enabled || !filterConfig.rules || filterConfig.rules.length === 0) {
    return content;
  }
  // 将字符串规则转换为 RegExp 对象
  const regexRules = filterConfig.rules.map(rule => {
      try {
        const match = rule.match(new RegExp('^/(.*?)/([gimy]*)$'));
        return new RegExp(match[1], match[2]);
      } catch (e) {
        return new RegExp(rule); // 兼容非 /.../i 格式的旧规则
      }
  });

  return content.split('\n')
    .filter(line => {
      if (!line.trim()) return true;
      return !regexRules.some(rule => rule.test(line));
    })
    .join('\n');
}

export function isBot(userAgent) {
  return /bot|spider|crawl|slurp|ia_archiver/i.test(userAgent);
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function generateToken() {
    return crypto.randomUUID();
}

/**
 * Checks if a string is a valid Base64 string.
 * @param {string} str - The string to check.
 * @returns {boolean}
 */
export function isValidBase64(str) {
    if (!str || typeof str !== 'string') return false;
    const cleanStr = str.replace(/\s/g, '');
    return /^[A-Za-z0-9+/=]+$/.test(cleanStr) && cleanStr.length % 4 === 0;
}

/**
 * Safely Base64-encodes a string, supporting UTF-8 characters.
 * @param {string} str The string to encode.
 * @returns {string} The Base64-encoded string.
 */
export function safeBtoa(str) {
    return btoa(unescape(encodeURIComponent(str)));
}