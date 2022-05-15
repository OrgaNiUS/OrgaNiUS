package models

import (
	"time"
)

type User struct {
	id       int64
	name     string
	email    string
	events   []Event
	tasks    []Task
	projects []Project
	settings UserSettings
	// password?
}

type UserSettings struct {
	deadlineNotification time.Time
	webNotification      bool
	telegramNotification bool
	emailNotification    bool
}
