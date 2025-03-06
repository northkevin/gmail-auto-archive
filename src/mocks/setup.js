// This file sets up MSW for different environments
import { createComponentLogger } from '../utils/logger';
const logger = createComponentLogger('MSW-Setup');

// For browser environment
export const setupBrowserMocks = async () => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('Setting up MSW for browser environment');
    try {
      const { worker } = await import('./browser');
      await worker.start({
        onUnhandledRequest: (request, print) => {
          // Only log unhandled requests that are likely API calls
          if (request.url.href.includes('gmail.googleapis.com')) {
            logger.warn(`Unhandled API request: ${request.method} ${request.url.href}`);
            print.warning();
          }
          return 'bypass';
        },
      });
      logger.info('MSW browser mocks started successfully');
      return true;
    } catch (error) {
      logger.error('Failed to start MSW browser mocks', { error });
      return false;
    }
  }
  logger.debug('Skipping MSW setup in non-development environment');
  return Promise.resolve(false);
};

// For Node.js environment (tests)
export const setupNodeMocks = async () => {
  if (process.env.NODE_ENV === 'test') {
    logger.info('Setting up MSW for Node.js environment');
    try {
      const { server } = await import('./server');
      server.listen({
        onUnhandledRequest: 'bypass'
      });
      logger.info('MSW server mocks started successfully');
      return () => {
        logger.info('Closing MSW server');
        server.close();
      };
    } catch (error) {
      logger.error('Failed to start MSW server mocks', { error });
      return () => {};
    }
  }
  logger.debug('Skipping MSW setup in non-test environment');
  return () => {};
};
