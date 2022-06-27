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

type UserCollectionInterface interface {
	// Find one by id, name or email.
	// All empty fields are ignored in the search.
	// Populates the user reference passed in and returns it again. Handles nil user as well.
	FindOne(ctx context.Context, user *models.User, id, name, email string) (*models.User, error)

	// Find All users in id array
	FindAll(ctx context.Context, useridArr []primitive.ObjectID, UserArr *[]models.User) error

	// Insert a new user into the database.
	// Returns the object ID.
	InsertOne(ctx context.Context, user *models.User) (primitive.ObjectID, error)

	// Modifies/patches a user by ID.
	UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error)

	// Deletes a user by ID.
	DeleteByID(ctx context.Context, id string) (int64, error)
}

type UserCollection struct {
	userCollection *mongo.Collection
}

func (c *UserCollection) FindOne(ctx context.Context, user *models.User, id, name, email string) (*models.User, error) {
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
	err := c.userCollection.FindOne(ctx, filter).Decode(&user)
	return user, err
}

func (c *UserCollection) FindAll(ctx context.Context, useridArr []primitive.ObjectID, UserArr *[]models.User) error {
	cur, err := c.userCollection.Find(ctx, bson.D{{Key: "_id", Value: bson.D{{Key: "$in", Value: useridArr}}}})
	if err != nil {
		return err
	}
	cur.All(ctx, UserArr)
	return nil
}

func (c *UserCollection) InsertOne(ctx context.Context, user *models.User) (primitive.ObjectID, error) {
	result, err := c.userCollection.InsertOne(ctx, user)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id := result.InsertedID.(primitive.ObjectID)
	return id, nil
}

func (c *UserCollection) UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error) {
	result, err := c.userCollection.UpdateByID(ctx, id, params)
	if err != nil {
		return nil, err
	}
	return result, err
}

func (c *UserCollection) DeleteByID(ctx context.Context, id string) (int64, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return -1, err
	}
	params := bson.D{{Key: "_id", Value: objectID}}
	result, err := c.userCollection.DeleteOne(ctx, params)
	if err != nil {
		return -1, err
	}
	return result.DeletedCount, nil
}

type UserController struct {
	Collection func(name string, opts ...*options.CollectionOptions) UserCollectionInterface
	URL        string
}

const (
	databaseName = "OrgaNiUS"
)

func NewU(client *mongo.Client, URL string) *UserController {
	database := client.Database(databaseName)
	return &UserController{
		func(name string, opts ...*options.CollectionOptions) UserCollectionInterface {
			return &UserCollection{
				database.Collection(name, opts...),
			}
		},
		URL,
	}
}
