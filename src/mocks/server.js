import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { createComponentLogger } from '../utils/logger';

const logger = createComponentLogger('MSW-Server');

logger.debug('Setting up MSW server with handlers');
// This configures a request mocking server for Node.js environment
export const server = setupServer(...handlers);

logger.debug('MSW server configured');
