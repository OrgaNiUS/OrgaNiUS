package controllers

import (
	"context"
	"errors"
	"time"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	projectCollection = "projects"
)

// Returns the project associated with the id
func (c *ProjectController) ProjectRetrieve(ctx context.Context, id string) (models.Project, error) {
	var project models.Project
	if id == "" {
		return project, errors.New("cannot leave both id and name empty")
	}
	_, err := c.Collection(projectCollection).FindOne(ctx, &project, id)

	return project, err
}

func (c *ProjectController) ProjectCreate(ctx context.Context, project *models.Project, userid string) error {

	project.Members = map[string]string{
		userid: "admin",
	}
	project.CreationTime = time.Now()
	project.Tasks = []string{}
	project.Settings = models.DefaultSettings()
	project.Applications = make(map[string]models.ProjectApplication)
	project.IsPublic = true

	id, err := c.Collection(projectCollection).InsertOne(ctx, project)

	if err != nil {
		return err
	}
	project.Id = id

	return nil
}

// Deletes the project.
func (c *ProjectController) ProjectDelete(ctx context.Context, id string) error {
	_, err := c.Collection(projectCollection).DeleteByID(ctx, id)
	if err != nil {
		return err
	}
	return nil
}

// Updates
func (c *ProjectController) ProjectModifyGeneral(ctx context.Context, Id primitive.ObjectID, Name, Description *string, IsPublic *bool) {
	params := bson.D{}
	if Name != nil {
		params = append(params, bson.E{Key: "name", Value: *Name})
	}
	if Description != nil {
		params = append(params, bson.E{Key: "description", Value: *Description})
	}
	if IsPublic != nil {
		params = append(params, bson.E{Key: "isPublic", Value: *IsPublic})
	}
	update := bson.D{{Key: "$set", Value: params}}
	c.Collection(projectCollection).UpdateByID(ctx, Id, update)
}

func (c *ProjectController) ProjectModifyTask(ctx context.Context, project *models.Project) {
	params := bson.D{}
	params = append(params, bson.E{Key: "tasks", Value: project.Tasks})
	update := bson.D{{Key: "$set", Value: params}}
	c.Collection(projectCollection).UpdateByID(ctx, project.Id, update)
}

func (c *ProjectController) ProjectModifyUser(ctx context.Context, project *models.Project) {
	params := bson.D{}
	params = append(params, bson.E{Key: "members", Value: project.Members})
	update := bson.D{{Key: "$set", Value: params}}
	c.Collection(projectCollection).UpdateByID(ctx, project.Id, update)
}

// Delete multiple tasks from project.Tasks
func (c *ProjectController) ProjectDeleteTasks(ctx context.Context, projectId string, taskIds []string) {
	params := bson.D{}
	params = append(params, bson.E{Key: "tasks", Value: bson.D{{Key: "$in", Value: taskIds}}})
	update := bson.D{{Key: "$pull", Value: params}}
	id, _ := primitive.ObjectIDFromHex(projectId)
	c.Collection(projectCollection).UpdateByID(ctx, id, update)
}

// if the same user applies multiple times, it will override the previous application
func (c *ProjectController) ProjectAddAppl(ctx context.Context, projectId, userId, description string) {
	application := models.ProjectApplication{
		Id:          userId,
		Description: description,
	}
	update := bson.D{{Key: "$set", Value: bson.D{{Key: "applications." + userId, Value: application}}}}
	id, _ := primitive.ObjectIDFromHex(projectId)
	c.Collection(projectCollection).UpdateByID(ctx, id, update)
}

func (c *ProjectController) ProjectRemoveAppl(ctx context.Context, projectId string, userIds []string) {
	unsetIds := bson.D{}
	for _, id := range userIds {
		unsetIds = append(unsetIds, bson.E{Key: "applications." + id, Value: ""})
	}
	update := bson.D{{Key: "$unset", Value: unsetIds}}
	id, _ := primitive.ObjectIDFromHex(projectId)
	c.Collection(projectCollection).UpdateByID(ctx, id, update)
}

func (c *ProjectController) ProjectAddUsers(ctx context.Context, projectId string, project *models.Project) {
	params := bson.D{}
	params = append(params, bson.E{Key: "members", Value: project.Members})
	update := bson.D{{Key: "$set", Value: params}}
	id, _ := primitive.ObjectIDFromHex(projectId)
	c.Collection(projectCollection).UpdateByID(ctx, id, update)
}

func (c *ProjectController) ProjectArrayToModel(ctx context.Context, Projects []string) []models.Project {
	projectsArray := []models.Project{}
	projectidArr := []primitive.ObjectID{}

	for _, projectid := range Projects {
		id, _ := primitive.ObjectIDFromHex(projectid)
		projectidArr = append(projectidArr, id)
	}

	c.Collection(projectCollection).FindAll(ctx, projectidArr, &projectsArray)
	return projectsArray
}

/*
Define search index in Atlas for better autocomplete performance.

https://www.mongodb.com/docs/atlas/atlas-search/tutorial/autocomplete-tutorial/
https://www.mongodb.com/docs/atlas/atlas-search/autocomplete/
https://www.mongodb.com/docs/atlas/atlas-search/define-field-mappings/

Some sections of this tutorial by MongoDB is useful.
https://www.youtube.com/watch?v=jnxnhbTO2RA

OrgaNiUS.projects
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

const (
	searchLimit = 10
)

func (c *ProjectController) ProjectSearch(ctx context.Context, query string) ([]bson.D, error) {
	if query == "" {
		// autocomplete.query cannot be empty!
		// we will just return no results instead
		return []bson.D{}, nil
	}

	searchStage := bson.D{
		{
			Key: "$search",
			Value: bson.D{
				{Key: "index", Value: "autoCompleteProjects"},
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
	// could not get this to work with a compound search
	// so opted to make it an extra stage instead
	filterStage := bson.D{
		{Key: "$match", Value: bson.D{
			{Key: "isPublic", Value: true},
		}},
	}
	limitStage := bson.D{
		{Key: "$limit", Value: searchLimit},
	}
	projectStage := bson.D{
		{
			Key: "$project",
			Value: bson.D{
				{Key: "_id", Value: 1},
				{Key: "name", Value: 1},
				{Key: "description", Value: 1},
			},
		},
	}

	// run pipeline
	cursor, err := c.Collection(projectCollection).Aggregate(context.TODO(), mongo.Pipeline{searchStage, filterStage, limitStage, projectStage})

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
