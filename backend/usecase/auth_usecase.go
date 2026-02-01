package usecase

import (
	"backend/domain/admin"
	"backend/domain/user"
	"errors"
	"time"
)

// AuthUsecase - 認証ユースケース
type AuthUsecase struct {
	userRepo  user.UserRepository
	adminRepo admin.AdminRepository
}

// NewAuthUsecase - 認証ユースケースの生成
func NewAuthUsecase(userRepo user.UserRepository, adminRepo admin.AdminRepository) *AuthUsecase {
	return &AuthUsecase{
		userRepo:  userRepo,
		adminRepo: adminRepo,
	}
}

// FindOrCreateUser - ユーザー検索または作成
func (u *AuthUsecase) FindOrCreateUser(googleUserInfo *user.GoogleUserInfo) (*user.User, error) {
	existing, err := u.userRepo.FindByGoogleID(googleUserInfo.ID)
	if err != nil {
		// 新規作成
		newUser := &user.User{
			GoogleID:    googleUserInfo.ID,
			Email:       googleUserInfo.Email,
			Name:        googleUserInfo.Name,
			Avatar:      googleUserInfo.Picture,
			MemberSince: time.Now(),
		}
		if err := u.userRepo.Create(newUser); err != nil {
			return nil, err
		}
		return newUser, nil
	}
	// 既存ユーザー更新
	existing.Name = googleUserInfo.Name
	existing.Avatar = googleUserInfo.Picture
	if err := u.userRepo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

// FindAndUpdateAdmin - 管理者検索と更新
func (u *AuthUsecase) FindAndUpdateAdmin(googleUserInfo *user.GoogleUserInfo) (*admin.Admin, error) {
	a, err := u.adminRepo.FindByGoogleIDOrEmail(googleUserInfo.ID, googleUserInfo.Email)
	if err != nil {
		return nil, errors.New("admin not found")
	}

	a.GoogleID = googleUserInfo.ID
	a.Name = googleUserInfo.Name
	a.Avatar = googleUserInfo.Picture
	if err := u.adminRepo.Update(a); err != nil {
		return nil, err
	}
	return a, nil
}

// GetCurrentUser - 現在のユーザー取得
func (u *AuthUsecase) GetCurrentUser(userID int64, isAdmin bool) (interface{}, error) {
	if isAdmin {
		return u.adminRepo.FindByID(userID)
	}
	return u.userRepo.FindByID(userID)
}
