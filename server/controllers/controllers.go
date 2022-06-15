// Controllers for interfacing with the MongoDB database.
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

type CollectionInterface interface {
	// Find one by id, name or email.
	// All empty fields are ignored in the search.
	// Populates the user reference passed in and returns it again. Handles nil user as well.
	FindOne(ctx context.Context, user *models.User, id, name, email string) (*models.User, error)

	// Insert a new user into the database.
	// Returns the object ID.
	InsertOne(ctx context.Context, user *models.User) (primitive.ObjectID, error)

	// Modifies/patches a user by ID.
	UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error)

	// Deletes a user by ID.
	DeleteByID(ctx context.Context, id string) (int64, error)
}

type Collection struct {
	collection *mongo.Collection
}

func (c *Collection) FindOne(ctx context.Context, user *models.User, id, name, email string) (*models.User, error) {
	if user == nil {
		// If user is nil, create an empty user.
		user = &models.User{}
	}
	if id == "" && name == "" && email == "" {
		return user, errors.New("cannot leave all params blank")
	}
	params := []interface{}{}
	if id != "" {
		objectId, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			return user, err
		}
		params = append(params, bson.D{{Key: "_id", Value: objectId}})
	}
	if name != "" {
		params = append(params, bson.D{{Key: "name", Value: name}})
	}
	if email != "" {
		params = append(params, bson.D{{Key: "email", Value: email}})
	}
	filter := bson.D{{Key: "$or", Value: params}}
	err := c.collection.FindOne(ctx, filter).Decode(&user)
	return user, err
}

func (c *Collection) InsertOne(ctx context.Context, user *models.User) (primitive.ObjectID, error) {
	result, err := c.collection.InsertOne(ctx, user)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id := result.InsertedID.(primitive.ObjectID)
	return id, nil
}

func (c *Collection) UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error) {
	result, err := c.collection.UpdateByID(ctx, id, params)
	if err != nil {
		return nil, err
	}
	return result, err
}

func (c *Collection) DeleteByID(ctx context.Context, id string) (int64, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return -1, err
	}
	params := bson.D{{Key: "_id", Value: objectID}}
	result, err := c.collection.DeleteOne(ctx, params)
	if err != nil {
		return -1, err
	}
	return result.DeletedCount, nil
}

type Controller struct {
	Collection func(name string, opts ...*options.CollectionOptions) CollectionInterface
	URL        string
}

const (
	databaseName = "OrgaNiUS"
)

func New(client *mongo.Client, URL string) *Controller {
	database := client.Database(databaseName)
	return &Controller{
		func(name string, opts ...*options.CollectionOptions) CollectionInterface {
			return &Collection{
				database.Collection(name, opts...),
			}
		},
		URL,
	}
}
