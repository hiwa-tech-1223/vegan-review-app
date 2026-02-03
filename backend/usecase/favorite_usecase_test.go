package usecase

import (
	"backend/domain/favorite"
	"errors"
	"testing"
)

// ===== Mock Repository =====

type mockFavoriteRepository struct {
	favorites                  []favorite.Favorite
	findByCustomerIDFunc       func(customerID int64) ([]favorite.Favorite, error)
	findByCustomerIDAndProdFunc func(customerID, productID int64) (*favorite.Favorite, error)
	createFunc                 func(fav *favorite.Favorite) error
	deleteFunc                 func(customerID, productID int64) error
}

func (m *mockFavoriteRepository) FindByCustomerID(customerID int64) ([]favorite.Favorite, error) {
	if m.findByCustomerIDFunc != nil {
		return m.findByCustomerIDFunc(customerID)
	}
	return m.favorites, nil
}

func (m *mockFavoriteRepository) FindByCustomerIDAndProductID(customerID, productID int64) (*favorite.Favorite, error) {
	if m.findByCustomerIDAndProdFunc != nil {
		return m.findByCustomerIDAndProdFunc(customerID, productID)
	}
	return nil, errors.New("not found")
}

func (m *mockFavoriteRepository) Create(fav *favorite.Favorite) error {
	if m.createFunc != nil {
		return m.createFunc(fav)
	}
	return nil
}

func (m *mockFavoriteRepository) Delete(customerID, productID int64) error {
	if m.deleteFunc != nil {
		return m.deleteFunc(customerID, productID)
	}
	return nil
}

// ===== Tests =====

func TestFavoriteUsecase_GetCustomerFavorites(t *testing.T) {
	testCases := []struct {
		name              string
		customerID        int64
		requestCustomerID int64
		mockFavorites     []favorite.Favorite
		wantErr           string
		wantCount         int
	}{
		{
			name:              "自分のお気に入りを取得できる",
			customerID:        1,
			requestCustomerID: 1,
			mockFavorites: []favorite.Favorite{
				{ID: 1, CustomerID: 1, ProductID: 1},
				{ID: 2, CustomerID: 1, ProductID: 2},
			},
			wantErr:   "",
			wantCount: 2,
		},
		{
			name:              "他カスタマーのお気に入りは取得できない",
			customerID:        2,
			requestCustomerID: 1,
			wantErr:           "permission denied",
			wantCount:         0,
		},
		{
			name:              "お気に入りが0件でも正常に取得できる",
			customerID:        1,
			requestCustomerID: 1,
			mockFavorites:     []favorite.Favorite{},
			wantErr:           "",
			wantCount:         0,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockRepo := &mockFavoriteRepository{
				favorites: tc.mockFavorites,
			}
			usecase := NewFavoriteUsecase(mockRepo)

			favorites, err := usecase.GetCustomerFavorites(tc.customerID, tc.requestCustomerID)

			if tc.wantErr != "" {
				if err == nil {
					t.Errorf("expected error %q, got nil", tc.wantErr)
					return
				}
				if err.Error() != tc.wantErr {
					t.Errorf("expected error %q, got %q", tc.wantErr, err.Error())
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
				return
			}

			if len(favorites) != tc.wantCount {
				t.Errorf("expected %d favorites, got %d", tc.wantCount, len(favorites))
			}
		})
	}
}

func TestFavoriteUsecase_AddFavorite(t *testing.T) {
	testCases := []struct {
		name              string
		fav               *favorite.Favorite
		requestCustomerID int64
		existingFav       *favorite.Favorite
		repoErr           error
		wantErr           string
	}{
		{
			name: "自分のアカウントにお気に入りを追加できる",
			fav: &favorite.Favorite{
				CustomerID: 1,
				ProductID:  1,
			},
			requestCustomerID: 1,
			existingFav:       nil,
			wantErr:           "",
		},
		{
			name: "他カスタマーのアカウントには追加できない",
			fav: &favorite.Favorite{
				CustomerID: 2,
				ProductID:  1,
			},
			requestCustomerID: 1,
			wantErr:           "permission denied",
		},
		{
			name: "既に追加済みの商品は追加できない",
			fav: &favorite.Favorite{
				CustomerID: 1,
				ProductID:  1,
			},
			requestCustomerID: 1,
			existingFav: &favorite.Favorite{
				ID:         1,
				CustomerID: 1,
				ProductID:  1,
			},
			wantErr: "already in favorites",
		},
		{
			name: "リポジトリエラー時はエラーを返す",
			fav: &favorite.Favorite{
				CustomerID: 1,
				ProductID:  1,
			},
			requestCustomerID: 1,
			existingFav:       nil,
			repoErr:           errors.New("database error"),
			wantErr:           "database error",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockRepo := &mockFavoriteRepository{
				findByCustomerIDAndProdFunc: func(customerID, productID int64) (*favorite.Favorite, error) {
					if tc.existingFav != nil {
						return tc.existingFav, nil
					}
					return nil, errors.New("not found")
				},
				createFunc: func(fav *favorite.Favorite) error {
					return tc.repoErr
				},
			}
			usecase := NewFavoriteUsecase(mockRepo)

			err := usecase.AddFavorite(tc.fav, tc.requestCustomerID)

			if tc.wantErr != "" {
				if err == nil {
					t.Errorf("expected error %q, got nil", tc.wantErr)
					return
				}
				if err.Error() != tc.wantErr {
					t.Errorf("expected error %q, got %q", tc.wantErr, err.Error())
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}

func TestFavoriteUsecase_RemoveFavorite(t *testing.T) {
	testCases := []struct {
		name              string
		customerID        int64
		productID         int64
		requestCustomerID int64
		repoErr           error
		wantErr           string
	}{
		{
			name:              "自分のお気に入りから削除できる",
			customerID:        1,
			productID:         1,
			requestCustomerID: 1,
			wantErr:           "",
		},
		{
			name:              "他カスタマーのお気に入りからは削除できない",
			customerID:        2,
			productID:         1,
			requestCustomerID: 1,
			wantErr:           "permission denied",
		},
		{
			name:              "リポジトリエラー時はエラーを返す",
			customerID:        1,
			productID:         1,
			requestCustomerID: 1,
			repoErr:           errors.New("database error"),
			wantErr:           "database error",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockRepo := &mockFavoriteRepository{
				deleteFunc: func(customerID, productID int64) error {
					return tc.repoErr
				},
			}
			usecase := NewFavoriteUsecase(mockRepo)

			err := usecase.RemoveFavorite(tc.customerID, tc.productID, tc.requestCustomerID)

			if tc.wantErr != "" {
				if err == nil {
					t.Errorf("expected error %q, got nil", tc.wantErr)
					return
				}
				if err.Error() != tc.wantErr {
					t.Errorf("expected error %q, got %q", tc.wantErr, err.Error())
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}
