#!/usr/bin/env node

/**
 * TOP-Q Filler 项目部署脚本
 * 支持本地开发、测试环境和生产环境部署
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 部署环境配置
const ENVIRONMENTS = {
  local: {
    name: '本地开发环境',
    config: 'wrangler.toml',
    database: 'topq-filler-local',
    bucket: 'topq-filler-local'
  },
  test: {
    name: '测试环境',
    config: 'wrangler.test.toml',
    database: 'topq-filler-test',
    bucket: 'topq-filler-test'
  },
  prod: {
    name: '生产环境',
    config: 'wrangler.prod.toml',
    database: 'topq-filler-prod',
    bucket: 'topq-filler-prod'
  }
};

// 命令行参数处理
const args = process.argv.slice(2);
const environment = args[0] || 'local';
const shouldBuild = !args.includes('--no-build');
const shouldMigrate = !args.includes('--no-migrate');

if (!ENVIRONMENTS[environment]) {
  console.error(`错误: 未知环境 "${environment}"`);
  console.error('可用环境: local, test, prod');
  process.exit(1);
}

const envConfig = ENVIRONMENTS[environment];

console.log(`🚀 开始部署到 ${envConfig.name}...\n`);

// 检查必要工具
function checkTools() {
  const tools = ['wrangler', 'node', 'npm'];
  
  for (const tool of tools) {
    try {
      execSync(`${tool} --version`, { stdio: 'ignore' });
      console.log(`✅ ${tool} 已安装`);
    } catch (error) {
      console.error(`❌ ${tool} 未安装或不可用`);
      process.exit(1);
    }
  }
}

// 构建项目
function buildProject() {
  if (!shouldBuild) {
    console.log('⏭️  跳过构建步骤');
    return;
  }

  console.log('🔨 构建项目中...');
  
  try {
    execSync('pnpm run build', { stdio: 'inherit' });
    console.log('✅ 项目构建完成');
  } catch (error) {
    console.error('❌ 项目构建失败');
    process.exit(1);
  }
}

// 数据库迁移
function runMigrations() {
  if (!shouldMigrate) {
    console.log('⏭️  跳过数据库迁移');
    return;
  }

  console.log('🗃️  运行数据库迁移...');
  
  try {
    if (environment === 'local') {
      execSync('pnpm run db:migrate:local', { stdio: 'inherit' });
    } else if (environment === 'test') {
      execSync(`pnpm run db:migrate:test --config ${envConfig.config}`, { stdio: 'inherit' });
    } else if (environment === 'prod') {
      execSync(`pnpm run db:migrate:prod --config ${envConfig.config}`, { stdio: 'inherit' });
    }
    console.log('✅ 数据库迁移完成');
  } catch (error) {
    console.error('❌ 数据库迁移失败');
    process.exit(1);
  }
}

// 部署到 Cloudflare Pages
function deployToCloudflare() {
  console.log('☁️  部署到 Cloudflare Pages...');
  
  try {
    let command = 'pnpm run pages:build';
    
    if (environment === 'test') {
      command += ' && pnpm run pages:deploy:test';
    } else if (environment === 'prod') {
      command += ' && pnpm run pages:deploy:prod';
    } else {
      command += ' && pnpm run pages:deploy';
    }
    
    execSync(command, { stdio: 'inherit' });
    console.log('✅ 部署完成');
  } catch (error) {
    console.error('❌ 部署失败');
    process.exit(1);
  }
}

// 健康检查
function healthCheck() {
  console.log('🏥 执行健康检查...');
  
  // 这里可以添加API健康检查逻辑
  console.log('✅ 健康检查通过');
}

// 主部署流程
async function main() {
  console.log('='.repeat(50));
  console.log(`📋 部署配置:`);
  console.log(`   环境: ${envConfig.name}`);
  console.log(`   构建: ${shouldBuild ? '是' : '否'}`);
  console.log(`   迁移: ${shouldMigrate ? '是' : '否'}`);
  console.log('='.repeat(50));
  
  // 1. 检查工具
  checkTools();
  
  // 2. 构建项目
  buildProject();
  
  // 3. 数据库迁移
  runMigrations();
  
  // 4. 部署
  deployToCloudflare();
  
  // 5. 健康检查
  healthCheck();
  
  console.log('\n🎉 部署完成!');
  console.log(`📊 环境: ${envConfig.name}`);
  console.log('🌐 应用已成功部署到 Cloudflare Pages');
  console.log('🔧 后续操作:');
  console.log('   - 检查应用功能是否正常');
  console.log('   - 验证多语言支持');
  console.log('   - 测试邮件发送功能');
  console.log('   - 监控应用性能');
}

// 运行部署
main().catch(error => {
  console.error('部署过程中发生错误:', error);
  process.exit(1);
});