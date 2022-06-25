package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	Id              primitive.ObjectID  `bson:"_id,omitempty" json:"id,omitempty"`
	Name            string              `bson:"name" json:"name"`
	Password        string              `bson:"password" json:"password"`
	Email           string              `bson:"email" json:"email"`
	Verified        bool                `bson:"verified" json:"verified"`
	VerificationPin string              `bson:"verificationPin" json:"verificationPin"`
	ForgotPW        bool                `bson:"forgotPw" json:"forgotPw"`
	ForgotPWPin     string              `bson:"forgotPwPin" json:"forgotPwPin"`
	Events          map[string]struct{} `bson:"events" json:"events"`
	Tasks           map[string]bool     `bson:"tasks" json:"tasks"`
	Projects        map[string]struct{} `bson:"projects" json:"projects"`
	Settings        UserSettings        `bson:"settings" json:"settings"`
}

type UserSettings struct {
	DeadlineNotification time.Time `bson:"deadlineNotification" json:"deadlineNotification"`
	WebNotification      bool      `bson:"webNotification" json:"webNotification"`
	TelegramNotification bool      `bson:"telegramNotification" json:"telegramNotification"`
	EmailNotification    bool      `bson:"emailNotification" json:"emailNotification"`
}
