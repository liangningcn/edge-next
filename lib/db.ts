import { PrismaClient } from '@prisma/client';

// 全局变量声明
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 创建Prisma客户端实例
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 多语言查询辅助函数
export class LocalizedQuery {
  
  /**
   * 获取本地化产品信息
   */
  static async getLocalizedProduct(sku: string, locale: string) {
    return prisma.product.findUnique({
      where: { sku },
      include: {
        translations: {
          where: { 
            OR: [
              { locale }, // 优先请求语言
              { locale: 'en' } // 回退到英语
            ]
          },
          orderBy: {
            locale: 'desc' // 确保顺序一致
          }
        }
      }
    });
  }

  /**
   * 获取本地化产品列表
   */
  static async getLocalizedProducts(locale: string, options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }) {
    const where = {
      isActive: true,
      ...(options?.category && { category: options.category })
    };

    const products = await prisma.product.findMany({
      where,
      include: {
        translations: {
          where: { 
            OR: [
              { locale },
              { locale: 'en' }
            ]
          },
          orderBy: {
            locale: 'desc'
          }
        }
      },
      take: options?.limit || 100,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'desc' }
    });

    // 处理翻译数据，确保每个产品都有对应的翻译
    return products.map(product => ({
      ...product,
      translation: product.translations[0] || null
    }));
  }

  /**
   * 获取产品分类列表（本地化）
   */
  static async getLocalizedCategories(locale: string) {
    const categories = await prisma.product.findMany({
      where: { isActive: true },
      distinct: ['category'],
      select: { category: true }
    });

    // 这里可以添加分类名称的本地化映射
    const categoryMap: Record<string, string> = {
      'fine_lines': 'Fine Lines',
      'dermal_fillers': 'Dermal Fillers', 
      'deep_wrinkles': 'Deep Wrinkles',
      'ultra_deep': 'Ultra Deep',
      'volume_enhancement': 'Volume Enhancement',
      'special_formulations': 'Special Formulations'
    };

    return categories.map(cat => ({
      value: cat.category,
      label: categoryMap[cat.category] || cat.category
    }));
  }

  /**
   * 创建多语言产品
   */
  static async createLocalizedProduct(data: {
    sku: string;
    price: number;
    inventory: number;
    category: string;
    translations: Array<{
      locale: string;
      name: string;
      description?: string;
      features?: any;
    }>
  }) {
    return prisma.product.create({
      data: {
        sku: data.sku,
        price: data.price,
        inventory: data.inventory,
        category: data.category,
        translations: {
          create: data.translations.map(trans => ({
            locale: trans.locale,
            name: trans.name,
            description: trans.description,
            features: trans.features
          }))
        }
      },
      include: {
        translations: true
      }
    });
  }

  /**
   * 更新产品翻译
   */
  static async updateProductTranslation(productId: string, locale: string, data: {
    name?: string;
    description?: string;
    features?: any;
  }) {
    return prisma.productTranslation.upsert({
      where: {
        productId_locale: {
          productId,
          locale
        }
      },
      update: data,
      create: {
        productId,
        locale,
        name: data.name || '',
        description: data.description,
        features: data.features
      }
    });
  }
}

// 导出类型
export type { Product, ProductTranslation, User, Order, Inquiry } from '@prisma/client';