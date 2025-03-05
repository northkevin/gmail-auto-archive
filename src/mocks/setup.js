// This file sets up MSW for different environments

// For browser environment
export const setupBrowserMocks = async () => {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./browser');
    return worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    });
  }
  return Promise.resolve();
};

// For Node.js environment (tests)
export const setupNodeMocks = async () => {
  if (process.env.NODE_ENV === 'test') {
    const { server } = await import('./server');
    server.listen({ onUnhandledRequest: 'bypass' });
    return () => server.close();
  }
  return () => {};
};
