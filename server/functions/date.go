package functions

import "time"

// this is javascript's default format for .toISOString()
const layout = "2006-01-02T15:04:05.999Z"

func StringToTime(value string) (time.Time, error) {
	return time.Parse(layout, value)
}

func TimeToString(t time.Time) string {
	return t.Format(layout)
}
