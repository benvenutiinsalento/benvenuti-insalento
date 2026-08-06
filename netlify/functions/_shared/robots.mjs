const cache = new Map();

function parseRobots(text, userAgent = 'BenvenutiInSalentoEventBot') {
  const groups = [];
  let current = null;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [fieldRaw, ...rest] = line.split(':');
    const field = fieldRaw.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (field === 'user-agent') {
      if (!current || current.hasRules) {
        current = { agents: [], allow: [], disallow: [], hasRules: false };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (current && (field === 'allow' || field === 'disallow')) {
      current[field].push(value);
      current.hasRules = true;
    }
  }
  const ua = userAgent.toLowerCase();
  const applicable = groups.filter((group) => group.agents.some((agent) => agent === '*' || ua.includes(agent)));
  return (pathname) => {
    let winner = { length: -1, allowed: true };
    for (const group of applicable) {
      for (const rule of group.allow) if (rule && pathname.startsWith(rule) && rule.length > winner.length) winner = { length: rule.length, allowed: true };
      for (const rule of group.disallow) if (rule && pathname.startsWith(rule) && rule.length > winner.length) winner = { length: rule.length, allowed: false };
    }
    return winner.allowed;
  };
}

export async function robotsAllows(url, userAgent) {
  const target = new URL(url);
  const key = target.origin;
  if (!cache.has(key)) {
    const promise = fetch(`${target.origin}/robots.txt`, {
      headers: { 'user-agent': `${userAgent}/1.0 (+https://benvenutiinsalento.it)` },
      signal: AbortSignal.timeout(8000),
    }).then(async (response) => {
      if (response.status === 404) return () => true;
      if (!response.ok) return () => false;
      return parseRobots(await response.text(), userAgent);
    }).catch(() => () => false);
    cache.set(key, promise);
  }
  const checker = await cache.get(key);
  return checker(target.pathname || '/');
}
