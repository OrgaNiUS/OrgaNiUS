package auth_test

import (
	"net/http/httptest"
	"testing"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/gin-gonic/gin"
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

// Tests RefreshJWT.
func TestRefreshJWT(t *testing.T) {
	// Set gin to be in test mode.
	gin.SetMode(gin.TestMode)

	type testData struct {
		id, name string
	}

	tests := []testData{
		{"123456", "testUser123"},
		{"234567", "ABCBCBABCABCAB241"},
	}

	parser := auth.New(secret)

	for _, test := range tests {
		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)
		parser.RefreshJWT(ctx, test.id, test.name)
		cookies := w.Result().Cookies()
		hasJwt := false
		for _, cookie := range cookies {
			if cookie.Name == "jwt" {
				hasJwt = true
				break
			}
		}
		if !hasJwt {
			t.Error("No JWT cookie created.")
		}
	}
}
