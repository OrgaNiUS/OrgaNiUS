package controllers

import (
	"context"
	"errors"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
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

// Retrives a user by id or name
// empty input will be ignored
func (c *Controller) UserRetrieve(ctx context.Context, id, name string) (models.User, error) {
	var user models.User
	var filter primitive.D
	if id == "" && name == "" {
		return user, errors.New("cannot leave both id and name empty")
	}
	var objectId primitive.ObjectID
	var err error
	if id != "" {
		objectId, err = primitive.ObjectIDFromHex(id)
		if err != nil {
			return user, err
		}
	}
	if id != "" && name != "" {
		// if both not empty, filter by both
		filter = bson.D{
			{Key: "$or", Value: []interface{}{
				bson.D{{Key: "_id", Value: objectId}},
				bson.D{{Key: "name", Value: name}},
			}},
		}
	} else if id != "" {
		filter = bson.D{{Key: "_id", Value: objectId}}
	} else if name != "" {
		filter = bson.D{{Key: "name", Value: name}}
	}
	err = c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	return user, err
}

// Checks if a user with a particular name OR email exists
func (c *Controller) UserExists(ctx context.Context, name, email string) (bool, error) {
	var user models.User
	var filter bson.D
	if name == "" && email == "" {
		return false, errors.New("cannot leave both name and email empty")
	}
	if name != "" && email != "" {
		// if both not empty, filter by both
		filter = bson.D{
			{Key: "$or", Value: []interface{}{
				bson.D{{Key: "name", Value: name}},
				bson.D{{Key: "email", Value: email}},
			}},
		}
	} else if name != "" {
		filter = bson.D{{Key: "name", Value: name}}
	} else if email != "" {
		filter = bson.D{{Key: "email", Value: email}}
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

// Checks whether the password matches the hashed password for a particular username
func (c *Controller) UserCheckPassword(ctx context.Context, user *models.User) (bool, error) {
	password := user.Password
	filter := bson.D{{Key: "name", Value: user.Name}}
	err := c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return false, err
	}
	return auth.CheckPasswordHash(user.Password, password), nil
}

// Modifies the user
func (c *Controller) UserModify(ctx context.Context, user *models.User) {
	params := bson.D{}
	if user.Name != "" {
		params = append(params, bson.E{Key: "name", Value: user.Name})
	}
	if user.Password != "" {
		params = append(params, bson.E{Key: "password", Value: user.Password})
	}
	if user.Email != "" {
		params = append(params, bson.E{Key: "email", Value: user.Email})
	}
	update := bson.D{{Key: "$set", Value: params}}
	c.database.Collection(collection).UpdateByID(ctx, user.Id, update)
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
