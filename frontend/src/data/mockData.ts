import { Product } from '../features/products/types';
import { Review } from '../features/reviews/types';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Beyond Burger',
    nameJa: 'ビヨンドバーガー',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
    category: 'Meat Alternatives',
    categoryJa: '代替肉',
    rating: 4.5,
    reviewCount: 128,
    description: 'Plant-based burger patty that looks, cooks, and tastes like beef. Made from pea protein, this revolutionary product is perfect for grilling.',
    descriptionJa: '牛肉のような見た目、調理感、味わいの植物ベースバーガーパティ。えんどう豆由来のタンパク質で作られた革新的な製品で、グリル料理に最適です。'
  },
  {
    id: 2,
    name: 'Oat Milk',
    nameJa: 'オーツミルク',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
    category: 'Dairy',
    categoryJa: '乳製品代替',
    rating: 4.8,
    reviewCount: 256,
    description: 'Creamy oat milk made from whole grain oats. Perfect for coffee, smoothies, and cereal. Naturally sweet with no added sugars.',
    descriptionJa: '全粒オーツ麦から作られたクリーミーなオーツミルク。コーヒー、スムージー、シリアルに最���。砂糖不使用で自然な甘さ。'
  },
  {
    id: 3,
    name: 'Vegan Cheese Slices',
    nameJa: 'ヴィーガンチーズスライス',
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=300&fit=crop',
    category: 'Dairy',
    categoryJa: '乳製品代替',
    rating: 4.2,
    reviewCount: 89,
    description: 'Meltable vegan cheese slices made from cashews and coconut oil. Great for sandwiches and burgers.',
    descriptionJa: 'カシューナッツとココナッツオイルから作られた溶けるヴィーガンチーズスライス。サンドイッチやバーガーに最適。'
  },
  {
    id: 4,
    name: 'Chickpea Chips',
    nameJa: 'ひよこ豆チップス',
    image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=300&fit=crop',
    category: 'Snacks',
    categoryJa: 'スナック',
    rating: 4.6,
    reviewCount: 145,
    description: 'Crunchy chips made from chickpeas and sea salt. High in protein and fiber, perfect for guilt-free snacking.',
    descriptionJa: 'ひよこ豆と海塩で作られたサクサクチップス。タンパク質と食物繊維が豊富で、罪悪感のないスナックに最適。'
  },
  {
    id: 5,
    name: 'Kombucha Green Tea',
    nameJa: '緑茶コンブチャ',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    category: 'Beverages',
    categoryJa: '飲料',
    rating: 4.4,
    reviewCount: 203,
    description: 'Organic fermented tea beverage with probiotics. Refreshing green tea flavor with a subtle fizz.',
    descriptionJa: 'プロバイオティクスを含むオーガニック発酵茶飲料。爽やかな緑茶の風味と微炭酸。'
  },
  {
    id: 6,
    name: 'Nutritional Yeast',
    nameJa: 'ニュートリショナルイースト',
    image: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?w=400&h=300&fit=crop',
    category: 'Seasonings',
    categoryJa: '調味料',
    rating: 4.9,
    reviewCount: 312,
    description: 'Deactivated yeast with a cheesy, nutty flavor. Rich in B vitamins and adds umami to any dish.',
    descriptionJa: 'チーズのようなナッツ風味の不活性酵母。ビタミンB群が豊富で、どんな料理にもうま味を加えます。'
  },
  {
    id: 7,
    name: 'Vegan Mayo',
    nameJa: 'ヴィーガンマヨネーズ',
    image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=300&fit=crop',
    category: 'Seasonings',
    categoryJa: '調味料',
    rating: 4.3,
    reviewCount: 167,
    description: 'Egg-free mayonnaise made from soy milk. Creamy texture perfect for sandwiches and salads.',
    descriptionJa: '豆乳から作られた卵不使用マヨネーズ。サンドイッチやサラダに最適なクリーミーな食感。'
  },
  {
    id: 8,
    name: 'Protein Energy Bars',
    nameJa: 'プロテインエナジーバー',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop',
    category: 'Snacks',
    categoryJa: 'スナック',
    rating: 4.7,
    reviewCount: 198,
    description: 'Peanut butter and chocolate protein bars with 12g plant protein. Perfect post-workout snack.',
    descriptionJa: 'ピーナッツバターとチョコレートのプロテインバー、植物性タンパク質12g含有。運動後のスナックに最適。'
  },
  {
    id: 9,
    name: 'Tempeh Original',
    nameJa: 'オリジナルテンペ',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    category: 'Meat Alternatives',
    categoryJa: '代替肉',
    rating: 4.5,
    reviewCount: 134,
    description: 'Traditional Indonesian fermented soybean cake. High in protein and probiotics, versatile for any recipe.',
    descriptionJa: 'インドネシア伝統の発酵大豆ケーキ。タンパク質とプロバイオティクスが豊富で、どんなレシピにも使えます。'
  }
];

export const mockReviews: Review[] = [
  {
    id: 1,
    productId: 1,
    userId: 1,
    userName: 'Yuki Tanaka',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Amazing taste! Very close to real beef. 本物の牛肉に近い味わいで驚きました。',
    date: '2025-12-15'
  },
  {
    id: 2,
    productId: 1,
    userId: 2,
    userName: 'Mike Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 4,
    comment: 'Great texture, though a bit pricey. Perfect for BBQ parties.',
    date: '2025-12-10'
  },
  {
    id: 3,
    productId: 2,
    userId: 3,
    userName: 'Sakura Yamamoto',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'コーヒーに入れるのに最適です！クリーミーで美味しい。Perfect for my morning coffee!',
    date: '2025-12-20'
  }
];
