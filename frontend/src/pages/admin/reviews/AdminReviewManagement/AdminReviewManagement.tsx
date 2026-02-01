import { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Admin } from '../../../../api/auth/authTypes';
import { Review } from '../../../../api/customer/reviewTypes';
import { mockProducts, mockReviews } from '../../../../data/mockData';
import { AdminHeader } from '../../common/AdminHeader/AdminHeader';
import { StarRating } from '../../../../components/StarRating';

interface AdminReviewManagementProps {
  admin: Admin;
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
}

export function AdminReviewManagement({ admin, reviews, setReviews }: AdminReviewManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const allReviews = [...mockReviews, ...reviews];

  const filteredReviews = allReviews.filter(review => {
    const product = mockProducts.find(p => p.id === review.productId);
    const matchesSearch =
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product && product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRating = selectedRating === 'All' || review.rating === parseInt(selectedRating);
    return matchesSearch && matchesRating;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(displayedReviews.map(r => r.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectReview = (reviewId: number, checked: boolean) => {
    if (checked) {
      setSelectedReviews([...selectedReviews, reviewId]);
    } else {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    }
  };

  const handleDeleteReview = (reviewId: number) => {
    if (confirm('このレビューを削除しますか？\n\nAre you sure you want to delete this review?')) {
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedReviews.length === 0) return;
    if (confirm(`${selectedReviews.length}件のレビューを削除しますか？\n\nAre you sure you want to delete ${selectedReviews.length} review(s)?`)) {
      setReviews(reviews.filter(r => !selectedReviews.includes(r.id)));
      setSelectedReviews([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AdminHeader admin={admin} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-gray-900">Review Management</h1>
          {selectedReviews.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ backgroundColor: '#dc2626', color: 'white' }}
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedReviews.length})
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, customer, or comment..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              value={selectedRating}
              onChange={(e) => {
                setSelectedRating(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={displayedReviews.length > 0 && selectedReviews.length === displayedReviews.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-[#4A7C59] rounded focus:ring-[#4A7C59]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedReviews.map(review => {
                const product = mockProducts.find(p => p.id === review.productId);
                return (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={(e) => handleSelectReview(review.id, e.target.checked)}
                        className="w-4 h-4 text-[#4A7C59] rounded focus:ring-[#4A7C59]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {product && (
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <p className="text-sm text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.nameJa}</p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={review.customerAvatar}
                          alt={review.customerName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-900">{review.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StarRating rating={review.rating} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate">
                        {review.comment}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {displayedReviews.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No reviews found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className="w-10 h-10 rounded-lg transition-all"
                style={{
                  backgroundColor: currentPage === i + 1 ? '#4A7C59' : 'white',
                  color: currentPage === i + 1 ? 'white' : '#333333',
                  border: currentPage === i + 1 ? 'none' : '1px solid #E5E7EB'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
