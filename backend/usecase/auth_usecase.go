package usecase

import (
	"backend/domain/entity"
	"backend/domain/repository"
	"errors"
	"time"
)

// AuthUsecase - 認証ユースケース
type AuthUsecase struct {
	userRepo  repository.UserRepository
	adminRepo repository.AdminRepository
}

// NewAuthUsecase - 認証ユースケースの生成
func NewAuthUsecase(userRepo repository.UserRepository, adminRepo repository.AdminRepository) *AuthUsecase {
	return &AuthUsecase{
		userRepo:  userRepo,
		adminRepo: adminRepo,
	}
}

// FindOrCreateUser - ユーザー検索または作成
func (u *AuthUsecase) FindOrCreateUser(googleUserInfo *entity.GoogleUserInfo) (*entity.User, error) {
	user, err := u.userRepo.FindByGoogleID(googleUserInfo.ID)
	if err != nil {
		// 新規作成
		user = &entity.User{
			GoogleID:    googleUserInfo.ID,
			Email:       googleUserInfo.Email,
			Name:        googleUserInfo.Name,
			Avatar:      googleUserInfo.Picture,
			MemberSince: time.Now(),
		}
		if err := u.userRepo.Create(user); err != nil {
			return nil, err
		}
	} else {
		// 既存ユーザー更新
		user.Name = googleUserInfo.Name
		user.Avatar = googleUserInfo.Picture
		if err := u.userRepo.Update(user); err != nil {
			return nil, err
		}
	}
	return user, nil
}

// FindAndUpdateAdmin - 管理者検索と更新
func (u *AuthUsecase) FindAndUpdateAdmin(googleUserInfo *entity.GoogleUserInfo) (*entity.Admin, error) {
	admin, err := u.adminRepo.FindByGoogleIDOrEmail(googleUserInfo.ID, googleUserInfo.Email)
	if err != nil {
		return nil, errors.New("admin not found")
	}

	admin.GoogleID = googleUserInfo.ID
	admin.Name = googleUserInfo.Name
	admin.Avatar = googleUserInfo.Picture
	if err := u.adminRepo.Update(admin); err != nil {
		return nil, err
	}
	return admin, nil
}

// GetCurrentUser - 現在のユーザー取得
func (u *AuthUsecase) GetCurrentUser(userID int64, isAdmin bool) (interface{}, error) {
	if isAdmin {
		return u.adminRepo.FindByID(userID)
	}
	return u.userRepo.FindByID(userID)
}
