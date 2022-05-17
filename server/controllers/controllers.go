// Controllers for interfacing with the MongoDB database.
package controllers

import (
	"go.mongodb.org/mongo-driver/mongo"
)

type Controller struct {
	database *mongo.Database
	URL      string
}

const (
	databaseName = "OrgaNiUS"
)

func New(client *mongo.Client, URL string) *Controller {
	return &Controller{
		client.Database(databaseName),
		URL,
	}
}
