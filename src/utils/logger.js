const levels = ['error', 'warn', 'info', 'debug'];

const currentLevel = process.env.LOG_LEVEL || 'info';
const currentIdx = levels.indexOf(currentLevel) === -1 ? 2 : levels.indexOf(currentLevel);

function format(level, message, meta) {
  const ts = new Date().toISOString();
  const base = { level, time: ts, message };
  const payload = meta ? { ...base, ...meta } : base;
  return JSON.stringify(payload);
}

function log(level, message, meta) {
  const idx = levels.indexOf(level);
  if (idx === -1 || idx > currentIdx) return;
  // eslint-disable-next-line no-console
  console.log(format(level, message, meta));
}

module.exports = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  debug: (message, meta) => log('debug', message, meta)
};
