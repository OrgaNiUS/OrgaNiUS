package controllers

import (
	"context"
	"errors"
	"time"

	"github.com/OrgaNiUS/OrgaNiUS/server/functions"
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
	id, err := c.Collection(taskCollection).InsertOne(ctx, task)

	if err != nil {
		return err
	}
	task.Id = id

	return nil
}

func (c *TaskController) TaskModify(ctx context.Context, taskid primitive.ObjectID, name, description, deadline *string, isdone *bool, addAssignedTo, removeAssignedTo, addTags, removeTags *[]string) {
	setParams := bson.D{}
	if name != nil {
		setParams = append(setParams, bson.E{Key: "name", Value: *name})
	}
	if description != nil {
		setParams = append(setParams, bson.E{Key: "description", Value: *description})
	}
	if deadline != nil {
		parsedDeadline, _ := functions.StringToTime(*deadline)
		setParams = append(setParams, bson.E{Key: "deadline", Value: parsedDeadline})
	}
	if isdone != nil {
		setParams = append(setParams, bson.E{Key: "isDone", Value: *isdone})
	}

	addParams := bson.D{}
	if addAssignedTo != nil {
		addParams = append(addParams, bson.E{Key: "assignedTo", Value: bson.D{{Key: "$each", Value: *addAssignedTo}}})
	}
	if addTags != nil {
		addParams = append(addParams, bson.E{Key: "tags", Value: bson.D{{Key: "$each", Value: *addTags}}})
	}
	removeParams := bson.D{}
	if removeAssignedTo != nil {
		removeParams = append(removeParams, bson.E{Key: "assignedTo", Value: bson.D{{Key: "$in", Value: *removeAssignedTo}}})
	}
	if removeTags != nil {
		removeParams = append(removeParams, bson.E{Key: "tags", Value: bson.D{{Key: "$in", Value: *removeTags}}})
	}

	update := bson.D{
		{Key: "$set", Value: setParams},
		{Key: "$addToSet", Value: addParams},
	}

	// note that have to perform addToSet and pull separately because MongoDB treats it as concurrent updating
	// running 2 queries is the easiest solution
	// other solution would be to run a bulkupdate (which probably wouldn't be that necessary as this is only 2 queries)
	pullUpdate := bson.D{
		{Key: "$pull", Value: removeParams},
	}

	c.Collection(taskCollection).UpdateByID(ctx, taskid, update)
	c.Collection(taskCollection).UpdateByID(ctx, taskid, pullUpdate)
}

func (c *TaskController) TaskDelete(ctx context.Context, id string) error {
	_, err := c.Collection(taskCollection).DeleteByID(ctx, id)
	if err != nil {
		return err
	}
	return nil
}

// Deletes all tasks passed in to this
func (c *TaskController) TaskDeleteMany(ctx context.Context, ids []string) error {
	var idArr []primitive.ObjectID
	for _, id := range ids {
		temp, _ := primitive.ObjectIDFromHex(id)
		idArr = append(idArr, temp)
	}
	params := bson.D{}
	params = append(params, bson.E{Key: "_id", Value: bson.E{Key: "$in", Value: idArr}})
	c.Collection(taskCollection).DeleteMany(ctx, params)
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

func (c *TaskController) TaskMapToArray(ctx context.Context, Tasks []string) []models.Task {
	tasksArray := []models.Task{}
	taskPrimitiveIdArr := []primitive.ObjectID{}
	for _, taskid := range Tasks {
		id, _ := primitive.ObjectIDFromHex(taskid)
		taskPrimitiveIdArr = append(taskPrimitiveIdArr, id)
	}
	c.Collection(taskCollection).FindAll(ctx, taskPrimitiveIdArr, &tasksArray)
	return tasksArray
}
