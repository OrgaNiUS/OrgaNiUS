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
	userCollection = "users"
)

// Retrives a user by id or name.
func (c *UserController) UserRetrieve(ctx context.Context, id, name string) (models.User, error) {
	var user models.User
	if id == "" && name == "" {
		return user, errors.New("cannot leave both user id and name empty")
	}
	_, err := c.Collection(userCollection).FindOne(ctx, &user, id, name, "")

	return user, err
}

// Checks if a user with a particular name OR email exists.
func (c *UserController) UserExists(ctx context.Context, name, email string) (bool, error) {
	var user models.User
	if name == "" && email == "" {
		return false, errors.New("cannot leave both name and email empty")
	}
	_, err := c.Collection(userCollection).FindOne(ctx, &user, "", name, email)
	if err == nil {
		return true, nil
	} else if err != mongo.ErrNoDocuments {
		return false, err
	}
	return false, nil
}

// Creates a new user.
func (c *UserController) UserCreate(ctx context.Context, user *models.User) error {
	id, err := c.Collection(userCollection).InsertOne(ctx, user)
	if err != nil {
		return err
	}
	user.Id = id
	return nil
}

// Verifies PIN from email verification. If successful, also marks the user as verified in the database.
// Also returns the user ID for creation of JWT.
func (c *UserController) UserVerifyPin(ctx context.Context, name, pin string) (primitive.ObjectID, error) {
	var user models.User
	_, err := c.Collection(userCollection).FindOne(ctx, &user, "", name, "")
	if err != nil {
		return primitive.NilObjectID, err
	}
	if auth.CheckPasswordHash(user.VerificationPin, pin) {
		update := bson.D{{Key: "$set", Value: bson.D{
			{Key: "verified", Value: true},
			{Key: "verificationPin", Value: ""},
		}}}
		if _, err := c.Collection(userCollection).UpdateByID(ctx, user.Id, update); err != nil {
			return primitive.NilObjectID, err
		}
		return user.Id, nil
	}
	return primitive.NilObjectID, errors.New("wrong pin")
}

// Checks whether the password matches the hashed password for a particular username.
// Also validates if the user is verified.
func (c *UserController) UserCheckPassword(ctx context.Context, user *models.User) (bool, error) {
	password := user.Password
	_, err := c.Collection(userCollection).FindOne(ctx, user, "", user.Name, "")
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
func (c *UserController) UserForgotPW(ctx context.Context, name, hash string) (string, error) {
	var user models.User
	_, err := c.Collection(userCollection).FindOne(ctx, &user, "", name, "")
	if err != nil {
		return "", err
	} else if !user.Verified {
		return "", errors.New("user not verified")
	}
	update := bson.D{{Key: "$set", Value: bson.D{
		{Key: "forgotPw", Value: true},
		{Key: "forgotPwPin", Value: hash},
	}}}
	if _, err := c.Collection(userCollection).UpdateByID(ctx, user.Id, update); err != nil {
		return "", err
	}
	return user.Email, nil
}

// Step 2 of Forgot Password protocol.
func (c *UserController) UserVerifyForgotPW(ctx context.Context, name, pin string) (bool, error) {
	var user models.User
	_, err := c.Collection(userCollection).FindOne(ctx, &user, "", name, "")
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
func (c *UserController) UserChangeForgotPW(ctx context.Context, name, pin, hash string) error {
	var user models.User
	_, err := c.Collection(userCollection).FindOne(ctx, &user, "", name, "")
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
	if _, err := c.Collection(userCollection).UpdateByID(ctx, user.Id, update); err != nil {
		return err
	}
	return nil
}

// Modifies the user's Name, Password, Email.
func (c *UserController) UserModify(ctx context.Context, user *models.User) {
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
	c.Collection(userCollection).UpdateByID(ctx, user.Id, update)
}

// Deletes the user.
func (c *UserController) UserDelete(ctx context.Context, id string) error {
	_, err := c.Collection(userCollection).DeleteByID(ctx, id)
	if err != nil {
		return err
	}
	return nil
}

func (c *UserController) UserAddProject(ctx context.Context, userid primitive.ObjectID, projectid string) {
	params := bson.D{}
	params = append(params, bson.E{Key: "projects", Value: projectid})
	update := bson.D{{Key: "$addToSet", Value: params}}
	c.Collection(userCollection).UpdateByID(ctx, userid, update)
}

func (c *UserController) UsersAddProject(ctx context.Context, useridArr []string, projectId string) {
	params := bson.D{{Key: "$addToSet", Value: bson.D{{Key: "projects", Value: projectId}}}}
	var primitiveArr []primitive.ObjectID
	for _, userid := range useridArr {
		primitiveId, _ := primitive.ObjectIDFromHex(userid)
		primitiveArr = append(primitiveArr, primitiveId)
	}
	c.Collection(userCollection).UpdateManyByID(ctx, primitiveArr, params)
}

func (c *UserController) UsersDeleteProject(ctx context.Context, useridArr []string, projectId string) {
	params := bson.D{{Key: "$pull", Value: bson.D{{Key: "projects", Value: projectId}}}}
	if len(useridArr) == 0 {
		c.Collection(userCollection).UpdateAll(ctx, params)
	} else {
		var primitiveArr []primitive.ObjectID
		for _, userid := range useridArr {
			primitiveId, _ := primitive.ObjectIDFromHex(userid)
			primitiveArr = append(primitiveArr, primitiveId)
		}
		c.Collection(userCollection).UpdateManyByID(ctx, primitiveArr, params)
	}
}

func (c *UserController) UsersInviteFromProject(ctx context.Context, usernames []string, projectId string) {
	params := bson.D{{Key: "$addToSet", Value: bson.D{{Key: "invites", Value: projectId}}}}
	c.Collection(userCollection).UpdateManyByName(ctx, usernames, params)
}

// Modifies task array of user
func (c *UserController) UserModifyTask(ctx context.Context, user *models.User) {
	params := bson.D{}
	params = append(params, bson.E{Key: "tasks", Value: user.Tasks})
	update := bson.D{{Key: "$set", Value: params}}
	c.Collection(userCollection).UpdateByID(ctx, user.Id, update)
}

func (c *UserController) UserMapToArray(ctx context.Context, useridStrArr []string) []models.User {
	usersArray := []models.User{}
	useridArr := []primitive.ObjectID{}
	for _, userid := range useridStrArr {
		id, _ := primitive.ObjectIDFromHex(userid)
		useridArr = append(useridArr, id)
	}
	c.Collection(userCollection).FindAll(ctx, useridArr, &usersArray)
	return usersArray
}

func (c *UserController) UserDeleteInvites(ctx context.Context, userid string, projectids []string) {
	params := bson.D{}
	params = append(params, bson.E{Key: "invites", Value: bson.D{{Key: "$in", Value: projectids}}})
	update := bson.D{{Key: "$pull", Value: params}}
	id, _ := primitive.ObjectIDFromHex(userid)
	c.Collection(userCollection).UpdateByID(ctx, id, update)
}

// adds multiple events to a user
func (c *UserController) UserAddEvents(ctx context.Context, userid string, eventids []string) {
	update := bson.D{
		{Key: "$addToSet", Value: bson.D{
			{Key: "events", Value: bson.D{{Key: "$each", Value: eventids}}},
		}},
	}
	id, _ := primitive.ObjectIDFromHex(userid)
	c.Collection(userCollection).UpdateByID(ctx, id, update)
}

func (c *UserController) UserRemoveEvents(ctx context.Context, userid primitive.ObjectID, eventids []string) {
	update := bson.D{
		{Key: "$pull", Value: bson.D{
			{Key: "events", Value: bson.D{{Key: "$in", Value: eventids}}},
		}},
	}
	c.Collection(userCollection).UpdateByID(ctx, userid, update)
}

/*
OrgaNiUS.projects

index name: autoCompleteUsers
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": [
        {
          "foldDiacritics": true,
          "maxGrams": 15,
          "minGrams": 2,
          "tokenization": "edgeGram",
          "type": "autocomplete"
        }
      ]
    }
  }
}
*/

func (c *UserController) ProjectInviteSearch(ctx context.Context, projectid, query string) ([]bson.D, error) {
	const searchLimit = 10
	if query == "" {
		// autocomplete.query cannot be empty!
		// we will just return no results instead
		return []bson.D{}, nil
	}
	searchStage := bson.D{
		{
			Key: "$search",
			Value: bson.D{
				{Key: "index", Value: "autoCompleteUsers"},
				{Key: "autocomplete", Value: bson.D{
					{Key: "path", Value: "name"},
					{Key: "query", Value: query},
					{Key: "tokenOrder", Value: "sequential"},
					{Key: "fuzzy", Value: bson.D{
						{Key: "maxEdits", Value: 1},
						{Key: "prefixLength", Value: 1},
						{Key: "maxExpansions", Value: 256},
					}},
				}},
			},
		},
	}
	filterStage := bson.D{
		{Key: "$match", Value: bson.D{
			// filter out the users who are already in the project
			{Key: "projects", Value: bson.D{{Key: "$ne", Value: projectid}}},
		}},
	}
	limitStage := bson.D{
		{Key: "$limit", Value: searchLimit},
	}
	projectStage := bson.D{
		{
			Key: "$project",
			Value: bson.D{
				{Key: "_id", Value: 0}, /* hide _id field */
				{Key: "id", Value: bson.D{{Key: "$toString", Value: "$_id"}}}, /* create a id field that is _id's value (essentially renaming the field & changing to string) */
				{Key: "name", Value: 1},
			},
		},
	}

	// run pipeline
	cursor, err := c.Collection(userCollection).Aggregate(ctx, mongo.Pipeline{searchStage, filterStage, limitStage, projectStage})

	var results []bson.D
	if err != nil {
		return nil, err
	}

	if cursor == nil {
		return results, errors.New("check server project controller")
	}
	if err = cursor.All(ctx, &results); err != nil {
		return results, err
	}

	return results, nil
}
