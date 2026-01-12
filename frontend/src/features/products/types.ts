// 商品関連の型定義

export interface Category {
  id: number;
  name: string;
  nameJa: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  nameJa: string;
  image: string;
  category: string;
  categoryJa: string;
  rating: number;
  reviewCount: number;
  description: string;
  descriptionJa: string;
}

// APIレスポンス用の型
export interface ApiCategory {
  id: number;
  name: string;
  nameJa: string;
  slug: string;
}

export interface ApiProduct {
  id: number;
  categories: ApiCategory[];  // 多対多: 複数カテゴリー
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  imageUrl: string;
  affiliateUrl: string | null;  // アフィリエイトリンク（後方互換）
  amazonUrl: string | null;     // もしもアフィリエイト経由Amazonリンク
  rakutenUrl: string | null;    // もしもアフィリエイト経由楽天リンク
  yahooUrl: string | null;      // もしもアフィリエイト経由Yahoo!リンク
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
