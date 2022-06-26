package controllers

import (
	"context"
	"errors"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


type TaskCollectionInterface interface {
	// Find one task by id or name
	FindOne(ctx context.Context, task *models.Task, id string) (*models.Task, error)

	// Insert a new task into the database
	// Returns the object ID
	InsertOne(ctx context.Context, task *models.Task) (primitive.ObjectID, error)
	
	// Modifies a task by ID
	UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error)

	// Deletes a task by ID
	DeleteByID(ctx context.Context, id string) (int64, error)
}

type TaskCollection struct {
	taskCollection *mongo.Collection
}

func (c *TaskCollection) FindOne(ctx context.Context, task *models.Task, id string) (*models.Task, error) {
	if task == nil {
		// If task is nil, create an empty task.
		task = &models.Task{}
	}
	if id == "" {
		return task, errors.New("cannot leave all params blank")
	}
	params := []interface{}{}
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return task, err
	}
	params = append(params, bson.D{{Key: "_id", Value: objectId}})
	filter := bson.D{{Key: "$or", Value: params}}
	err2 := c.taskCollection.FindOne(ctx, filter).Decode(&task)
	return task, err2
}

func (c *TaskCollection) InsertOne(ctx context.Context, task *models.Task) (primitive.ObjectID, error) {
	result, err := c.taskCollection.InsertOne(ctx, task)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id := result.InsertedID.(primitive.ObjectID)
	return id, nil
}

func (c *TaskCollection) UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error) {
	result, err := c.taskCollection.UpdateByID(ctx, id, params)
	if err != nil {
		return nil, err
	}
	return result, err
}

func (c *TaskCollection) DeleteByID(ctx context.Context, id string) (int64, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return -1, err
	}
	params := bson.D{{Key: "_id", Value: objectID}}
	result, err := c.taskCollection.DeleteOne(ctx, params)
	if err != nil {
		return -1, err
	}
	return result.DeletedCount, nil
}

type TaskController struct {
	Collection func(name string, opts ...*options.CollectionOptions) TaskCollectionInterface
	URL        string
}


func NewT(client *mongo.Client, URL string) *TaskController {
	database := client.Database(databaseName) // databaseName declared in userControllers
	return &TaskController{
		func(name string, opts ...*options.CollectionOptions) TaskCollectionInterface {
			return &TaskCollection{
				database.Collection(name, opts...),
			}
		},
		URL,
	}
}