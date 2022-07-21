package ics

import (
	"mime/multipart"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	ical "github.com/arran4/golang-ical"
)

// Simple parsing of ics file to our models.Event form.
func Parse(fileReader multipart.File) ([]*models.Event, error) {
	var events []*models.Event
	calendar, err := ical.ParseCalendar(fileReader)
	if err != nil {
		return events, err
	}
	vevents := calendar.Events()
	for _, vevent := range vevents {
		// vevent summary = name
		ianaproperty := vevent.GetProperty(ical.ComponentPropertySummary)
		name := ianaproperty.Value
		if name == "" {
			// just skip events that have problems
			continue
		}
		start, err := vevent.GetStartAt()
		if err != nil {
			// just skip events that have problems
			continue
		}
		end, err := vevent.GetEndAt()
		if err != nil {
			// just skip events that have problems
			continue
		}
		event := &models.Event{
			Name:  name,
			Start: start,
			End:   end,
		}
		events = append(events, event)
	}
	return events, nil
}
