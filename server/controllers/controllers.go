// Controllers for interfacing with the MongoDB database.
package controllers

import (
	"go.mongodb.org/mongo-driver/mongo"
)

type Controller struct {
	database *mongo.Database
}

const (
	databaseName = "OrgaNiUS"
)

func New(client *mongo.Client) *Controller {
	return &Controller{client.Database(databaseName)}
}
