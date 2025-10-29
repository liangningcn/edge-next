import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/storage';

export const runtime = 'edge';

// POST /api/[locale]/upload - 文件上传
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;
    
    // 验证语言支持
    const supportedLocales = ["en", "de", "ja", "fr", "th", "es", "ru", "pt", "it", "nl", "pl", "ko", "id"];
    const validLocale = supportedLocales.includes(locale) ? locale : 'en';

    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    const prefix = formData.get('prefix') as string || 'assets';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // 上传文件到R2
    const key = await storageService.uploadLocalizedAsset(file, validLocale, {
      category,
      prefix
    });

    const url = storageService.getAssetUrl(key);

    return NextResponse.json({
      success: true,
      data: {
        key,
        url,
        filename: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET /api/[locale]/upload - 获取上传的文件列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;
    
    // 验证语言支持
    const supportedLocales = ["en", "de", "ja", "fr", "th", "es", "ru", "pt", "it", "nl", "pl", "ko", "id"];
    const validLocale = supportedLocales.includes(locale) ? locale : 'en';

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    const prefix = searchParams.get('prefix') || 'assets';
    const limit = parseInt(searchParams.get('limit') || '50');

    // 获取文件列表
    const assets = await storageService.listAssets(validLocale, {
      category,
      prefix,
      limit
    });

    const files = assets.map(key => ({
      key,
      url: storageService.getAssetUrl(key),
      filename: key.split('/').pop()
    }));

    return NextResponse.json({
      success: true,
      data: {
        files,
        pagination: {
          total: files.length,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list files' },
      { status: 500 }
    );
  }
}