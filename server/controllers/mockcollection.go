package controllers

import (
	"context"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Everything in this file is only to be used for testing purposes.
// It cannot be placed in a test package because it is shared between handlers test and controllers test.

type MockCollection struct {
	Data map[primitive.ObjectID]*models.User
}

func (c *MockCollection) FindOne(ctx context.Context, user *models.User, id, name, email string) (*models.User, error) {
	if user == nil {
		user = &models.User{}
	}
	objectId := primitive.NilObjectID
	if id != "" {
		var err error
		objectId, err = primitive.ObjectIDFromHex(id)
		if err != nil {
			return user, err
		}
	}
	for _, u := range c.Data {
		if u.Id == objectId {
			*user = *u
			return u, nil
		} else if u.Name == name {
			*user = *u
			return u, nil
		} else if u.Email == email {
			*user = *u
			return u, nil
		}
	}
	return user, mongo.ErrNoDocuments
}

func (c *MockCollection) InsertOne(ctx context.Context, user *models.User) (primitive.ObjectID, error) {
	if user.Id == primitive.NilObjectID {
		user.Id = primitive.NewObjectID()
	}
	id := user.Id
	c.Data[id] = user
	return id, nil
}

func (c *MockCollection) UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error) {
	var upsert int64 = 0
	var upsertedID primitive.ObjectID = primitive.NilObjectID
	if _, ok := c.Data[id]; !ok {
		// if not in map, "upsert" it
		upsert = 1
		upsertedID = id
	}
	user := c.Data[id]
	for _, x := range params.Map()["$set"].(primitive.D) {
		k := x.Key
		v := x.Value
		if k == "_id" {
			user.Id = v.(primitive.ObjectID)
		} else if k == "name" {
			user.Name = v.(string)
		} else if k == "email" {
			user.Email = v.(string)
		} else if k == "password" {
			user.Password = v.(string)
		} else if k == "verified" {
			user.Verified = v.(bool)
		} else if k == "verificationPin" {
			user.VerificationPin = v.(string)
		} else if k == "forgotPw" {
			user.ForgotPW = v.(bool)
		} else if k == "forgotPwPin" {
			user.ForgotPWPin = v.(string)
		}
	}
	return &mongo.UpdateResult{
		MatchedCount:  1,
		ModifiedCount: 1,
		UpsertedCount: upsert,
		UpsertedID:    upsertedID,
	}, nil
}

func (c *MockCollection) DeleteByID(ctx context.Context, id string) (int64, error) {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return 0, nil
	}
	if _, ok := c.Data[objectId]; !ok {
		// if not in map, return 0 changed
		return 0, nil
	}
	delete(c.Data, objectId)
	return 1, nil
}

const (
	TEST_URL = ""
)

// Creates a controller populated with some data.
func GetMockController(data []*models.User) ([]primitive.ObjectID, Controller) {
	collection := &MockCollection{
		Data: map[primitive.ObjectID]*models.User{},
	}

	ids := []primitive.ObjectID{}
	for i := 0; i < len(data); i++ {
		user := data[i]
		if user.Id == primitive.NilObjectID {
			// if nil, populate with some object id
			user.Id = primitive.NewObjectID()
		}
		id := user.Id
		ids = append(ids, id)
		collection.Data[id] = user
	}

	controller := Controller{
		Collection: func(name string, opts ...*options.CollectionOptions) CollectionInterface {
			return collection
		},
		URL: TEST_URL,
	}

	return ids, controller
}
