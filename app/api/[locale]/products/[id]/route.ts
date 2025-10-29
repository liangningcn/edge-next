import { NextRequest, NextResponse } from 'next/server';
import { LocalizedQuery, prisma } from '@/lib/db';

export const runtime = 'edge';

// GET /api/[locale]/products/[id] - 获取单个产品详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; id: string }> }
) {
  try {
    const { locale, id } = await params;
    
    // 验证语言支持
    const supportedLocales = ["en", "de", "ja", "fr", "th", "es", "ru", "pt", "it", "nl", "pl", "ko", "id"];
    const validLocale = supportedLocales.includes(locale) ? locale : 'en';

    // 获取产品信息
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        translations: {
          where: { 
            OR: [
              { locale: validLocale },
              { locale: 'en' }
            ]
          },
          orderBy: {
            locale: 'desc'
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // 获取相关产品（同分类）
    const relatedProducts = await LocalizedQuery.getLocalizedProducts(validLocale, {
      category: product.category,
      limit: 4
    });

    const productTranslation = product.translations[0];

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: product.id,
          sku: product.sku,
          price: product.price,
          inventory: product.inventory,
          category: product.category,
          isActive: product.isActive,
          name: productTranslation?.name || 'Product Name',
          description: productTranslation?.description || '',
          features: productTranslation?.features || {},
          images: [
            `https://image.topqfiller.com/products/${product.sku.toLowerCase()}.webp`,
            `https://image.topqfiller.com/products/${product.sku.toLowerCase()}1.webp`
          ],
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        },
        relatedProducts: relatedProducts.map(p => ({
          id: p.id,
          sku: p.sku,
          price: p.price,
          name: p.translation?.name || 'Product Name',
          image: `https://image.topqfiller.com/products/${p.sku.toLowerCase()}.webp`
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/[locale]/products/[id] - 更新产品信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; id: string }> }
) {
  try {
    const { locale, id } = await params;
    const body = await request.json();

    // 验证语言支持
    const supportedLocales = ["en", "de", "ja", "fr", "th", "es", "ru", "pt", "it", "nl", "pl", "ko", "id"];
    const validLocale = supportedLocales.includes(locale) ? locale : 'en';

    const { price, inventory, category, isActive, translation } = body;

    // 更新产品基本信息
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(inventory !== undefined && { inventory: parseInt(inventory) }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // 更新翻译信息
    if (translation) {
      await LocalizedQuery.updateProductTranslation(id, validLocale, {
        name: translation.name,
        description: translation.description,
        features: translation.features
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/[locale]/products/[id] - 删除产品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; id: string }> }
) {
  try {
    const { id } = await params;

    // 软删除：将产品标记为不活跃
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}