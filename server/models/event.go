package models

import (
	"time"
)

type Event struct {
	id    int64
	name  string
	start time.Time
	end   time.Time
}
