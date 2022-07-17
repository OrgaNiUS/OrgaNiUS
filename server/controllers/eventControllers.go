package controllers

import (
	"context"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type EventCollectionInterface interface {
	InsertOne(ctx context.Context, event *models.Event) (primitive.ObjectID, error)

	FindOne(ctx context.Context, id string) (*models.Event, error)

	FindAll(ctx context.Context, ids []primitive.ObjectID, events *[]models.Event) error
}

type EventCollection struct {
	eventCollection *mongo.Collection
}

func (c *EventCollection) InsertOne(ctx context.Context, event *models.Event) (primitive.ObjectID, error) {
	result, err := c.eventCollection.InsertOne(ctx, event)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id := result.InsertedID.(primitive.ObjectID)
	return id, nil
}

func (c *EventCollection) FindAll(ctx context.Context, ids []primitive.ObjectID, events *[]models.Event) error {
	params := bson.D{{Key: "_id", Value: bson.D{{Key: "$in", Value: ids}}}}
	cursor, err := c.eventCollection.Find(ctx, params)
	if err != nil {
		return err
	}
	cursor.All(ctx, events)
	return nil
}

func (c *EventCollection) FindOne(ctx context.Context, id string) (*models.Event, error) {
	event := models.Event{}
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return &event, err
	}
	params := bson.D{{Key: "_id", Value: objectId}}
	err = c.eventCollection.FindOne(ctx, params).Decode(&event)
	return &event, err
}

type EventController struct {
	Collection func(name string, opts ...*options.CollectionOptions) EventCollectionInterface
	URL        string
}

func NewE(client *mongo.Client, URL string) *EventController {
	database := client.Database(databaseName)
	return &EventController{
		func(name string, opts ...*options.CollectionOptions) EventCollectionInterface {
			return &EventCollection{
				database.Collection(name, opts...),
			}
		},
		URL,
	}
}
