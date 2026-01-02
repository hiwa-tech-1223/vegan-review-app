import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProductListing } from './components/ProductListing';
import { ProductDetail } from './components/ProductDetail';
import { UserLogin } from './components/UserLogin';
import { MyPage } from './components/MyPage';
import { Terms } from './components/Terms';
import { Privacy } from './components/Privacy';
import { AuthCallback } from './components/auth/AuthCallback';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminAuthCallback } from './components/admin/AdminAuthCallback';
import { AdminProductList } from './components/admin/AdminProductList';
import { AdminProductForm } from './components/admin/AdminProductForm';
import { AdminReviewManagement } from './components/admin/AdminReviewManagement';
import { useState } from 'react';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
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

// Protected Route for Users
function ProtectedUserRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

// Protected Route for Admins
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { admin, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!admin || !isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, admin } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  return (
    <Routes>
      {/* Public User Routes */}
      <Route path="/" element={<ProductListing user={user} />} />
      <Route
        path="/product/:id"
        element={
          <ProductDetail
            user={user}
            reviews={reviews}
            setReviews={setReviews}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        }
      />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Protected User Routes */}
      <Route
        path="/mypage"
        element={
          <ProtectedUserRoute>
            <MyPage
              user={user!}
              reviews={reviews}
              setReviews={setReviews}
              favorites={favorites}
              setFavorites={setFavorites}
            />
          </ProtectedUserRoute>
        }
      />

      {/* Admin Auth Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/auth/callback" element={<AdminAuthCallback />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/products"
        element={
          <ProtectedAdminRoute>
            <AdminProductList
              admin={admin!}
              products={products}
              setProducts={setProducts}
            />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <ProtectedAdminRoute>
            <AdminProductForm
              admin={admin!}
              products={products}
              setProducts={setProducts}
            />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/products/:id/edit"
        element={
          <ProtectedAdminRoute>
            <AdminProductForm
              admin={admin!}
              products={products}
              setProducts={setProducts}
            />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedAdminRoute>
            <AdminReviewManagement
              admin={admin!}
              reviews={reviews}
              setReviews={setReviews}
            />
          </ProtectedAdminRoute>
        }
      />

      {/* Redirect /admin to /admin/products */}
      <Route path="/admin" element={<Navigate to="/admin/products" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
