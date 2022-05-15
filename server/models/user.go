package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	Id       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name     string             `bson:"name" json:"name"`
	Email    string             `bson:"email" json:"email"`
	Events   []Event            `bson:"events" json:"events"`
	Tasks    []Task             `bson:"tasks" json:"tasks"`
	Projects []Project          `bson:"projects" json:"projects"`
	Settings UserSettings       `bson:"settings" json:"settings"`
	// password?
}

type UserSettings struct {
	DeadlineNotification time.Time `bson:"deadlineNotification" json:"deadlineNotification"`
	WebNotification      bool      `bson:"webNotification" json:"webNotification"`
	TelegramNotification bool      `bson:"telegramNotification" json:"telegramNotification"`
	EmailNotification    bool      `bson:"emailNotification" json:"emailNotification"`
}
