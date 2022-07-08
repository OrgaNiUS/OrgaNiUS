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

type ProjectCollectionInterface interface {
	// Find one project by id or name
	FindOne(ctx context.Context, project *models.Project, id string) (*models.Project, error)

	// Find All projects in id array
	FindAll(ctx context.Context, projectidArr []primitive.ObjectID, ProjectArr *[]models.Project) error

	// Insert a new project into the database
	// Returns the object ID
	InsertOne(ctx context.Context, project *models.Project) (primitive.ObjectID, error)

	// Modifies a project by ID
	UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error)

	// Deletes a project by ID
	DeleteByID(ctx context.Context, id string) (int64, error)
}

type ProjectCollection struct {
	projectCollection *mongo.Collection
}

func (c *ProjectCollection) FindOne(ctx context.Context, project *models.Project, id string) (*models.Project, error) {
	if project == nil {
		// If project is nil, create an empty project.
		project = &models.Project{}
	}
	if id == "" {
		return project, errors.New("cannot leave all params blank")
	}
	params := []interface{}{}
	if id != "" {
		objectId, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			return project, err
		}
		params = append(params, bson.D{{Key: "_id", Value: objectId}})
	}
	filter := bson.D{{Key: "$or", Value: params}}
	err := c.projectCollection.FindOne(ctx, filter).Decode(&project)
	return project, err
}

func (c *ProjectCollection) FindAll(ctx context.Context, projectidArr []primitive.ObjectID, ProjectArr *[]models.Project) error {
	cur, err := c.projectCollection.Find(ctx, bson.D{{Key: "_id", Value: bson.D{{Key: "$in", Value: projectidArr}}}})
	if err != nil {
		return err
	}
	cur.All(ctx, ProjectArr)
	return nil
}

func (c *ProjectCollection) InsertOne(ctx context.Context, project *models.Project) (primitive.ObjectID, error) {
	result, err := c.projectCollection.InsertOne(ctx, project)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id := result.InsertedID.(primitive.ObjectID)
	return id, nil
}

func (c *ProjectCollection) UpdateByID(ctx context.Context, id primitive.ObjectID, params bson.D) (*mongo.UpdateResult, error) {
	result, err := c.projectCollection.UpdateByID(ctx, id, params)
	if err != nil {
		return nil, err
	}
	return result, err
}

func (c *ProjectCollection) DeleteByID(ctx context.Context, id string) (int64, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return -1, err
	}
	params := bson.D{{Key: "_id", Value: objectID}}
	result, err := c.projectCollection.DeleteOne(ctx, params)
	if err != nil {
		return -1, err
	}
	return result.DeletedCount, nil
}

type ProjectController struct {
	Collection func(name string, opts ...*options.CollectionOptions) ProjectCollectionInterface
	URL        string
}

func NewP(client *mongo.Client, URL string) *ProjectController {
	database := client.Database(databaseName) // databaseName declared in userControllers
	return &ProjectController{
		func(name string, opts ...*options.CollectionOptions) ProjectCollectionInterface {
			return &ProjectCollection{
				database.Collection(name, opts...),
			}
		},
		URL,
	}
}
