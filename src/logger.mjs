import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

const transport = !isProd
 ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l', singleLine: false, ignore: 'pid,hostname' } }
 : undefined;

const logger = pino({
 level: process.env.LOG_LEVEL || 'info',
 redact: {
 paths: ['req.headers.authorization', 'req.headers.x-agent-token'],
 censor: '[REDACTED]'
 }
}, transport);

export default logger;
