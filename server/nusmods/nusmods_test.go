package nusmods_test

import (
	"testing"
	"time"

	"github.com/OrgaNiUS/OrgaNiUS/server/nusmods"
	"github.com/google/go-cmp/cmp"
)

func TestNthDayOfMonth(t *testing.T) {
	type testShape struct {
		callback func() time.Time
		expected time.Time
	}

	location, _ := time.LoadLocation("Asia/Singapore")

	tests := []testShape{
		{
			callback: func() time.Time {
				return nusmods.NthDayofMonth(1, time.Monday, time.July, 2022)
			},
			expected: time.Date(2022, time.July, 4, 0, 0, 0, 0, location),
		},
		{
			callback: func() time.Time {
				return nusmods.NthDayofMonth(2, time.Monday, time.July, 2022)
			},
			expected: time.Date(2022, time.July, 11, 0, 0, 0, 0, location),
		},
		{
			callback: func() time.Time {
				return nusmods.NthDayofMonth(3, time.Sunday, time.July, 2022)
			},
			expected: time.Date(2022, time.July, 17, 0, 0, 0, 0, location),
		},
		{
			callback: func() time.Time {
				return nusmods.NthDayofMonth(5, time.Saturday, time.October, 2022)
			},
			expected: time.Date(2022, time.October, 29, 0, 0, 0, 0, location),
		},
		{
			callback: func() time.Time {
				return nusmods.NthDayofMonth(5, time.Sunday, time.December, 2023)
			},
			expected: time.Date(2023, time.December, 31, 0, 0, 0, 0, location),
		},
		{
			callback: func() time.Time {
				return nusmods.NthDayofMonth(1, time.Monday, time.January, 2024)
			},
			expected: time.Date(2024, time.January, 1, 0, 0, 0, 0, location),
		},
	}

	for _, test := range tests {
		actual := test.callback()
		if !actual.Equal(test.expected) {
			t.Errorf("expected %v but got %v", test.expected, actual)
		}
	}
}

func TestStartOfSemester(t *testing.T) {
	type testShape struct {
		callback     func() (time.Time, error)
		expectedTime time.Time
		expectError  bool
	}

	location, _ := time.LoadLocation("Asia/Singapore")

	tests := []testShape{
		{
			callback: func() (time.Time, error) {
				return nusmods.StartOfSemester(2022, 1)
			},
			expectedTime: time.Date(2022, time.August, 8, 0, 0, 0, 0, location),
			expectError:  false,
		},
		{
			callback: func() (time.Time, error) {
				return nusmods.StartOfSemester(2023, 2)
			},
			expectedTime: time.Date(2023, time.January, 9, 0, 0, 0, 0, location),
			expectError:  false,
		},
		{
			callback: func() (time.Time, error) {
				return nusmods.StartOfSemester(2022, 3)
			},
			// zero value because error
			expectedTime: time.Time{},
			expectError:  true,
		},
	}

	for _, test := range tests {
		time, err := test.callback()
		if !time.Equal(test.expectedTime) {
			t.Errorf("expected %v but got %v", test.expectedTime, time)
		}
		if (err == nil) == test.expectError {
			t.Errorf("expecting error: %v but got %v", test.expectError, err)
		}
	}
}

func TestParseURL(t *testing.T) {
	type testShape struct {
		url              string
		expectedSemester int
		expectedModules  []nusmods.Module
		expectedError    bool
	}

	tests := []testShape{
		{
			url:              "https://nusmods.com/timetable/sem-1/share?CS2101=&CS2102=LEC:1V,TUT:08&CS2103T=LEC:G13&CS3230=TUT:08,LEC:1V&ST2334=LEC:1,TUT:14",
			expectedSemester: 1,
			expectedModules: []nusmods.Module{
				{
					Code:    "CS2101",
					Classes: map[string]string{},
				},
				{
					Code: "CS2102",
					Classes: map[string]string{
						"LEC": "1V",
						"TUT": "08",
					},
				},
				{
					Code: "CS2103T",
					Classes: map[string]string{
						"LEC": "G13",
					},
				},
				{
					Code: "CS3230",
					Classes: map[string]string{
						"LEC": "1V",
						"TUT": "08",
					},
				},
				{
					Code: "ST2334",
					Classes: map[string]string{
						"LEC": "1",
						"TUT": "14",
					},
				},
			},
			expectedError: false,
		},
		{
			url:              "https://nusmods.com/timetable/sem-2/share?CS2030S=LAB:10K,REC:11,LEC:1&CS2040S=TUT:20,REC:04,LEC:1&CS2100=TUT:12,LAB:25,LEC:1&GEA1000=TUT:E36&GESS1002=LEC:1,LAB:1",
			expectedSemester: 2,
			expectedModules: []nusmods.Module{
				{
					Code: "CS2030S",
					Classes: map[string]string{
						"LEC": "1",
						"LAB": "10K",
						"REC": "11",
					},
				},
				{
					Code: "CS2040S",
					Classes: map[string]string{
						"LEC": "1",
						"TUT": "20",
						"REC": "04",
					},
				},
				{
					Code: "CS2100",
					Classes: map[string]string{
						"LEC": "1",
						"TUT": "12",
						"LAB": "25",
					},
				},
				{
					Code: "GEA1000",
					Classes: map[string]string{
						"TUT": "E36",
					},
				},
				{
					Code: "GESS1002",
					Classes: map[string]string{
						"LEC": "1",
						"LAB": "1",
					},
				},
			},
			expectedError: false,
		},
		{
			url:              "https://nusmods.com/timetable/sem-1/share?CFG1002=LEC:05&CS1101S=TUT:09H,REC:10B,LEC:1&CS1231S=TUT:11A,LEC:1&IS1103=&MA1521=LEC:1,TUT:10&MA2001=LEC:2,TUT:17",
			expectedSemester: 1,
			expectedModules: []nusmods.Module{
				{
					Code: "CFG1002",
					Classes: map[string]string{
						"LEC": "05",
					},
				},
				{
					Code: "CS1101S",
					Classes: map[string]string{
						"LEC": "1",
						"TUT": "09H",
						"REC": "10B",
					},
				},
				{
					Code: "CS1231S",
					Classes: map[string]string{
						"LEC": "1",
						"TUT": "11A",
					},
				},
				{
					Code:    "IS1103",
					Classes: map[string]string{},
				},
				{
					Code: "MA1521",
					Classes: map[string]string{
						"LEC": "1",
						"TUT": "10",
					},
				},
				{
					Code: "MA2001",
					Classes: map[string]string{
						"LEC": "2",
						"TUT": "17",
					},
				},
			},
			expectedError: false,
		},
	}

	for _, test := range tests {
		semester, modules, err := nusmods.ParseURL(test.url)
		if semester != test.expectedSemester {
			t.Errorf("expected semester %v but got semester %v", test.expectedSemester, semester)
		}
		if !cmp.Equal(modules, test.expectedModules) {
			t.Errorf("expected modules %v but got modules %v", test.expectedModules, modules)
		}
		if (err == nil) == test.expectedError {
			t.Errorf("expecting error: %v but got %v", test.expectedError, err)
		}
	}
}
