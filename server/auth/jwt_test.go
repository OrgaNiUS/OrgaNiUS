package auth_test

import (
	"testing"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
)

const (
	secret = "test_secret"
)

// Tests Generate, Parse and GetKey together.
// Generates the token string with Generate()
// and parse the token string with Parse and GetKey and compare with expected results.
func TestGenerationAndParsing(t *testing.T) {
	parser := auth.New(secret)

	type testData struct {
		id, name string
	}

	tests := []testData{
		{"123456", "testUser123"},
		{"234567", "ABCBCBABCABCAB241"},
	}

	for _, test := range tests {
		tokenString, _ := parser.Generate(test.id, test.name)
		parsedClaims, _ := parser.Parse(tokenString)
		if parsedClaims["id"] != test.id {
			t.Errorf("Expected id %v but got %v", test.id, parsedClaims["id"])
		}
		if parsedClaims["name"] != test.name {
			t.Errorf("Expected name %v but got %v", test.name, parsedClaims["name"])
		}
		getId, _ := parser.GetKey(tokenString, "id")
		if getId != test.id {
			t.Errorf("Expected id %v but got %v", test.id, getId)
		}
		getName, _ := parser.GetKey(tokenString, "name")
		if getName != test.name {
			t.Errorf("Expected name %v but got %v", test.name, getName)
		}
	}
}
