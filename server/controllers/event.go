package controllers

import (
	"context"
	"errors"

	"github.com/OrgaNiUS/OrgaNiUS/server/functions"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	eventCollection = "events"
)

func (c *EventController) EventCreate(ctx context.Context, event *models.Event) error {
	id, err := c.Collection(eventCollection).InsertOne(ctx, event)
	if err != nil {
		return err
	}
	event.Id = id

	return nil
}

func (c *EventController) EventGet(ctx context.Context, eventid string) (*models.Event, error) {
	if eventid == "" {
		return nil, errors.New("cannot leave id empty")
	}
	event, err := c.Collection(eventCollection).FindOne(ctx, eventid)
	return event, err
}

func (c *EventController) EventMapToArray(ctx context.Context, events []string) []models.Event {
	size := len(events)
	ids := make([]primitive.ObjectID, size)
	result := make([]models.Event, size)
	for i, eventid := range events {
		id, _ := primitive.ObjectIDFromHex(eventid)
		ids[i] = id
	}
	c.Collection(eventCollection).FindAll(ctx, ids, &result)
	return result
}

func (c *EventController) EventModify(ctx context.Context, eventid primitive.ObjectID, name, start, end *string) error {
	params := bson.D{}
	if name != nil {
		params = append(params, bson.E{Key: "name", Value: *name})
	}
	if start != nil {
		startTime, err := functions.StringToTime(*start)
		if err != nil {
			return errors.New("bad start time")
		}
		params = append(params, bson.E{Key: "start", Value: startTime})
	}
	if end != nil {
		endTime, err := functions.StringToTime(*end)
		if err != nil {
			return errors.New("bad end time")
		}
		params = append(params, bson.E{Key: "end", Value: endTime})
	}

	update := bson.D{{Key: "$set", Value: params}}
	c.Collection(eventCollection).UpdateByID(ctx, eventid, update)
	return nil
}
