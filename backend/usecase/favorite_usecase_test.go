package usecase

import (
	"backend/domain/entity"
	"errors"
	"testing"
)

// ===== Mock Repository =====

type mockFavoriteRepository struct {
	favorites             []entity.Favorite
	findByUserIDFunc      func(userID string) ([]entity.Favorite, error)
	findByUserIDAndProdFunc func(userID, productID string) (*entity.Favorite, error)
	createFunc            func(favorite *entity.Favorite) error
	deleteFunc            func(userID, productID string) error
}

func (m *mockFavoriteRepository) FindByUserID(userID string) ([]entity.Favorite, error) {
	if m.findByUserIDFunc != nil {
		return m.findByUserIDFunc(userID)
	}
	return m.favorites, nil
}

func (m *mockFavoriteRepository) FindByUserIDAndProductID(userID, productID string) (*entity.Favorite, error) {
	if m.findByUserIDAndProdFunc != nil {
		return m.findByUserIDAndProdFunc(userID, productID)
	}
	return nil, errors.New("not found")
}

func (m *mockFavoriteRepository) Create(favorite *entity.Favorite) error {
	if m.createFunc != nil {
		return m.createFunc(favorite)
	}
	return nil
}

func (m *mockFavoriteRepository) Delete(userID, productID string) error {
	if m.deleteFunc != nil {
		return m.deleteFunc(userID, productID)
	}
	return nil
}

// ===== Tests =====

func TestFavoriteUsecase_GetUserFavorites(t *testing.T) {
	testCases := []struct {
		name          string
		userID        string
		requestUserID string
		mockFavorites []entity.Favorite
		wantErr       string
		wantCount     int
	}{
		{
			name:          "自分のお気に入りを取得できる",
			userID:        "user-1",
			requestUserID: "user-1",
			mockFavorites: []entity.Favorite{
				{ID: "fav-1", UserID: "user-1", ProductID: "prod-1"},
				{ID: "fav-2", UserID: "user-1", ProductID: "prod-2"},
			},
			wantErr:   "",
			wantCount: 2,
		},
		{
			name:          "他ユーザーのお気に入りは取得できない",
			userID:        "user-2",
			requestUserID: "user-1",
			wantErr:       "permission denied",
			wantCount:     0,
		},
		{
			name:          "お気に入りが0件でも正常に取得できる",
			userID:        "user-1",
			requestUserID: "user-1",
			mockFavorites: []entity.Favorite{},
			wantErr:       "",
			wantCount:     0,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockRepo := &mockFavoriteRepository{
				favorites: tc.mockFavorites,
			}
			usecase := NewFavoriteUsecase(mockRepo)

			favorites, err := usecase.GetUserFavorites(tc.userID, tc.requestUserID)

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
		name          string
		favorite      *entity.Favorite
		requestUserID string
		existingFav   *entity.Favorite
		repoErr       error
		wantErr       string
	}{
		{
			name: "自分のアカウントにお気に入りを追加できる",
			favorite: &entity.Favorite{
				UserID:    "user-1",
				ProductID: "prod-1",
			},
			requestUserID: "user-1",
			existingFav:   nil,
			wantErr:       "",
		},
		{
			name: "他ユーザーのアカウントには追加できない",
			favorite: &entity.Favorite{
				UserID:    "user-2",
				ProductID: "prod-1",
			},
			requestUserID: "user-1",
			wantErr:       "permission denied",
		},
		{
			name: "既に追加済みの商品は追加できない",
			favorite: &entity.Favorite{
				UserID:    "user-1",
				ProductID: "prod-1",
			},
			requestUserID: "user-1",
			existingFav: &entity.Favorite{
				ID:        "fav-1",
				UserID:    "user-1",
				ProductID: "prod-1",
			},
			wantErr: "already in favorites",
		},
		{
			name: "リポジトリエラー時はエラーを返す",
			favorite: &entity.Favorite{
				UserID:    "user-1",
				ProductID: "prod-1",
			},
			requestUserID: "user-1",
			existingFav:   nil,
			repoErr:       errors.New("database error"),
			wantErr:       "database error",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockRepo := &mockFavoriteRepository{
				findByUserIDAndProdFunc: func(userID, productID string) (*entity.Favorite, error) {
					if tc.existingFav != nil {
						return tc.existingFav, nil
					}
					return nil, errors.New("not found")
				},
				createFunc: func(favorite *entity.Favorite) error {
					return tc.repoErr
				},
			}
			usecase := NewFavoriteUsecase(mockRepo)

			err := usecase.AddFavorite(tc.favorite, tc.requestUserID)

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
		name          string
		userID        string
		productID     string
		requestUserID string
		repoErr       error
		wantErr       string
	}{
		{
			name:          "自分のお気に入りから削除できる",
			userID:        "user-1",
			productID:     "prod-1",
			requestUserID: "user-1",
			wantErr:       "",
		},
		{
			name:          "他ユーザーのお気に入りからは削除できない",
			userID:        "user-2",
			productID:     "prod-1",
			requestUserID: "user-1",
			wantErr:       "permission denied",
		},
		{
			name:          "リポジトリエラー時はエラーを返す",
			userID:        "user-1",
			productID:     "prod-1",
			requestUserID: "user-1",
			repoErr:       errors.New("database error"),
			wantErr:       "database error",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockRepo := &mockFavoriteRepository{
				deleteFunc: func(userID, productID string) error {
					return tc.repoErr
				},
			}
			usecase := NewFavoriteUsecase(mockRepo)

			err := usecase.RemoveFavorite(tc.userID, tc.productID, tc.requestUserID)

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
