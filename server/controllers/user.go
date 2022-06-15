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

// Retrives a user by id or name.
func (c *Controller) UserRetrieve(ctx context.Context, id, name string) (models.User, error) {
	var user models.User
	if id == "" && name == "" {
		return user, errors.New("cannot leave both id and name empty")
	}
	_, err := c.Collection(collection).FindOne(ctx, &user, id, name, "")
	return user, err
}

// Checks if a user with a particular name OR email exists.
func (c *Controller) UserExists(ctx context.Context, name, email string) (bool, error) {
	var user models.User
	if name == "" && email == "" {
		return false, errors.New("cannot leave both name and email empty")
	}
	_, err := c.Collection(collection).FindOne(ctx, &user, "", name, email)
	if err == nil {
		return true, nil
	} else if err != mongo.ErrNoDocuments {
		return false, err
	}
	return false, nil
}

// Creates a new user.
func (c *Controller) UserCreate(ctx context.Context, user *models.User) error {
	id, err := c.Collection(collection).InsertOne(ctx, user)
	if err != nil {
		return err
	}
	user.Id = id
	return nil
}

// Verifies PIN from email verification. If successful, also marks the user as verified in the database.
// Also returns the user ID for creation of JWT.
func (c *Controller) UserVerifyPin(ctx context.Context, name, pin string) (primitive.ObjectID, error) {
	var user models.User
	_, err := c.Collection(collection).FindOne(ctx, &user, "", name, "")
	if err != nil {
		return primitive.NilObjectID, err
	}
	if auth.CheckPasswordHash(user.VerificationPin, pin) {
		update := bson.D{{Key: "$set", Value: bson.D{
			{Key: "verified", Value: true},
			{Key: "verificationPin", Value: ""},
		}}}
		if _, err := c.Collection(collection).UpdateByID(ctx, user.Id, update); err != nil {
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
	_, err := c.Collection(collection).FindOne(ctx, user, "", user.Name, "")
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
	_, err := c.Collection(collection).FindOne(ctx, &user, "", name, "")
	if err != nil {
		return "", err
	} else if !user.Verified {
		return "", errors.New("user not verified")
	}
	update := bson.D{{Key: "$set", Value: bson.D{
		{Key: "forgotPw", Value: true},
		{Key: "forgotPwPin", Value: hash},
	}}}
	if _, err := c.Collection(collection).UpdateByID(ctx, user.Id, update); err != nil {
		return "", err
	}
	return user.Email, nil
}

// Step 2 of Forgot Password protocol.
func (c *Controller) UserVerifyForgotPW(ctx context.Context, name, pin string) (bool, error) {
	var user models.User
	_, err := c.Collection(collection).FindOne(ctx, &user, "", name, "")
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
	_, err := c.Collection(collection).FindOne(ctx, &user, "", name, "")
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
	if _, err := c.Collection(collection).UpdateByID(ctx, user.Id, update); err != nil {
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
	c.Collection(collection).UpdateByID(ctx, user.Id, update)
}

// Deletes the user.
func (c *Controller) UserDelete(ctx context.Context, id string) error {
	_, err := c.Collection(collection).DeleteByID(ctx, id)
	if err != nil {
		return err
	}
	return nil
}
