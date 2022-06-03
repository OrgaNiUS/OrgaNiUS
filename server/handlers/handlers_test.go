package handlers_test

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/OrgaNiUS/OrgaNiUS/server/handlers"
	"github.com/gin-gonic/gin"
)

// Used because display errors and not authorized are very similar.
func testDisplay(t *testing.T, f func(ctx *gin.Context, message string), code int) {
	msgs := []string{
		"",
		"abc",
		"some error message",
		`very long lorem ipsum: Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sollicitudin augue diam. Curabitur quis accumsan diam, eu pharetra sapien. Quisque accumsan ut sapien ut mollis. Curabitur convallis tellus suscipit, gravida turpis ac, rutrum mi. Mauris eu eros purus. Nullam quis elementum orci, sit amet bibendum nisi. Etiam nec ipsum urna. Sed non scelerisque erat. Morbi at varius nibh, a consectetur dolor. Praesent vitae viverra purus. Pellentesque sodales pharetra dolor, id ornare libero molestie at.`,
	}

	for _, msg := range msgs {
		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)
		f(ctx, msg)
		result := w.Result()
		if result.StatusCode != code {
			t.Errorf("Expected status code %v but got %v", code, result.StatusCode)
		}
		body, err := io.ReadAll(result.Body)
		if err != nil {
			t.Error(err)
		}
		actualBody := string(body)
		expectedBody := fmt.Sprintf(`{"error":"%v"}`, msg)
		if actualBody != expectedBody {
			t.Errorf("Expected %v but got %v (JSON)", expectedBody, actualBody)
		}
	}
}

func TestDisplayError(t *testing.T) {
	testDisplay(t, handlers.DisplayError, http.StatusBadRequest)
}

func TestDisplayNotAuthorized(t *testing.T) {
	testDisplay(t, handlers.DisplayNotAuthorized, http.StatusUnauthorized)
}

func TestMain(m *testing.M) {
	// Set gin to be in test mode.
	gin.SetMode(gin.TestMode)
	// Disable log output for tests.
	log.SetOutput(ioutil.Discard)

	m.Run()
}
