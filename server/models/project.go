package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Project struct {
	Id           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name         string             `bson:"name" json:"name"`
	Description  string             `bson:"description" json:"description"`
	Members      map[string]string  `bson:"members" json:"members"` // Key: UserID, Value: Role
	Tasks        []string           `bson:"tasks" json:"tasks"`
	CreationTime time.Time          `bson:"creationTime" json:"creationTime"`
	Settings     ProjectSettings    `bson:"settings" json:"settings"`
	Applications []string           `bson:"applications" json:"applications"` // [userid]
	IsPublic     bool               `bson:"isPublic" json:"isPublic"`
}

type ProjectSettings struct {
	Roles                map[string]Permissions `bson:"roles" json:"roles"`
	DeadlineNotification time.Time              `bson:"deadlineNotification" json:"deadlineNotification"`
}

type Permissions struct {
	IsAdmin         bool `bson:"isAdmin" json:"isAdmin"`
	AddMember       bool `bson:"addMember" json:"addMember"`
	RemoveMember    bool `bson:"removeMember" json:"removeMember"`
	EditName        bool `bson:"editName" json:"editName"`
	EditDesc        bool `bson:"editDesc" json:"editDesc"`
	EditSettings    bool `bson:"editSettings" json:"editSettings"`
	AddTask         bool `bson:"addTask" json:"addTask"`
	RemoveTask      bool `bson:"removeTask" json:"removeTask"`
	CanAssignOthers bool `bson:"canAssignOthers" json:"canAssignOthers"`
}

func DefaultSettings() ProjectSettings {
	settings := ProjectSettings{
		// This is the zero time. can check if time is initialised with time.isZero() method.
		// DeadlineNotification: time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC), COMMMENTED OUT, ZERO TIME SHOULD BE AUTOASSIGNED if undefined
	}
	settings.Roles = make(map[string]Permissions)
	settings.Roles["admin"] = Permissions{
		IsAdmin: true,
	}
	settings.Roles["member"] = Permissions{
		AddTask:    true,
		RemoveTask: true,
	}
	return settings
}
