import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

interface WrapperProps {
  children: React.ReactNode;
}

// テスト用のプロバイダーラッパー
function AllProviders({ children }: WrapperProps) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

// カスタムrender関数
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// re-export everything
export * from '@testing-library/react';
export { customRender as render };
