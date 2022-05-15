package models

import (
	"time"
)

type Project struct {
	id           int64
	name         string
	description  string
	memberse     []User
	tasks        []Task
	state        string // Upcoming, Ongoing, Completed
	creationTime time.Time
	settings     ProjectSettings
}

type ProjectSettings struct {
	roles                map[string]Permissions
	deadlineNotification time.Time
}

type Permissions struct {
	addMember       bool // can generate shareable links
	removeMember    bool
	editName        bool
	editDesc        bool
	editSettings    bool
	addTask         bool
	removeTask      bool
	canAssignOthers bool
}
