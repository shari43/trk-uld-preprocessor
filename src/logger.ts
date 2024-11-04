import pino from 'pino';

// Create a shared Pino logger instance
const logger = pino({ level: 'info' });

export default logger;