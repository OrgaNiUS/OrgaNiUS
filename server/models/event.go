package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Event struct {
	Id    primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name  string             `bson:"name" json:"name"`
	Start time.Time          `bson:"start" json:"start"`
	End   time.Time          `bson:"end" json:"end"`
}
