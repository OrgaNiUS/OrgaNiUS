package handlers

import "testing"

type Result struct {
	message string
	ok      bool
}

func TestIsValidEmail(t *testing.T) {
	// some examples taken from here
	// https://gist.github.com/cjaoude/fd9910626629b53c4d25
	tests := map[string]*Result{
		"email@example.com":              {"", true},
		"firstname.lastname@example.com": {"", true},
		"email@subdomain.example.com":    {"", true},
		"firstname+lastname@example.com": {"", true},
		"email@123.123.123.123":          {"", true},
		"\"email\"@example.com":          {"", true},
		"1234567890@example.com":         {"", true},
		"email@example-one.com":          {"", true},
		"_______@example.com":            {"", true},
		"email@example.name":             {"", true},
		"email@example.museum":           {"", true},
		"email@example.co.jp":            {"", true},
		"firstname-lastname@example.com": {"", true},

		"": {"Please provide an email.", false},

		"plainaddress":              {"Email is not a valid address.", false},
		"#@%^%#$@#$@#.com":          {"Email is not a valid address.", false},
		"@example.com":              {"Email is not a valid address.", false},
		"email.example.com":         {"Email is not a valid address.", false},
		"email@example@example.com": {"Email is not a valid address.", false},
		".email@example.com":        {"Email is not a valid address.", false},
		"email.@example.com":        {"Email is not a valid address.", false},
		"email..email@example.com":  {"Email is not a valid address.", false},
		"email@example..com":        {"Email is not a valid address.", false},
		"Abc..123@example.com":      {"Email is not a valid address.", false},
	}

	for test, expected := range tests {
		message, ok := isValidEmail(test)
		if message != expected.message || ok != expected.ok {
			t.Errorf("Test for %s", test)
			t.Errorf("Expected %v but got {%v %v}", *expected, message, ok)
		}
	}
}

func TestIsValidName(t *testing.T) {
	tests := map[string]*Result{
		"ABCDE":     {"", true},
		"ABCDEF":    {"", true},
		"ABCDEFG":   {"", true},
		"WERTYUI":   {"", true},
		"xcvbnm":    {"", true},
		"34562567":  {"", true},
		"dfghjklgh": {"", true},

		"": {"Please provide a username.", false},

		"x":    {"Username too short.", false},
		"xx":   {"Username too short.", false},
		"xxx":  {"Username too short.", false},
		"xxxx": {"Username too short.", false},

		"dfghjklghѼ": {"Name contains invalid character.", false},
		"Ab**&":      {"Name contains invalid character.", false},
	}

	for test, expected := range tests {
		message, ok := isValidName(test)
		if message != expected.message || ok != expected.ok {
			t.Errorf("Test for %s", test)
			t.Errorf("Expected %v but got {%v %v}", *expected, message, ok)
		}
	}
}

func TestIsValidPassword(t *testing.T) {
	type Input struct {
		name     string
		password string
	}

	tests := map[Input]*Result{
		{"abcde", "AbCde123"}: {"", true},

		{"abcde", ""}: {"Please provide a password.", false},

		{"abcde", "0"}:       {"Password too short.", false},
		{"abcde", "00"}:      {"Password too short.", false},
		{"abcde", "000"}:     {"Password too short.", false},
		{"abcde", "0000"}:    {"Password too short.", false},
		{"abcde", "00000"}:   {"Password too short.", false},
		{"abcde", "000000"}:  {"Password too short.", false},
		{"abcde", "0000000"}: {"Password too short.", false},

		{"abcde", "abcde123"}:   {"Password cannot contain username.", false},
		{"ab2345", "00ab23450"}: {"Password cannot contain username.", false},

		{"abcde", "AbCde123Ѽ"}: {"Password contains invalid character.", false},

		{"abcde", "ABBABABABA"}: {"Password missing required lowercase letter.", false},
		{"abcde", "abbabababa"}: {"Password missing required uppercase letter.", false},
		{"abcde", "Abbabababa"}: {"Password missing required digit.", false},
	}

	for test, expected := range tests {
		message, ok := isValidPassword(test.name, test.password)
		if message != expected.message || ok != expected.ok {
			t.Errorf("Test for %s", test)
			t.Errorf("Expected %v but got {%v %v}", *expected, message, ok)
		}
	}
}
