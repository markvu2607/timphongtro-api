export const validateEnvironment = (
  env: string,
): 'development' | 'production' | 'test' => {
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(env)) {
    throw new Error(`Invalid environment: ${env}`);
  }

  return env as 'development' | 'production' | 'test';
};
