import {join} from 'path';


export const mode = process.env.NODE_ENV ?? 'production';
export const isProd = mode === 'production';
export const isDev = !isProd;
export const deploymentEnv = process.env.DEPLOYMENT_ENV;
export const rootDir = join(__dirname, '..', '..');
export const webpackDir = join(__dirname, '..');
export const defaultPort = 9000;
export const devServerHost = '0.0.0.0';
