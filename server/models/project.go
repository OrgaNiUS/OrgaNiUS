package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Project struct {
	Id           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name         string             `bson:"name" json:"name"`
	Description  string             `bson:"description" json:"description"`
	Members      []User             `bson:"members" json:"members"`
	Tasks        []Task             `bson:"tasks" json:"tasks"`
	State        string             `bson:"state" json:"state"`
	CreationTime time.Time          `bson:"creationTime" json:"creationTime"`
	Settings     ProjectSettings    `bson:"settings" json:"settings"`
}

type ProjectSettings struct {
	Roles                map[string]Permissions `bson:"roles" json:"roles"`
	DeadlineNotification time.Time              `bson:"deadlineNotification" json:"deadlineNotification"`
}

type Permissions struct {
	AddMember       bool `bson:"addMember" json:"addMember"`
	RemoveMember    bool `bson:"removeMember" json:"removeMember"`
	EditName        bool `bson:"editName" json:"editName"`
	EditDesc        bool `bson:"editDesc" json:"editDesc"`
	EditSettings    bool `bson:"editSettings" json:"editSettings"`
	AddTask         bool `bson:"addTask" json:"addTask"`
	RemoveTask      bool `bson:"removeTask" json:"removeTask"`
	CanAssignOthers bool `bson:"canAssignOthers" json:"canAssignOthers"`
}
