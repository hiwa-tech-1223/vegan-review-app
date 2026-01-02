import { Link } from 'react-router';
import { Leaf } from 'lucide-react';

export function Terms() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            <span className="text-2xl" style={{ color: 'var(--primary)' }}>VeganBite</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
          <h1 className="text-3xl mb-8 text-center" style={{ color: 'var(--primary)' }}>
            Terms of Service / 利用規約
          </h1>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                1. Acceptance of Terms / 規約への同意
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing and using VeganBite ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                </p>
                <p>
                  VeganBite（以下「本サービス」）にアクセスし使用することにより、あなたは本規約の条項および規定に拘束されることに同意したものとみなされます。
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                2. User Accounts / ユーザーアカウント
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  To use certain features of the Service, you must register for an account using your Google account. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
                </p>
                <p>
                  本サービスの特定の機能を使用するには、Googleアカウントを使用してアカウントを登録する必要があります。あなたは自分のアカウントの機密性を維持し、アカウントで発生するすべての活動について責任を負います。
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                3. User Content / ユーザーコンテンツ
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Users may post reviews and ratings for vegan products. You retain all rights to your content, but you grant VeganBite a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content in connection with the Service.
                </p>
                <p>
                  ユーザーはヴィーガン製品のレビューや評価を投稿できます。あなたはコンテンツに対するすべての権利を保持しますが、本サービスに関連してコンテンツを使用、複製、表示するための世界的、非独占的、ロイヤリティフリーのライセンスをVeganBiteに付与します。
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                4. Prohibited Conduct / 禁止行為
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Post false, misleading, or fraudulent reviews</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                </ul>
                <p className="mt-4">
                  以下の行為を行わないことに同意します：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>虚偽、誤解を招く、または詐欺的なレビューの投稿</li>
                  <li>他のユーザーへの嫌がらせ、虐待、または危害</li>
                  <li>適用される法律または規制の違反</li>
                  <li>本サービスへの不正アクセスの試み</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                5. Intellectual Property / 知的財産権
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  The Service and its original content, features, and functionality are owned by VeganBite and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p>
                  本サービスとその独自のコンテンツ、機能は、VeganBiteが所有し、国際的な著作権、商標、特許、企業秘密、およびその他の知的財産法によって保護されています。
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                6. Disclaimer of Warranties / 保証の否認
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  The Service is provided "as is" without warranties of any kind. VeganBite does not guarantee the accuracy, completeness, or usefulness of any information on the Service.
                </p>
                <p>
                  本サービスは「現状のまま」で提供され、いかなる種類の保証もありません。VeganBiteは、本サービス上の情報の正確性、完全性、または���用性を保証しません。
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                7. Changes to Terms / 規約の変更
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new terms on this page.
                </p>
                <p>
                  当社は、いつでも本規約を変更する権利を留保します。このページに新しい規約を掲載することにより、ユーザーに変更を通知します。
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                8. Contact / お問い合わせ
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any questions about these Terms, please contact us at: support@veganbite.com
                </p>
                <p>
                  本規約に関してご質問がある場合は、support@veganbite.com までお問い合わせください。
                </p>
              </div>
            </section>

            <div className="text-center text-sm text-gray-500 pt-8 border-t">
              Last updated: December 31, 2025 / 最終更新日：2025年12月31日
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
          <div className="text-center mt-4 text-sm" style={{ color: '#666' }}>
            © 2025 VeganBite. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
