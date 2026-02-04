import { Link } from 'react-router';
import { Leaf } from 'lucide-react';
import { Footer } from './common/Footer';

export function Privacy() {
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
            Privacy Policy / プライバシーポリシー
          </h1>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                1. Information We Collect / 収集する情報
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  When you use VeganBite, we collect the following information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information from Google (name, email address, profile picture)</li>
                  <li>Reviews and ratings you post</li>
                  <li>Products you add to favorites</li>
                  <li>Usage data (pages visited, time spent on the Service)</li>
                </ul>
                <p className="mt-4">
                  VeganBiteを使用する際、以下の情報を収集します：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Googleからのアカウント情報（氏名、メールアドレス、プロフィール画像）</li>
                  <li>投稿したレビューと評価</li>
                  <li>お気に入りに追加した製品</li>
                  <li>使用データ（訪問したページ、本サービスで過ごした時間）</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                2. How We Use Your Information / 情報の使用方法
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We use the collected information to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain the Service</li>
                  <li>Personalize your experience</li>
                  <li>Display your reviews and ratings to other users</li>
                  <li>Improve the Service and develop new features</li>
                  <li>Communicate with you about updates and changes</li>
                </ul>
                <p className="mt-4">
                  収集した情報は以下の目的で使用します：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>本サービスの提供と維持</li>
                  <li>体験のパーソナライゼーション</li>
                  <li>他のユーザーへのレビューと評価の表示</li>
                  <li>本サービスの改善と新機能の開発</li>
                  <li>アップデートや変更に関する連絡</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                3. Information Sharing / 情報の共有
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We do not sell your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With your consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect the rights and safety of VeganBite and other users</li>
                  <li>In connection with a merger, sale, or acquisition of our business</li>
                </ul>
                <p className="mt-4">
                  個人情報を第三者に販売することはありません。以下の状況でのみ情報を共有する場合があります：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>あなたの同意がある場合</li>
                  <li>法的義務を遵守するため</li>
                  <li>VeganBiteおよび他のユーザーの権利と安全を保護するため</li>
                  <li>当社の事業の合併、売却、または買収に関連して</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                4. Data Security / データセキュリティ
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
                <p>
                  個人情報を保護するために、適切な技術的および組織的措置を講じています。ただし、インターネット上の送信方法は100%安全ではなく、絶対的なセキュリティを保証することはできません。
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                5. Cookies and Tracking / クッキーとトラッキング
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
                <p>
                  本サービスでの活動を追跡し、特定の情報を保存するために、クッキーおよび類似のトラッキング技術を使用します。ブラウザですべてのクッキーを拒否するか、クッキーが送信されるときに通知するよう設定できます。
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                6. Your Rights / あなたの権利
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Object to processing of your information</li>
                  <li>Export your data in a portable format</li>
                </ul>
                <p className="mt-4">
                  以下の権利があります：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>個人情報へのアクセス</li>
                  <li>不正確な情報の訂正</li>
                  <li>アカウントと関連データの削除</li>
                  <li>情報処理への異議申し立て</li>
                  <li>ポータブル形式でのデータのエクスポート</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                7. Children's Privacy / 子どものプライバシー
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our Service is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
                <p>
                  本サービスは13歳未満のユーザーを対象としていません。13歳未満の子どもから故意に個人情報を収集することはありません。保護者の方で、お子様が個人情報を提供したと思われる場合は、ご連絡ください。
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                8. Third-Party Services / 第三者サービス
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We use Google authentication services. When you log in with Google, your information is also subject to Google's Privacy Policy. We recommend reviewing their privacy practices.
                </p>
                <p>
                  Google認証サービスを使用しています。Googleでログインすると、あなたの情報はGoogleのプライバシーポリシーの対象にもなります。Googleのプライバシー慣行を確認することをお勧めします。
                </p>
              </div>
            </section>

            {/* Section 9 - Affiliate */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                9. Affiliate Advertising / アフィリエイト広告
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  This site participates in affiliate advertising programs, including the Amazon Associates Program. As an Amazon Associate, we earn from qualifying purchases.
                </p>
                <p>
                  本サイトはアフィリエイト広告（Amazonアソシエイト含む）を掲載しています。Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。
                </p>
                <p>
                  We may also participate in affiliate programs with Rakuten and Yahoo! Shopping.
                </p>
                <p>
                  また、楽天市場およびYahoo!ショッピングのアフィリエイトプログラムにも参加しています。
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                10. Changes to This Policy / ポリシーの変更
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
                <p>
                  プライバシーポリシーは随時更新される場合があります。このページに新しいプライバシーポリシーを掲載し、「最終更新日」を更新することで、変更を通知します。
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
                11. Contact Us / お問い合わせ
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any questions about this Privacy Policy, please contact us at: privacy@veganbite.com
                </p>
                <p>
                  本プライバシーポリシーに関してご質問がある場合は、privacy@veganbite.com までお問い合わせください。
                </p>
              </div>
            </section>

            <div className="text-center text-sm text-gray-500 pt-8 border-t">
              Last updated: December 31, 2025 / 最終更新日：2025年12月31日
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
