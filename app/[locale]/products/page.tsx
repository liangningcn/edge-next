import { useTranslations } from 'next-intl';
import { Link } from '@/components/Link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
}

export const runtime = 'edge';

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  
  const t = useTranslations('common');
  const tNav = useTranslations('navigation');
  const tProducts = useTranslations('products');

  // 模拟产品数据
  const products = [
    {
      id: 1,
      name: "Fine Lines Filler",
      category: tProducts('category_fine'),
      price: "$299",
      image: "https://image.topqfiller.com/products/fine.webp",
      description: "Advanced formula for fine lines and subtle enhancements"
    },
    {
      id: 2,
      name: "Dermal Enhancement",
      category: tProducts('category_derm'),
      price: "$399",
      image: "https://image.topqfiller.com/products/derm.webp",
      description: "Professional dermal filler for natural-looking results"
    },
    {
      id: 3,
      name: "Deep Wrinkle Solution",
      category: tProducts('category_deep'),
      price: "$499",
      image: "https://image.topqfiller.com/products/deep.webp",
      description: "Powerful solution for deep wrinkles and volume loss"
    },
    {
      id: 4,
      name: "Ultra Deep Filler",
      category: tProducts('category_ultra_deep'),
      price: "$599",
      image: "https://image.topqfiller.com/products/ultra-deep.webp",
      description: "Ultra-deep formulation for significant volume restoration"
    },
    {
      id: 5,
      name: "Volume Booster 10ml",
      category: tProducts('category_volume'),
      price: "$699",
      image: "https://image.topqfiller.com/products/10ml-20ml.webp",
      description: "High-volume formulation for comprehensive enhancement"
    },
    {
      id: 6,
      name: "CAHA Complex",
      category: tProducts('category_special'),
      price: "$799",
      image: "https://image.topqfiller.com/products/caha.webp",
      description: "Advanced calcium hydroxylapatite formulation"
    },
    {
      id: 7,
      name: "PLLA Stimulator",
      category: tProducts('category_special'),
      price: "$899",
      image: "https://image.topqfiller.com/products/plla.webp",
      description: "Poly-L-lactic acid for collagen stimulation"
    },
    {
      id: 8,
      name: "Premium Combo Pack",
      category: tProducts('category_special'),
      price: "$1,299",
      image: "https://image.topqfiller.com/products/products1.webp",
      description: "Complete professional treatment package"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">{t('site_name')}</Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">
                {tNav('products')}
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600">
                {tNav('about')}
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600">
                {tNav('contact')}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{tProducts('title')}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {tProducts('description')}
          </p>
        </div>

        {/* 产品筛选和排序 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>{tProducts('category_all')}</option>
              <option>{tProducts('category_fine')}</option>
              <option>{tProducts('category_derm')}</option>
              <option>{tProducts('category_deep')}</option>
              <option>{tProducts('category_ultra_deep')}</option>
              <option>{tProducts('category_volume')}</option>
              <option>{tProducts('category_special')}</option>
            </select>
            
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>{tProducts('sort_by')}</option>
              <option>{tProducts('sort_price_low')}</option>
              <option>{tProducts('sort_price_high')}</option>
              <option>{tProducts('sort_name')}</option>
              <option>{tProducts('sort_newest')}</option>
              <option>{tProducts('sort_popular')}</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            {products.length} products found
          </div>
        </div>

        {/* 产品网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition">
              <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="h-32 w-32 object-contain"
                  onError={(e) => {
                    // 图片加载失败时显示占位符
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IiNlNWU1ZTUiLz4KICA8cGF0aCBkPSJNNjQgMzJDNzQuOTI4OCAzMiA4My43NTQ4IDQwLjgyNDMgODMuNzU0OCA1MS43NTQ4QzgzLjc1NDggNjIuNjg1MyA3NC45Mjg4IDcxLjUwOTQgNjQgNzEuNTA5NEM1My4wNjkzIDcxLjUwOTQgNDQuMjQ1MiA2Mi42ODUzIDQ0LjI0NTIgNTEuNzU0OEM0NC4yNDUyIDQwLjgyNDMgNTMuMDY5MyAzMiA2NCAzMloiIGZpbGw9IiM5OTk5OTkiLz4KICA8cGF0aCBkPSJNNDggOTZINjRINjRIMTExLjUwOUMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjUwOSA5NkMxMTEuNTA5IDk2IDExMS41MDkgOTYgMTExLjTA5IDk2WiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
              <div className="p-4">
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                  {product.category}
                </span>
                <h3 className="font-semibold text-lg mb-2 mt-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm">
                    {t('view_details')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 分页 */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
              {t('previous')}
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
              {t('next')}
            </button>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('site_name')}</h3>
              <p className="text-gray-400">{t('description')}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Shipping Info</Link></li>
                <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 TOP-Q Filler. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}