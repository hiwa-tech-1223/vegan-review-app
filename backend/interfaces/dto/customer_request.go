package dto

// BanCustomerRequest - カスタマーBANリクエスト
type BanCustomerRequest struct {
	Reason string `json:"reason"`
}

// SuspendCustomerRequest - カスタマー一時停止リクエスト
type SuspendCustomerRequest struct {
	Duration int    `json:"duration"`
	Reason   string `json:"reason"`
}
