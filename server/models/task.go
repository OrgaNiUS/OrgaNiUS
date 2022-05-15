package models

import (
	"time"
)

type Task struct {
	id           int64
	name         string
	assignedTo   []User
	description  string
	creationTime time.Time
	deadline     time.Time
	isDone       bool
	tags         []string
}
