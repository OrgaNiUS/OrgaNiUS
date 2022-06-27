package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Task struct {
	Id           primitive.ObjectID  `bson:"_id,omitempty" json:"id,omitempty"`
	Name         string              `bson:"name" json:"name"`
	AssignedTo   map[string]struct{} `bson:"assignedTo" json:"assignedTo"`
	Description  string              `bson:"description" json:"description"`
	CreationTime time.Time           `bson:"creationTime" json:"creationTime"`
	Deadline     time.Time           `bson:"deadline" json:"deadline"`
	IsDone       bool                `bson:"isDone" json:"isDone"`
	Tags         []string            `bson:"tags" json:"tags"`
	IsPersonal   bool                `bson:"isPersonal" json:"isPersonal"`
}
