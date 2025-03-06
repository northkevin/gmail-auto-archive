// Create the logger with a simplified configuration
const logger = {
  debug: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [DEBUG]: ${message}`, formatMeta(meta));
  },
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO]: ${message}`, formatMeta(meta));
  },
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN]: ${message}`, formatMeta(meta));
  },
  error: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR]: ${message}`, formatMeta(meta));
  }
};

// Helper function to format metadata and properly handle error objects
function formatMeta(meta) {
  const formattedMeta = { ...meta };

  // If there's an error property, extract useful information from it
  if (formattedMeta.error) {
    const error = formattedMeta.error;
    if (error instanceof Error) {
      formattedMeta.errorMessage = error.message;
      formattedMeta.errorStack = error.stack;
      delete formattedMeta.error; // Remove the original error object
    } else if (typeof error === 'string') {
      formattedMeta.errorMessage = error;
    }
  }

  return formattedMeta;
}

// Add a simple wrapper to add component context
export const createComponentLogger = (component) => ({
  debug: (message, meta = {}) => logger.debug(message, { component, ...meta }),
  info: (message, meta = {}) => logger.info(message, { component, ...meta }),
  warn: (message, meta = {}) => logger.warn(message, { component, ...meta }),
  error: (message, meta = {}) => logger.error(message, { component, ...meta }),
});

// Default export
export default logger;
