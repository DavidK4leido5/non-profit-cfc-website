package handler

// ErrorBody is the standard API error envelope.
type ErrorBody struct {
	Code    string `json:"code" example:"unauthorized"`
	Message string `json:"message" example:"Not authenticated"`
}

// ErrorResponse wraps errors returned by the API.
type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

// HealthResponse is returned by liveness/readiness probes.
type HealthResponse struct {
	Status   string `json:"status" example:"ok"`
	Database string `json:"database,omitempty" example:"configured"`
}

// RegisterRequest is the JSON body for POST /auth/register.
type RegisterRequest struct {
	Name     string `json:"name" example:"Jane Doe"`
	Email    string `json:"email" example:"jane@church.org"`
	Password string `json:"password" example:"secure-password"`
}

// LoginRequest is the JSON body for POST /auth/login.
type LoginRequest struct {
	Email    string `json:"email" example:"jane@church.org"`
	Password string `json:"password" example:"secure-password"`
}

// UserData is the authenticated user payload.
type UserData struct {
	ID    string   `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name  string   `json:"name" example:"Jane Doe"`
	Email string   `json:"email" example:"jane@church.org"`
	Roles []string `json:"roles" example:"member,admin"`
}

// UserResponse wraps a user in the standard success envelope.
type UserResponse struct {
	Data UserData `json:"data"`
}

// MessageResponse is a simple success message.
type MessageResponse struct {
	Data struct {
		Message string `json:"message" example:"Logged out"`
	} `json:"data"`
}
