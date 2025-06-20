// Re-export the environment utilities with proper typing
const env = {
  isDev: () => process.env.NODE_ENV === 'development',
  isProd: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test'
};

export const { isDev, isProd, isTest } = env;

export type Environment = {
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
};
