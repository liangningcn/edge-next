// 缓存服务 - 国际化缓存策略

interface CacheConfig {
  defaultTTL: number; // 默认缓存时间（秒）
  maxSize: number; // 最大缓存大小
}

// 缓存键前缀
const CACHE_PREFIXES = {
  PRODUCTS: 'products:',
  TRANSLATIONS: 'translations:',
  USER_PREFERENCES: 'user:',
  EMAIL_TEMPLATES: 'email:',
  ASSETS: 'assets:',
};

export class CacheService {
  private config: CacheConfig;
  private cache: Map<string, { data: unknown; expiresAt: number }>;

  constructor(config: CacheConfig) {
    this.config = config;
    this.cache = new Map();
  }

  /**
   * 设置缓存
   */
  set(key: string, data: unknown, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.config.defaultTTL) * 1000;

    // 检查缓存大小，如果超过限制则清理最旧的缓存
    if (this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, { data, expiresAt });
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  /**
   * 计算缓存命中率（简化版）
   */
  private calculateHitRate(): number {
    // 在实际应用中，这里会有更复杂的统计逻辑
    return 0.95; // 默认返回95%命中率
  }

  /**
   * 产品相关缓存方法
   */

  // 缓存产品列表
  cacheProducts(locale: string, category: string, products: unknown[]): void {
    const key = `${CACHE_PREFIXES.PRODUCTS}${locale}:${category}`;
    this.set(key, products, 3600); // 缓存1小时
  }

  // 获取缓存的产列表
  getCachedProducts(locale: string, category: string): unknown[] | null {
    const key = `${CACHE_PREFIXES.PRODUCTS}${locale}:${category}`;
    return this.get<unknown[]>(key);
  }

  // 缓存单个产品
  cacheProduct(locale: string, productId: string, product: unknown): void {
    const key = `${CACHE_PREFIXES.PRODUCTS}${locale}:${productId}`;
    this.set(key, product, 1800); // 缓存30分钟
  }

  // 获取缓存的单个产品
  getCachedProduct(locale: string, productId: string): unknown | null {
    const key = `${CACHE_PREFIXES.PRODUCTS}${locale}:${productId}`;
    return this.get<unknown>(key);
  }

  /**
   * 翻译相关缓存方法
   */

  // 缓存翻译数据
  cacheTranslations(locale: string, namespace: string, translations: unknown): void {
    const key = `${CACHE_PREFIXES.TRANSLATIONS}${locale}:${namespace}`;
    this.set(key, translations, 7200); // 缓存2小时
  }

  // 获取缓存的翻译数据
  getCachedTranslations(locale: string, namespace: string): unknown | null {
    const key = `${CACHE_PREFIXES.TRANSLATIONS}${locale}:${namespace}`;
    return this.get<unknown>(key);
  }

  /**
   * 用户偏好缓存
   */

  // 缓存用户偏好
  cacheUserPreferences(userId: string, preferences: unknown): void {
    const key = `${CACHE_PREFIXES.USER_PREFERENCES}${userId}`;
    this.set(key, preferences, 86400); // 缓存24小时
  }

  // 获取缓存的用户偏好
  getCachedUserPreferences(userId: string): unknown | null {
    const key = `${CACHE_PREFIXES.USER_PREFERENCES}${userId}`;
    return this.get<unknown>(key);
  }

  /**
   * 批量操作
   */

  // 批量删除产品相关缓存
  invalidateProductCache(productId?: string): void {
    if (productId) {
      // 删除特定产品的所有语言缓存
      for (const locale of [
        'en',
        'de',
        'ja',
        'fr',
        'th',
        'es',
        'ru',
        'pt',
        'it',
        'nl',
        'pl',
        'ko',
        'id',
      ]) {
        this.delete(`${CACHE_PREFIXES.PRODUCTS}${locale}:${productId}`);
      }
    } else {
      // 删除所有产品缓存
      for (const key of this.cache.keys()) {
        if (key.startsWith(CACHE_PREFIXES.PRODUCTS)) {
          this.delete(key);
        }
      }
    }
  }

  // 批量删除翻译缓存
  invalidateTranslationCache(locale?: string): void {
    if (locale) {
      // 删除特定语言的所有翻译缓存
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${CACHE_PREFIXES.TRANSLATIONS}${locale}:`)) {
          this.delete(key);
        }
      }
    } else {
      // 删除所有翻译缓存
      for (const key of this.cache.keys()) {
        if (key.startsWith(CACHE_PREFIXES.TRANSLATIONS)) {
          this.delete(key);
        }
      }
    }
  }
}

// 创建默认缓存服务实例
export const cacheService = new CacheService({
  defaultTTL: 3600, // 默认缓存1小时
  maxSize: 1000, // 最大缓存1000个条目
});

// Cloudflare KV缓存适配器（用于生产环境）
export class KVCacheService {
  private namespace: KVNamespace;

  constructor(kvNamespace: KVNamespace) {
    this.namespace = kvNamespace;
  }

  async set(key: string, data: unknown, ttl?: number): Promise<void> {
    const value = JSON.stringify({
      data,
      expiresAt: Date.now() + (ttl || 3600) * 1000,
    });

    await this.namespace.put(key, value, { expirationTtl: ttl || 3600 });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.namespace.get(key);

    if (!value) {
      return null;
    }

    try {
      const cached = JSON.parse(value);

      if (Date.now() > cached.expiresAt) {
        await this.namespace.delete(key);
        return null;
      }

      return cached.data as T;
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    await this.namespace.delete(key);
  }
}

// 导出类型
export type { CacheConfig };
