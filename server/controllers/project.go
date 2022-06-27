package controllers

import (
	"context"
	"errors"
	"time"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

	project.Members = map[string]struct{}{
		userid: {},
	}
	project.CreationTime = time.Now()
	project.Tasks = make(map[string]struct{})
	project.Settings = models.DefaultSettings()

	id, err := c.Collection(projectCollection).InsertOne(ctx, project)

	if err != nil {
		return err
	}
	project.Id = id

	return nil
}

func (c *ProjectController) ProjectModifyTask(ctx context.Context, project *models.Project) {
	params := bson.D{}
	params = append(params, bson.E{Key: "tasks", Value: project.Tasks})
	update := bson.D{{Key: "$set", Value: params}}
	c.Collection(projectCollection).UpdateByID(ctx, project.Id, update)
}

func (c *ProjectController) ProjectMapToArray(ctx context.Context, Projects map[string]struct{}) []models.Project {
	projectsArray := []models.Project{}
	projectidArr := []primitive.ObjectID{}
	for projectid := range Projects {
		id, _ := primitive.ObjectIDFromHex(projectid)
		projectidArr = append(projectidArr, id)
	}
	c.Collection(projectCollection).FindAll(ctx, projectidArr, &projectsArray)
	return projectsArray
}