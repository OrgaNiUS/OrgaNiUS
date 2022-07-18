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

	UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error)

	DeleteByID(ctx context.Context, id primitive.ObjectID) (int64, error)
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

func (c *EventCollection) UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error) {
	result, err := c.eventCollection.UpdateByID(ctx, id, params)
	if err != nil {
		return nil, err
	}
	return result, err
}

func (c *EventCollection) DeleteByID(ctx context.Context, id primitive.ObjectID) (int64, error) {
	params := bson.D{{Key: "_id", Value: id}}
	result, err := c.eventCollection.DeleteOne(ctx, params)
	if err != nil {
		return -1, err
	}
	return result.DeletedCount, nil
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
