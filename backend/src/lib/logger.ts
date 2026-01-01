import pino from 'pino';

const isDev = Bun.env.NODE_ENV !== 'production';

export const logger = pino({
  level: Bun.env.LOG_LEVEL || 'info',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
    },
  }),
});
