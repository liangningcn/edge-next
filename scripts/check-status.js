#!/usr/bin/env node

/**
 * TOP-Q Filler 项目状态检查脚本
 * 验证项目配置、依赖和功能是否正常
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TOP-Q Filler 项目状态检查...\n');

// 检查结果
const results = {
  config: {},
  dependencies: {},
  files: {},
  locales: {}
};

// 1. 检查配置文件
console.log('📋 配置文件检查:');
const configFiles = [
  'package.json',
  'next.config.ts',
  'wrangler.toml',
  'tsconfig.json',
  'tailwind.config.ts'
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - 存在`);
    results.config[file] = 'OK';
  } else {
    console.log(`❌ ${file} - 缺失`);
    results.config[file] = 'MISSING';
  }
});

// 2. 检查依赖
console.log('\n📦 依赖检查:');
const requiredDeps = [
  'next-intl',
  'resend',
  'nodemailer',
  '@prisma/client',
  'zod'
];

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

requiredDeps.forEach(dep => {
  if (deps[dep]) {
    console.log(`✅ ${dep} - 已安装 (${deps[dep]})`);
    results.dependencies[dep] = 'OK';
  } else {
    console.log(`❌ ${dep} - 未安装`);
    results.dependencies[dep] = 'MISSING';
  }
});

// 3. 检查关键文件
console.log('\n📁 关键文件检查:');
const criticalFiles = [
  'app/[locale]/layout.tsx',
  'app/[locale]/page.tsx',
  'app/[locale]/products/page.tsx',
  'i18n.ts',
  'middleware.ts',
  'prisma/schema.prisma'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} - 存在 (${stats.size} bytes)`);
    results.files[file] = 'OK';
  } else {
    console.log(`❌ ${file} - 缺失`);
    results.files[file] = 'MISSING';
  }
});

// 4. 检查语言文件
console.log('\n🌐 语言文件检查:');
const supportedLocales = ['en', 'de', 'ja', 'fr', 'th', 'es', 'ru', 'pt', 'it', 'nl', 'pl', 'ko', 'id'];
const localesDir = path.join(__dirname, '..', 'locales');

if (fs.existsSync(localesDir)) {
  const localeFiles = fs.readdirSync(localesDir);
  
  supportedLocales.forEach(locale => {
    const localeFile = `${locale}.json`;
    if (localeFiles.includes(localeFile)) {
      const filePath = path.join(localesDir, localeFile);
      const stats = fs.statSync(filePath);
      console.log(`✅ ${localeFile} - 存在 (${stats.size} bytes)`);
      results.locales[locale] = 'OK';
    } else {
      console.log(`❌ ${localeFile} - 缺失`);
      results.locales[locale] = 'MISSING';
    }
  });
} else {
  console.log('❌ locales 目录不存在');
  results.locales = 'DIRECTORY_MISSING';
}

// 5. 检查数据库配置
console.log('\n🗄️ 数据库配置检查:');
const prismaSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (fs.existsSync(prismaSchema)) {
  const content = fs.readFileSync(prismaSchema, 'utf8');
  const hasProductModel = content.includes('model Product');
  const hasTranslationModel = content.includes('model ProductTranslation');
  
  console.log(`✅ Prisma Schema - 存在`);
  console.log(`   ${hasProductModel ? '✅' : '❌'} Product 模型`);
  console.log(`   ${hasTranslationModel ? '✅' : '❌'} ProductTranslation 模型`);
  
  results.database = {
    schema: 'OK',
    productModel: hasProductModel ? 'OK' : 'MISSING',
    translationModel: hasTranslationModel ? 'OK' : 'MISSING'
  };
} else {
  console.log('❌ Prisma Schema - 缺失');
  results.database = 'MISSING';
}

// 6. 检查 API 路由
console.log('\n🔌 API 路由检查:');
const apiRoutes = [
  'app/api/[locale]/products/route.ts',
  'app/api/[locale]/email/send/route.ts',
  'app/api/[locale]/upload/products/route.ts'
];

apiRoutes.forEach(route => {
  const routePath = path.join(__dirname, '..', route);
  if (fs.existsSync(routePath)) {
    console.log(`✅ ${route} - 存在`);
  } else {
    console.log(`❌ ${route} - 缺失`);
  }
});

// 7. 检查服务层
console.log('\n⚙️ 服务层检查:');
const serviceFiles = [
  'lib/db.ts',
  'lib/email.ts',
  'lib/storage.ts',
  'lib/cache.ts'
];

serviceFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} - 存在 (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - 缺失`);
  }
});

// 总结报告
console.log('\n📊 项目状态总结:');
console.log('='.repeat(50));

const totalChecks = Object.values(results).flatMap(item => 
  typeof item === 'object' ? Object.values(item) : [item]
).length;

const passedChecks = Object.values(results).flatMap(item => 
  typeof item === 'object' ? Object.values(item).filter(v => v === 'OK') : [item]
).filter(v => v === 'OK').length;

console.log(`✅ 通过检查: ${passedChecks}/${totalChecks}`);
console.log(`🌐 支持语言: ${Object.keys(results.locales).filter(k => results.locales[k] === 'OK').length}/13`);

// 检查是否有严重问题
const criticalIssues = [
  results.config['package.json'] !== 'OK',
  results.config['next.config.ts'] !== 'OK',
  results.files['app/[locale]/layout.tsx'] !== 'OK',
  results.files['i18n.ts'] !== 'OK'
].some(issue => issue);

if (criticalIssues) {
  console.log('\n⚠️ 存在严重问题，需要修复后才能正常运行');
} else {
  console.log('\n🎉 项目配置基本正常，可以开始开发！');
}

console.log('\n💡 下一步建议:');
console.log('1. 运行 pnpm install 安装依赖');
console.log('2. 运行 pnpm prisma generate 生成 Prisma 客户端');
console.log('3. 运行 pnpm dev 启动开发服务器');
console.log('4. 访问 http://localhost:3000 查看网站');

module.exports = results;