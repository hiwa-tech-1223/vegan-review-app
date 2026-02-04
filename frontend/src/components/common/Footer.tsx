import { Link } from 'react-router';
import { Leaf } from 'lucide-react';

interface FooterProps {
  showAffiliateNotice?: boolean;
}

export function Footer({ showAffiliateNotice = false }: FooterProps) {
  return (
    <footer className="bg-white mt-16 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--primary)' }}>VeganBite</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/" className="hover:opacity-70" style={{ color: 'var(--text)' }}>Home / ホーム</Link>
            <Link to="/terms" className="hover:opacity-70" style={{ color: 'var(--text)' }}>Terms / 利用規約</Link>
            <Link to="/privacy" className="hover:opacity-70" style={{ color: 'var(--text)' }}>Privacy / プライバシー</Link>
          </div>
        </div>
        {showAffiliateNotice && (
          <div className="text-center mt-4 text-xs" style={{ color: '#999' }}>
            ※ 本サイトはアフィリエイト広告（Amazonアソシエイト含む）を掲載しています
          </div>
        )}
        <div className="text-center mt-2 text-sm" style={{ color: '#666' }}>
          © 2025 VeganBite. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
