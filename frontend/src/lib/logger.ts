import log from 'loglevel';

const isDev = import.meta.env.DEV;

log.setLevel(isDev ? 'info' : 'warn');

export const logger = log;
