package controllers

import (
	"context"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	collection = "users"
)

// Returns a bson.D object for filtering
func filterBy(key string, value interface{}) bson.D {
	return bson.D{{Key: key, Value: value}}
}

// Returns a bson.D object for filtering by ID
func filterByID(id string) (bson.D, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	return filterBy("_id", objectID), nil
}

// Retrives a user by id
func (c *Controller) UserRetrieve(ctx context.Context, id string) (models.User, error) {
	var user models.User
	filter, err := filterByID(id)
	if err != nil {
		return user, err
	}
	err = c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	return user, err
}

// Checks if a user with a particular name OR email exists
func (c *Controller) UserExists(ctx context.Context, name, email string) (bool, error) {
	var user models.User
	filter := bson.D{
		{Key: "$or", Value: []interface{}{
			bson.D{{Key: "name", Value: name}},
			bson.D{{Key: "email", Value: email}},
		}},
	}
	err := c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	if err == nil {
		return true, nil
	} else if err != mongo.ErrNoDocuments {
		return false, err
	}
	return false, nil
}

// Creates a new user
func (c *Controller) UserCreate(ctx context.Context, user *models.User) error {
	result, err := c.database.Collection(collection).InsertOne(ctx, user)
	if err != nil {
		return err
	}
	user.Id = result.InsertedID.(primitive.ObjectID)
	return nil
}

// Modifies the user
func (c *Controller) UserModify(ctx context.Context, user *models.User) {
	panic("Not yet implemented!")
}

// Deletes the user
func (c *Controller) UserDelete(ctx context.Context, id string) error {
	doc, err := filterByID(id)
	if err != nil {
		return err
	}
	_, err = c.database.Collection(collection).DeleteOne(ctx, doc)
	if err != nil {
		return err
	}
	return nil
}
