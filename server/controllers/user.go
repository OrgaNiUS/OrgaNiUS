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

// Returns a bson.D object for filtering.
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

// Retrives a user by id or name.
func (c *Controller) UserRetrieve(ctx context.Context, id, name string) (models.User, error) {
	var user models.User
	if id == "" && name == "" {
		return user, errors.New("cannot leave both id and name empty")
	}
	var objectId primitive.ObjectID
	var err error
	params := []interface{}{}
	if id != "" {
		objectId, err = primitive.ObjectIDFromHex(id)
		if err != nil {
			return user, err
		}
		params = append(params, bson.D{{Key: "_id", Value: objectId}})
	}
	if name != "" {
		params = append(params, bson.D{{Key: "name", Value: name}})
	}
	filter := bson.D{{Key: "$or", Value: params}}
	err = c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	return user, err
}

// Checks if a user with a particular name OR email exists.
func (c *Controller) UserExists(ctx context.Context, name, email string) (bool, error) {
	var user models.User
	if name == "" && email == "" {
		return false, errors.New("cannot leave both name and email empty")
	}
	params := []interface{}{}
	if name != "" {
		params = append(params, bson.D{{Key: "name", Value: name}})
	}
	if email != "" {
		params = append(params, bson.D{{Key: "email", Value: email}})
	}
	filter := bson.D{{Key: "$or", Value: params}}
	err := c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	if err == nil {
		return true, nil
	} else if err != mongo.ErrNoDocuments {
		return false, err
	}
	return false, nil
}

// Creates a new user.
func (c *Controller) UserCreate(ctx context.Context, user *models.User) error {
	result, err := c.database.Collection(collection).InsertOne(ctx, user)
	if err != nil {
		return err
	}
	user.Id = result.InsertedID.(primitive.ObjectID)
	return nil
}

// Verifies PIN from email verification. If successful, also marks the user as verified in the database.
// Also returns the user ID for creation of JWT.
func (c *Controller) UserVerifyPin(ctx context.Context, name, pin string) (primitive.ObjectID, error) {
	var user models.User
	filter := bson.D{{Key: "name", Value: name}}
	err := c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return primitive.NilObjectID, err
	}
	if auth.CheckPasswordHash(user.VerificationPin, pin) {
		update := bson.D{{Key: "$set", Value: bson.D{
			{Key: "verified", Value: true},
			{Key: "verificationPin", Value: ""},
		}}}
		if _, err := c.database.Collection(collection).UpdateByID(ctx, user.Id, update); err != nil {
			return primitive.NilObjectID, err
		}
		return user.Id, nil
	}
	return primitive.NilObjectID, errors.New("wrong pin")
}

// Checks whether the password matches the hashed password for a particular username.
// Also validates if the user is verified.
func (c *Controller) UserCheckPassword(ctx context.Context, user *models.User) (bool, error) {
	password := user.Password
	filter := bson.D{{Key: "name", Value: user.Name}}
	err := c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return false, errors.New("username and password do not match")
	} else if !user.Verified {
		return false, errors.New("please verify the account first")
	}
	if !auth.CheckPasswordHash(user.Password, password) {
		return false, errors.New("username and password do not match")
	}
	return true, nil
}

// Step 1 of Forgot Password protocol.
// If user requests for password reset multiple times, only the latest one will be valid.
func (c *Controller) UserForgotPW(ctx context.Context, name, hash string) (string, error) {
	var user models.User
	filter := bson.D{{Key: "name", Value: name}}
	err := c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return "", err
	} else if !user.Verified {
		return "", errors.New("user not verified")
	}
	update := bson.D{{Key: "$set", Value: bson.D{
		{Key: "forgotPw", Value: true},
		{Key: "forgotPwPin", Value: hash},
	}}}
	if _, err := c.database.Collection(collection).UpdateByID(ctx, user.Id, update); err != nil {
		return "", err
	}
	return user.Email, nil
}

// Step 2 of Forgot Password protocol.
func (c *Controller) UserVerifyForgotPW(ctx context.Context, name, pin string) (bool, error) {
	var user models.User
	filter := bson.D{{Key: "name", Value: name}}
	err := c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return false, err
	} else if !user.ForgotPW {
		return false, errors.New("user did not request for a password reset")
	} else if !auth.CheckPasswordHash(user.ForgotPWPin, pin) {
		return false, errors.New("pin is incorrect")
	}
	return true, err
}

// Step 3 of Forgot Password protocol.
func (c *Controller) UserChangeForgotPW(ctx context.Context, name, pin, hash string) error {
	var user models.User
	filter := bson.D{{Key: "name", Value: name}}
	err := c.database.Collection(collection).FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return err
	} else if !user.ForgotPW {
		return errors.New("user did not request for a password reset")
	} else if !auth.CheckPasswordHash(user.ForgotPWPin, pin) {
		return errors.New("pin is incorrect")
	}
	update := bson.D{{Key: "$set", Value: bson.D{
		{Key: "forgotPw", Value: false},
		{Key: "forgotPwPin", Value: ""},
		{Key: "password", Value: hash},
	}}}
	if _, err := c.database.Collection(collection).UpdateByID(ctx, user.Id, update); err != nil {
		return err
	}
	return nil
}

// Modifies the user's Name, Password, Email.
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

// Deletes the user.
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
