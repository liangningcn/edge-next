import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/storage';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// POST /api/[locale]/upload/products - 上传产品图片
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;

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

    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productSku = formData.get('productSku') as string;
    const imageType = (formData.get('imageType') as string) || 'main';

    if (!file || !productSku) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: file and productSku' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        },
        { status: 400 }
      );
    }

    // 验证文件大小（最大5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // 验证图片类型
    const validImageTypes = ['main', 'detail', 'gallery'];
    if (!validImageTypes.includes(imageType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image type. Must be one of: main, detail, gallery' },
        { status: 400 }
      );
    }

    // 上传产品图片到R2
    const key = await storageService.uploadProductImage(
      file,
      productSku,
      validLocale,
      imageType as 'main' | 'detail' | 'gallery'
    );

    const url = storageService.getAssetUrl(key);

    return NextResponse.json({
      success: true,
      data: {
        key,
        url,
        productSku,
        imageType,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload product image' },
      { status: 500 }
    );
  }
}

// GET /api/[locale]/upload/products - 获取产品图片
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;

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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const productSku = searchParams.get('productSku');

    if (!productSku) {
      return NextResponse.json(
        { success: false, error: 'Missing productSku parameter' },
        { status: 400 }
      );
    }

    // 获取产品所有图片
    const images = await storageService.getProductImages(productSku, validLocale);

    return NextResponse.json({
      success: true,
      data: {
        productSku,
        images,
      },
    });
  } catch (error) {
    console.error('Error getting product images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get product images' },
      { status: 500 }
    );
  }
}
