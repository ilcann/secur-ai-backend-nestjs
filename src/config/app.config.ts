import { registerAs } from '@nestjs/config';

// 1. Tip güvenliği için interface tanımlama
export interface AppConfig {
  env: string; // Örneğin 'development', 'production', 'test'
  port: number; // Uygulamanın çalışacağı port
  globalPrefix: string; // Global rota öneki (API versiyonlama için ideal)
  swaggerEnabled: boolean; // Swagger dokümantasyonunun etkin olup olmadığı
  swaggerTitle: string;
  swaggerDescription: string;
  swaggerVersion: string;
  swaggerPath: string;
  swaggerBearerName: string;
}

// 2. Yapılandırma objesini 'app' anahtarıyla kaydetme
export const appConfig = registerAs('app', (): AppConfig => {
  // Environment Değişkenlerinden değerleri al
  const port = parseInt(process.env.BACKEND_PORT ?? '4000', 10);
  const env = process.env.NODE_ENV || 'development';
  const globalPrefix = process.env.API_GLOBAL_PREFIX || 'api';

  // Swagger ayarları (Environment değişkenlerinden veya sabit değerlerden)
  const swaggerEnabled =
    process.env.SWAGGER_ENABLED === 'true' || env === 'development';
  const swaggerTitle = process.env.SWAGGER_TITLE || 'Filter Engine API';
  const swaggerDescription =
    process.env.SWAGGER_DESCRIPTION || 'Filter Engine API Documentation';
  const swaggerVersion = process.env.SWAGGER_VERSION || '1.0';
  const swaggerPath = process.env.SWAGGER_PATH || 'api/docs';
  const swaggerBearerName = 'accessToken';

  // Zorunlu alan kontrolü (Gerekirse)
  // Bu genel config için zorunlu alan kontrolü yapmaya genellikle gerek kalmaz, varsayılan değerler kullanılır.

  return {
    env: env,
    port: port,
    globalPrefix: globalPrefix,
    swaggerEnabled: swaggerEnabled,
    swaggerTitle: swaggerTitle,
    swaggerDescription: swaggerDescription,
    swaggerVersion: swaggerVersion,
    swaggerPath: swaggerPath,
    swaggerBearerName: swaggerBearerName,
  };
});
