const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const threshold = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info;

function format(level, args) {
  const timestamp = new Date().toISOString();
  const last = args[args.length - 1];
  const parts = args.slice(0, last instanceof Error ? -1 : args.length);
  const message = parts.length > 0 ? parts.join(" ") : "";
  const detail = last instanceof Error ? `\n${last.stack}` : message ? ` ${message}` : "";
  return `[${timestamp}] ${level.toUpperCase().padEnd(5)}${detail}`;
}

function log(level, args) {
  if (LEVELS[level] > threshold) return;
  const line = format(level, args);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (...args) => log("debug", args),
  info: (...args) => log("info", args),
  warn: (...args) => log("warn", args),
  error: (...args) => log("error", args),
};