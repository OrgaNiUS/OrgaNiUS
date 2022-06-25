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
	task.IsDone = false
	task.Tags = []string{}
	id, err := c.Collection(taskCollection).InsertOne(ctx, task)

	if err != nil {
		return err
	}
	task.Id = id

	return nil
}

func (c *TaskController) TaskModify(ctx context.Context, task *models.Task) {
	params := bson.D{}
	if task.Name != "" {
		params = append(params, bson.E{Key: "name", Value: task.Name})
	}
	if task.Description != "" {
		params = append(params, bson.E{Key: "description", Value: task.Description})
	}
	if !task.Deadline.IsZero() {
		params = append(params, bson.E{Key: "deadline", Value: task.Deadline})
	}
	if len(task.AssignedTo) != 0 {
		params = append(params, bson.E{Key: "assignedTo", Value: task.AssignedTo})
	}
	params = append(params, bson.E{Key: "isDone", Value: task.IsDone})
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

func (c *TaskController) TaskMapToArrayUser(ctx context.Context, Tasks map[string]bool) []models.Task {
	tasksArray := []models.Task{}
	for taskid := range Tasks {
		var task models.Task
		c.Collection(taskCollection).FindOne(ctx, &task, taskid)
		tasksArray = append(tasksArray, task)
	}
	return tasksArray
}

func (c *TaskController) TaskMapToArray(ctx context.Context, Tasks map[string]struct{}) []models.Task {
	tasksArray := []models.Task{}
	for taskid := range Tasks {
		var task models.Task
		c.Collection(taskCollection).FindOne(ctx, &task, taskid)
		tasksArray = append(tasksArray, task)
	}
	return tasksArray
}
