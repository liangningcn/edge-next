// R2存储服务 - 多语言资源管理

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

// 支持的语言列表
const SUPPORTED_LOCALES = [
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
] as const;

export class R2StorageService {
  private config: R2Config;

  constructor(config: R2Config) {
    this.config = config;
  }

  /**
   * 验证语言支持
   */
  private validateLocale(locale: string): string {
    return SUPPORTED_LOCALES.includes(locale as string) ? locale : 'en';
  }

  /**
   * 上传多语言资源文件
   */
  async uploadLocalizedAsset(
    file: File,
    locale: string,
    options?: {
      category?: string;
      prefix?: string;
    }
  ): Promise<string> {
    const validLocale = this.validateLocale(locale);
    const category = options?.category || 'general';
    const prefix = options?.prefix || 'assets';

    // 生成唯一文件名
    const fileExtension = file.name.split('.').pop() || 'bin';
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    // 构建存储路径
    const key = `${prefix}/${validLocale}/${category}/${fileName}`;

    try {
      // 这里使用Cloudflare R2的S3兼容API
      // 在实际部署中，需要通过环境变量配置R2访问凭据
      const response = await this.putObject(key, file);

      return key;
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * 获取资源URL
   */
  getAssetUrl(key: string): string {
    // 使用Cloudflare R2的公共访问URL
    // 实际URL格式：https://<account-id>.r2.cloudflarestorage.com/<bucket-name>/<key>
    return `https://${this.config.accountId}.r2.cloudflarestorage.com/${this.config.bucketName}/${key}`;
  }

  /**
   * 获取多语言资源URL
   */
  getLocalizedAssetUrl(
    filename: string,
    locale: string,
    options?: {
      category?: string;
      prefix?: string;
    }
  ): string {
    const validLocale = this.validateLocale(locale);
    const category = options?.category || 'general';
    const prefix = options?.prefix || 'assets';

    const key = `${prefix}/${validLocale}/${category}/${filename}`;
    return this.getAssetUrl(key);
  }

  /**
   * 删除资源文件
   */
  async deleteAsset(key: string): Promise<void> {
    try {
      await this.deleteObject(key);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * 列出指定语言和分类的资源
   */
  async listAssets(
    locale: string,
    options?: {
      category?: string;
      prefix?: string;
      limit?: number;
    }
  ): Promise<string[]> {
    const validLocale = this.validateLocale(locale);
    const category = options?.category || 'general';
    const prefix = options?.prefix || 'assets';
    const limit = options?.limit || 100;

    const prefixPath = `${prefix}/${validLocale}/${category}/`;

    try {
      const objects = await this.listObjects(prefixPath, limit);
      return objects.map(obj => obj.key);
    } catch (error) {
      console.error('Error listing R2 objects:', error);
      return [];
    }
  }

  /**
   * 产品图片管理
   */

  /**
   * 上传产品图片
   */
  async uploadProductImage(
    file: File,
    productSku: string,
    locale: string,
    imageType: 'main' | 'detail' | 'gallery' = 'main'
  ): Promise<string> {
    const validLocale = this.validateLocale(locale);

    // 生成图片文件名
    const fileExtension = file.name.split('.').pop() || 'webp';
    const fileName = `${productSku.toLowerCase()}-${imageType}.${fileExtension}`;

    const key = `products/${validLocale}/${fileName}`;

    try {
      await this.putObject(key, file, {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      });

      return key;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw new Error('Failed to upload product image');
    }
  }

  /**
   * 获取产品图片URL
   */
  getProductImageUrl(
    productSku: string,
    locale: string,
    imageType: 'main' | 'detail' | 'gallery' = 'main'
  ): string {
    const validLocale = this.validateLocale(locale);
    const fileName = `${productSku.toLowerCase()}-${imageType}.webp`;

    const key = `products/${validLocale}/${fileName}`;
    return this.getAssetUrl(key);
  }

  /**
   * 获取产品所有图片
   */
  async getProductImages(
    productSku: string,
    locale: string
  ): Promise<{
    main: string;
    detail?: string;
    gallery: string[];
  }> {
    const validLocale = this.validateLocale(locale);
    const prefix = `products/${validLocale}/${productSku.toLowerCase()}`;

    try {
      const objects = await this.listObjects(prefix);

      const images = {
        main: '',
        detail: '',
        gallery: [] as string[],
      };

      objects.forEach(obj => {
        const url = this.getAssetUrl(obj.key);

        if (obj.key.includes('-main.')) {
          images.main = url;
        } else if (obj.key.includes('-detail.')) {
          images.detail = url;
        } else if (obj.key.includes('-gallery-')) {
          images.gallery.push(url);
        }
      });

      return images;
    } catch (error) {
      console.error('Error getting product images:', error);
      return {
        main: this.getProductImageUrl(productSku, locale, 'main'),
        gallery: [],
      };
    }
  }

  /**
   * 私有方法 - 实际R2操作
   */

  private async putObject(
    key: string,
    file: File,
    options?: {
      contentType?: string;
      cacheControl?: string;
    }
  ): Promise<any> {
    // 在实际部署中，这里会调用R2的S3兼容API
    // 使用环境变量中的凭据进行认证

    const formData = new FormData();
    formData.append('file', file);

    // 模拟R2上传操作
    // 实际实现需要使用@aws-sdk/client-s3或类似的库
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ key, success: true });
      }, 100);
    });
  }

  private async deleteObject(key: string): Promise<void> {
    // 模拟R2删除操作
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  private async listObjects(prefix: string, limit: number = 100): Promise<Array<{ key: string }>> {
    // 模拟R2列表操作
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([{ key: prefix + 'example-file.webp' }]);
      }, 100);
    });
  }
}

// 创建默认存储服务实例
export const storageService = new R2StorageService({
  accountId: process.env.R2_ACCOUNT_ID || 'c42aa3032fe25e2758e1f653d407d62c',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.R2_BUCKET_NAME || 'image',
});

// 导出工具函数
export function generateImageUrls(productSku: string) {
  return {
    main: `https://image.topqfiller.com/products/${productSku.toLowerCase()}.webp`,
    detail: `https://image.topqfiller.com/products/${productSku.toLowerCase()}1.webp`,
    banner: `https://image.topqfiller.com/banner/banner0${Math.floor(Math.random() * 6) + 1}.webp`,
  };
}
