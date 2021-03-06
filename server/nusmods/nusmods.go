package nusmods

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
)

// This package is for parsing nusmods content, used for EventNusmods handler.

type Module struct {
	Code    string
	Classes map[string]string
}

// Returns the Nth Day of the Month.
// Example: 2nd Monday of July 2022 - NthDayofMonth(2, time.Monday, time.July, 2022)
// Note that if N exceeds the month, then the date returned might be from the next month.
func NthDayofMonth(n int, weekday time.Weekday, month time.Month, year int) time.Time {
	// if you're using nusmods, just assume you're in Singapore :D
	location, _ := time.LoadLocation("Asia/Singapore")
	// use first day of the month as reference
	t := time.Date(year, month, 1, 0, 0, 0, 0, location)
	// number of days to reach correct day (in the first week)
	deltaDays := (int(weekday) - int(t.Weekday()) + 7) % 7
	// increment by number of weeks
	daysToAdd := deltaDays + (n-1)*7
	return t.AddDate(0, 0, daysToAdd)
}

// Year is the calendar year at the start of the SEMESTER (not academic year).
func StartOfSemester(year, semester int) (time.Time, error) {
	// Information used in this function is based on the link below.
	// https://www.nus.edu.sg/registrar/academic-activities/academic-calendar
	// They did put a disclaimer that for *some* years, the schedule might not be strictly followed for Semester 2.

	if semester == 1 {
		// Always starts on the 2nd Monday of August.
		return NthDayofMonth(2, time.Monday, time.August, year), nil
	} else if semester == 2 {
		// Mostly starts on the 2nd Monday of January. (sometimes 3rd)
		return NthDayofMonth(2, time.Monday, time.January, year), nil
	}
	return time.Time{}, errors.New("invalid semester")
}

func ParseModule(modBlob string) (Module, error) {
	moduleSplit := strings.Split(modBlob, "=")
	if len(moduleSplit) != 2 {
		return Module{}, errors.New("invalid url")
	}
	code := moduleSplit[0]
	classesBlob := moduleSplit[1]
	classesSlice := strings.Split(classesBlob, ",")
	classes := make(map[string]string)

	if classesBlob != "" {
		// weird quirk of golang's split -> empty string will split into a slice of length 1 with a single empty string in it
		// so we have to run a conditional check
		for _, class := range classesSlice {
			classSplit := strings.Split(class, ":")
			if len(classSplit) != 2 {
				fmt.Println(class, classSplit)
				return Module{}, errors.New("invalid url")
			}
			lesson := classSplit[0]
			slot := classSplit[1]
			classes[lesson] = slot
		}
	}
	return Module{
		Code:    code,
		Classes: classes,
	}, nil
}

// Structs from https://api.nusmods.com/v2/

// Can't actually find any module that uses WeekRange format (might be outdated, so can't test if types here are correct, thus use float64).
type WeekRange struct {
	Start        string // YYYY-MM-DD
	End          string // YYYY-MM-DD
	WeekInterval float64
	Weeks        []float64
}

type Lesson struct {
	ClassNo    string
	StartTime  string
	EndTime    string
	Weeks      interface{} // either []int or WeekRange struct
	Venue      string
	Day        string
	LessonType string
	Size       int
}

type SemesterData struct {
	Semester     int
	ExamDate     string // of date-time
	ExamDuration int
	Timetable    []Lesson
}

type ModuleInfo struct {
	AcadYear            string
	Preclusion          string
	Description         string
	Title               string
	Department          string
	Faculty             string
	Workload            []float32
	Prerequisite        string
	ModuleCredit        string
	ModuleCode          string
	SemesterData        []SemesterData
	PrereqTree          interface{} // not using
	FulFillRequirements interface{} // not using
}

func GetModuleInfo(acadYear int, moduleCode string) (ModuleInfo, error) {
	// API info from: https://api.nusmods.com/v2/#/Modules/get__acadYear__modules__moduleCode__json

	var moduleInfo ModuleInfo

	url := fmt.Sprintf("https://api.nusmods.com/v2/%v-%v/modules/%v.json", acadYear, acadYear+1, moduleCode)
	resp, err := http.Get(url)
	if err != nil {
		return moduleInfo, err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return moduleInfo, err
	}
	if err := json.Unmarshal(body, &moduleInfo); err != nil {
		return moduleInfo, err
	}
	return moduleInfo, nil
}

var weekMap = map[string]int{
	"Monday":    0,
	"Tuesday":   1,
	"Wednesday": 2,
	"Thursday":  3,
	"Friday":    4,
	"Saturday":  5,
	"Sunday":    6,
}

// Simple parsing of 24h time like "1300", "0800". No checks done.
func convertTime(t string) time.Duration {
	hours := t[0:2]
	minutes := t[2:4]
	hourDuration, _ := strconv.Atoi(hours)
	minuteDuration, _ := strconv.Atoi(minutes)
	return time.Duration(hourDuration*60+minuteDuration) * time.Minute
}

func ParseModuleInfo(startOfSemester time.Time, semester int, moduleInfo ModuleInfo, classes map[string]string) ([]*models.Event, error) {
	var events []*models.Event

	foundSemester := false
	var lessons []Lesson
	for _, sem := range moduleInfo.SemesterData {
		if sem.Semester != semester {
			continue
		}
		foundSemester = true
		lessons = sem.Timetable
		break
	}
	if !foundSemester {
		return events, errors.New("could not find semester")
	}

	// not very efficient search O(nm), but data size is generally < 100 (small)
	for _, lesson := range lessons {
		lessonType := strings.ToUpper(lesson.LessonType[:3])
		if classes[lessonType] == lesson.ClassNo {
			// Found a match.
			name := moduleInfo.ModuleCode + " " + lesson.LessonType
			// handle range list of weekRange VS weekrange
			switch weekRange := lesson.Weeks.(type) {
			case []interface{}:
				weekOffset := weekMap[lesson.Day]
				startOffset := convertTime(lesson.StartTime)
				endOffset := convertTime(lesson.EndTime)
				for _, week := range weekRange {
					weekNumber := int(week.(float64))

					weekMultiplier := weekNumber - 1
					if weekNumber >= 7 {
						weekMultiplier++
					}
					date := startOfSemester.AddDate(0, 0, weekOffset+weekMultiplier*7)
					start := date.Add(startOffset)
					end := date.Add(endOffset)
					events = append(events, &models.Event{
						// Example name is: "CS2030S Lecture 11" (for the 11th week)
						// If there are multiple lectures in the same week for the same module (they will have the same name!)
						Name:  name + " " + strconv.Itoa(weekNumber),
						Start: start,
						End:   end,
					})
				}
			case WeekRange:
				// can't find any module that uses weekrange (might be deprecated?)
				// thus, not supporting, at least until we manage to find a module that uses it
			default:
				// either nusmods data is bad, or this parser is bad (probably this parser, but the user shall not know!)
				return []*models.Event{}, errors.New("bad data from nusmods")
			}
		}
	}

	return events, nil
}

// Gets semester & list of modules & error (if invalid URL) from URL.
func ParseURL(url string) (int, []Module, error) {
	regex := regexp.MustCompile(`https?://nusmods\.com/timetable/sem-([12])/share\?(.*)`)
	groups := regex.FindStringSubmatch(url)
	if len(groups) == 0 {
		// if not matched, groups will be empty slice
		return 0, []Module{}, errors.New("invalid URL")
	}

	// ignoring error because regexp ensures only matches "1" and "2"
	semester, _ := strconv.Atoi(groups[1])
	modulesBlob := groups[2]
	modBlobs := strings.Split(modulesBlob, "&")
	modules := make([]Module, len(modBlobs))
	for i, modBlob := range modBlobs {
		module, err := ParseModule(modBlob)
		if err != nil {
			return 0, []Module{}, err
		}
		modules[i] = module
	}
	return semester, modules, nil
}

// This is the entrypoint used by EventsNusmods handler.
func GenerateEvents(url string) ([]*models.Event, error) {
	semester, modules, err := ParseURL(url)
	if err != nil {
		return nil, err
	}

	currentTime := time.Now()
	currentMonth := currentTime.Month()
	currentYear := currentTime.Year()
	startOfSemester, err := StartOfSemester(currentYear, semester)
	if err != nil {
		return nil, err
	}

	acadYear := currentYear
	if int(currentMonth) <= 5 {
		// May and before, treat as previous acad year
		acadYear--
	}

	events := []*models.Event{}

	for _, module := range modules {
		moduleInfo, err := GetModuleInfo(acadYear, module.Code)
		if err != nil {
			return nil, err
		}
		moduleEvents, err := ParseModuleInfo(startOfSemester, semester, moduleInfo, module.Classes)
		if err != nil {
			return nil, err
		}
		// golang ... to spread the slice because append is a variadic function
		events = append(events, moduleEvents...)
	}

	return events, nil
}
