// 商品管理関連の型定義

// 商品フォームデータ
export interface ProductFormData {
  nameJa: string;
  name: string;
  categoryIds: number[];
  descriptionJa: string;
  description: string;
  imageUrl: string;
  amazonUrl: string;
  rakutenUrl: string;
  yahooUrl: string;
}

// かんたんリンクHTML解析結果
export interface ParsedKantanLink {
  imageUrl?: string;
  amazonUrl?: string;
  rakutenUrl?: string;
  yahooUrl?: string;
}

// 操作結果メッセージ
export interface OperationMessage {
  type: 'success' | 'error';
  text: string;
}
