import { NextRequest, NextResponse } from 'next/server';
import { LocalizedQuery } from '@/lib/db';

// GET /api/[locale]/products - 获取产品列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 验证语言支持
    const supportedLocales = [
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
    ];
    const validLocale = supportedLocales.includes(locale) ? locale : 'en';

    // 使用validLocale避免未使用警告
    console.log('Using locale:', validLocale);

    // 获取本地化产品列表
    const products = await LocalizedQuery.getLocalizedProducts(validLocale, {
      category: category || undefined,
      limit,
      offset,
    });

    // 获取产品分类
    const categories = await LocalizedQuery.getLocalizedCategories(validLocale);

    return NextResponse.json({
      success: true,
      data: {
        products: products.map((product: (typeof products)[number]) => ({
          id: product.id,
          sku: product.sku,
          price: product.price,
          inventory: product.inventory,
          category: product.category,
          name: product.translation?.name || 'Product Name',
          description: product.translation?.description || '',
          features: product.translation?.features || {},
          image: `https://image.topqfiller.com/products/${product.sku.toLowerCase()}.webp`,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
        categories,
        pagination: {
          total: products.length,
          limit,
          offset,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/[locale]/products - 创建新产品（管理员功能）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;
    const body = (await request.json()) as {
      sku: string;
      price: string | number;
      inventory: string | number;
      category: string;
      translations?: Array<{
        locale: string;
        name: string;
        description?: string;
        features?: Record<string, unknown>;
      }>;
    };

    // 验证语言支持
    const supportedLocales = [
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
    ];
    const validLocale = supportedLocales.includes(locale) ? locale : 'en';

    // 使用validLocale避免未使用警告
    console.log('Using locale:', validLocale);

    // 验证请求数据
    const { sku, price, inventory, category, translations } = body;

    if (!sku || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 创建产品
    const product = await LocalizedQuery.createLocalizedProduct({
      sku,
      price: typeof price === 'number' ? price : parseFloat(price),
      inventory: typeof inventory === 'number' ? inventory : parseInt(inventory) || 0,
      category,
      translations: translations || [],
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
