package controllers

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

func (c *TaskController) TaskModify(ctx context.Context, taskid string, name, description, deadline *string, isdone *bool, addAssignedTo, removeAssignedTo *[]string) error {
	setParams := bson.D{}
	if name != nil {
		setParams = append(setParams, bson.E{Key: "name", Value: *name})
	}
	if description != nil {
		setParams = append(setParams, bson.E{Key: "description", Value: *description})
	}
	if deadline != nil {
		parsedDeadline, _ := time.Parse("2006-01-02T15:04:05.999Z", *deadline)
		setParams = append(setParams, bson.E{Key: "deadline", Value: parsedDeadline})
	}
	if isdone != nil {
		setParams = append(setParams, bson.E{Key: "isDone", Value: *isdone})
	}

	addParams := bson.D{}
	if addAssignedTo != nil {
		addParams = append(addParams, bson.E{Key: "assignedTo", Value: *addAssignedTo})
	}
	removeParams := bson.D{}
	if removeAssignedTo != nil {
		removeParams = append(removeParams, bson.E{Key: "assignedTo", Value: *removeAssignedTo})
	}

	update := bson.D{
		{Key: "$set", Value: setParams},
		{Key: "$addToSet", Value: addParams},
		{Key: "$pull", Value: removeParams},
	}
	// TODO: remove prints (i love print debugging)
	fmt.Println(update)

	objectid, err := primitive.ObjectIDFromHex(taskid)
	if err != nil {
		return err
	}
	c.Collection(taskCollection).UpdateByID(ctx, objectid, update)
	return nil
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
	taskidArr := []primitive.ObjectID{}
	for taskid := range Tasks {
		id, _ := primitive.ObjectIDFromHex(taskid)
		taskidArr = append(taskidArr, id)
	}
	c.Collection(taskCollection).FindAll(ctx, taskidArr, &tasksArray)
	return tasksArray
}

func (c *TaskController) TaskMapToArray(ctx context.Context, Tasks map[string]struct{}) []models.Task {
	tasksArray := []models.Task{}
	taskidArr := []primitive.ObjectID{}
	for taskid := range Tasks {
		id, _ := primitive.ObjectIDFromHex(taskid)
		taskidArr = append(taskidArr, id)
	}
	c.Collection(taskCollection).FindAll(ctx, taskidArr, &tasksArray)
	return tasksArray
}
