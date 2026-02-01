import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminApi } from './productApi';

// fetch をモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('categoryIds を categories: [{id: ...}] に変換して送信する', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Test Product' }),
      });

      await adminApi.createProduct({
        name: 'Test Product',
        nameJa: 'テスト商品',
        description: 'Description',
        descriptionJa: '説明',
        categoryIds: [1, 3],
        imageUrl: 'https://example.com/img.jpg',
        amazonUrl: 'https://amazon.co.jp/test',
      }, 'test-token');

      const [url, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      expect(url).toContain('/api/products');
      expect(options.method).toBe('POST');
      expect(options.headers.Authorization).toBe('Bearer test-token');
      expect(body.categories).toEqual([{ id: 1 }, { id: 3 }]);
      expect(body.name).toBe('Test Product');
      expect(body.amazonUrl).toBe('https://amazon.co.jp/test');
    });

    it('レスポンスがエラーの場合は例外を投げる', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(
        adminApi.createProduct({
          name: 'Test',
          nameJa: 'テスト',
          description: 'Desc',
          descriptionJa: '説明',
          categoryIds: [1],
          imageUrl: 'https://example.com/img.jpg',
        }, 'test-token')
      ).rejects.toThrow('Failed to create product');
    });
  });

  describe('updateProduct', () => {
    it('categoryIds を categories: [{id: ...}] に変換して送信する', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Updated' }),
      });

      await adminApi.updateProduct('1', {
        name: 'Updated',
        categoryIds: [2, 4],
      }, 'test-token');

      const [url, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      expect(url).toContain('/api/products/1');
      expect(options.method).toBe('PUT');
      expect(body.categories).toEqual([{ id: 2 }, { id: 4 }]);
    });

    it('categoryIds が未指定の場合は categories が undefined になる', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      });

      await adminApi.updateProduct('1', {
        name: 'Updated',
      }, 'test-token');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.categories).toBeUndefined();
    });

    it('レスポンスがエラーの場合は例外を投げる', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await expect(
        adminApi.updateProduct('999', { name: 'Test' }, 'test-token')
      ).rejects.toThrow('Failed to update product');
    });
  });

  describe('deleteProduct', () => {
    it('DELETE リクエストを送信する', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await adminApi.deleteProduct('1', 'test-token');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/products/1');
      expect(options.method).toBe('DELETE');
      expect(options.headers.Authorization).toBe('Bearer test-token');
    });

    it('レスポンスがエラーの場合は例外を投げる', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 403 });

      await expect(
        adminApi.deleteProduct('1', 'test-token')
      ).rejects.toThrow('Failed to delete product');
    });
  });
});
