package controllers

import (
	"context"
	"errors"
	"time"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"go.mongodb.org/mongo-driver/bson"
)

const (
	taskCollection = "tasks"
)

func (c *TaskController) TaskRetrieve(ctx context.Context, id string) (models.Task, error) {
	var task models.Task
	if id == "" {
		return task, errors.New("cannot leave task id empty")
	}
	_, err := c.Collection(taskCollection).FindOne(ctx, &task, id)

	return task, err
}

func (c *TaskController) TaskCreate(ctx context.Context, task *models.Task) error {
	task.CreationTime = time.Now()
	task.Deadline = time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
	task.IsDone = false
	task.Tags = []string{}

	id, err := c.Collection(taskCollection).InsertOne(ctx, task)

	if err != nil {
		return err
	}
	task.Id = id

	return nil
}

func (c *TaskController) TaskAddUser(ctx context.Context, task *models.Task) {
	params := bson.D{}
	params = append(params, bson.E{Key: "assignedTo", Value: task.AssignedTo})
	update := bson.D{{Key: "$set", Value: params}}
	c.Collection(taskCollection).UpdateByID(ctx, task.Id, update)
}

func (c *TaskController) TaskDelete(ctx context.Context, id string) error {
	_, err := c.Collection(taskCollection).DeleteByID(ctx, id)
	if err != nil {
		return err
	}
	return nil
}
