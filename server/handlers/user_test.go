package handlers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/handlers"
	"github.com/OrgaNiUS/OrgaNiUS/server/mailer"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
)

/*
	Skipped testing of some internal function calls because those function calls are being tested separately already.
*/

const (
	JWT_SECRET = "test_secret"
)

func getJWT() *auth.JWTParser {
	return auth.New(JWT_SECRET)
}

func makeWithQuery(method string, queries map[string]string) (*httptest.ResponseRecorder, *gin.Context) {
	// https://stackoverflow.com/a/64122385
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	queriesArray := []string{}
	for k, v := range queries {
		queriesArray = append(queriesArray, k+"="+v)
	}
	URL := "/?" + strings.Join(queriesArray, "&")
	ctx.Request, _ = http.NewRequest(method, URL, nil)
	return w, ctx
}

func makePostWithParam(data map[string]interface{}) (*httptest.ResponseRecorder, *gin.Context) {
	// https://stackoverflow.com/a/67034058
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	header := make(http.Header)
	header.Set("Content-Type", "application/json")
	ctx.Request = &http.Request{
		Header: header,
		Method: "POST",
	}

	jsonbytes, _ := json.Marshal(data)
	ctx.Request.Body = io.NopCloser(bytes.NewBuffer(jsonbytes))
	return w, ctx
}

func TestUserExistsGet(t *testing.T) {
	data := []*models.User{
		{
			Name:     "name1",
			Password: "Password1234",
			Email:    "name1@mail.com",
		},
	}

	_, controller := controllers.GetMockController(data)
	f := handlers.UserExistsGet(controller)

	type response struct {
		Exists bool
	}
	var resp response
	var body []byte

	w, ctx := makeWithQuery("GET", map[string]string{
		"name":  data[0].Name,
		"email": data[0].Email,
	})
	f(ctx)
	body, _ = io.ReadAll(w.Result().Body)
	json.Unmarshal(body, &resp)
	if w.Code != http.StatusOK {
		t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
	} else if !resp.Exists {
		t.Error("Expected user to exist")
	}

	w, ctx = makeWithQuery("GET", map[string]string{
		"name": "does not exist",
	})
	f(ctx)
	body, _ = io.ReadAll(w.Result().Body)
	json.Unmarshal(body, &resp)
	if w.Code != http.StatusOK {
		t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
	} else if resp.Exists {
		t.Error("Expected user to not exist")
	}
}

func TestUserGet(t *testing.T) {
	data := []*models.User{
		{
			Name:     "name1",
			Password: "Password1234",
			Email:    "name1@mail.com",
		},
	}

	_, controller := controllers.GetMockController(data)
	f := handlers.UserGet(controller)

	type response struct {
		Name     string
		Email    string
		Projects []models.Project
	}
	var resp response
	var body []byte

	w, ctx := makeWithQuery("GET", map[string]string{
		"name":  data[0].Name,
		"email": data[0].Email,
	})
	f(ctx)
	body, _ = io.ReadAll(w.Result().Body)
	json.Unmarshal(body, &resp)
	if w.Code != http.StatusOK {
		t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
	} else if resp.Name != data[0].Name {
		t.Error("Expected user to exist")
	}

	w, ctx = makeWithQuery("GET", map[string]string{
		"name": "does not exist",
	})
	f(ctx)
	body, _ = io.ReadAll(w.Result().Body)
	json.Unmarshal(body, &resp)
	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected code %v but got %v", http.StatusBadRequest, w.Code)
	}
}

func TestUserGetSelf(t *testing.T) {
	data := []*models.User{
		{
			Name:  "name1",
			Email: "name1@mail.com",
		},
		{
			Name:  "fafa22",
			Email: "name2@mail.com",
		},
		{
			Name:  "23456789SDFGHJ",
			Email: "name3@mail.com",
		},
	}

	_, controller := controllers.GetMockController(data)
	jwt := getJWT()
	f := handlers.UserGetSelf(controller, jwt)

	for i := 0; i < len(data); i++ {
		w, ctx := makeWithQuery("GET", nil)
		cookie, _ := jwt.Generate(data[i].Id.Hex(), data[i].Name)
		ctx.Request.AddCookie(auth.MakeJWTCookie(cookie))

		var resp models.User
		var body []byte

		f(ctx)
		body, _ = io.ReadAll(w.Result().Body)
		json.Unmarshal(body, &resp)
		if w.Code != http.StatusOK {
			t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
		} else if resp.Name != data[i].Name {
			t.Errorf("Expected name %v but got %v", data[i].Name, resp.Name)
		} else if resp.Email != data[i].Email {
			t.Errorf("Expected email %v but got %v", data[i].Email, resp.Email)
		}
	}
}

func TestUserSignup(t *testing.T) {
	data := []*models.User{}

	_, controller := controllers.GetMockController(data)
	jwt := getJWT()
	_, mailer := mailer.GetMock()
	f := handlers.UserSignup(controller, jwt, mailer)

	params := map[string]interface{}{
		"name":     "GoodName",
		"email":    "mail@email.com",
		"password": "Password1234",
	}
	w, ctx := makePostWithParam(params)
	f(ctx)
	if w.Code != http.StatusCreated {
		t.Errorf("Expected code %v but got %v", http.StatusCreated, w.Code)
	}
}

func TestUserVerify(t *testing.T) {
	pins := []string{"ABCDEF", "123456"}
	data := []*models.User{
		{
			Name:     "name1",
			Email:    "name1@mail.com",
			Verified: false,
		},
		{
			Name:     "name2",
			Email:    "name2@mail.com",
			Verified: false,
		},
	}
	for i := 0; i < len(data); i++ {
		hash, _ := auth.HashPassword(pins[i])
		data[i].VerificationPin = hash
	}

	_, controller := controllers.GetMockController(data)
	jwt := getJWT()
	f := handlers.UserVerify(controller, jwt)

	for i := 0; i < len(data); i++ {
		params := map[string]interface{}{
			"name": data[i].Name,
			"pin":  pins[i],
		}
		w, ctx := makePostWithParam(params)
		f(ctx)
		if w.Code != http.StatusOK {
			t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
		}
	}
}

func TestUserLogin(t *testing.T) {
	passwords := []string{"Password1234", "Test45678"}
	data := []*models.User{
		{
			Name:     "name1",
			Verified: true,
		},
		{
			Name:     "name2",
			Verified: true,
		},
	}
	for i := 0; i < len(data); i++ {
		hash, _ := auth.HashPassword(passwords[i])
		data[i].Password = hash
	}

	_, controller := controllers.GetMockController(data)
	jwt := getJWT()
	f := handlers.UserLogin(controller, jwt)

	for i := 0; i < len(data); i++ {
		params := map[string]interface{}{
			"name":     data[i].Name,
			"password": passwords[i],
		}
		w, ctx := makePostWithParam(params)
		f(ctx)
		if w.Code != http.StatusCreated {
			t.Errorf("Expected code %v but got %v", http.StatusCreated, w.Code)
		}
	}
}

func TestUserRefreshJWT(t *testing.T) {
	data := []*models.User{
		{
			Name:     "name1",
			Verified: true,
		},
	}
	_, controller := controllers.GetMockController(data)
	jwt := getJWT()
	f := handlers.UserRefreshJWT(controller, jwt)

	w, ctx := makeWithQuery("GET", nil)
	f(ctx)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected code %v but got %v", http.StatusUnauthorized, w.Code)
	}

	for i := 0; i < len(data); i++ {
		w, ctx := makeWithQuery("GET", nil)
		cookie, _ := jwt.Generate("fake id", data[i].Name)
		ctx.Request.AddCookie(auth.MakeJWTCookie(cookie))
		f(ctx)
		if w.Code != http.StatusOK {
			t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
		}
	}
}

func TestUserLogout(t *testing.T) {
	data := []*models.User{
		{
			Name:     "name1",
			Verified: true,
		},
	}
	_, controller := controllers.GetMockController(data)
	jwt := getJWT()
	f := handlers.UserLogout(controller, jwt)

	w, ctx := makeWithQuery("GET", nil)
	f(ctx)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected code %v but got %v", http.StatusUnauthorized, w.Code)
	}

	for i := 0; i < len(data); i++ {
		w, ctx := makeWithQuery("GET", nil)
		cookie, _ := jwt.Generate("fake id", data[i].Name)
		ctx.Request.AddCookie(auth.MakeJWTCookie(cookie))
		f(ctx)
		if w.Code != http.StatusOK {
			t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
		}
	}
}

func TestUserForgotPW(t *testing.T) {
	data := []*models.User{
		{
			Name:     "name1",
			Verified: true,
		},
	}

	_, controller := controllers.GetMockController(data)
	_, mailer := mailer.GetMock()
	f := handlers.UserForgotPW(controller, mailer)

	for i := 0; i < len(data); i++ {
		params := map[string]interface{}{
			"name": data[i].Name,
		}
		w, ctx := makePostWithParam(params)
		f(ctx)
		if w.Code != http.StatusOK {
			t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
		}
	}
}

func TestUserVerifyForgotPW(t *testing.T) {
	pins := []string{"ABCDEF", "123456"}
	data := []*models.User{
		{
			Name:     "name1",
			Verified: true,
			ForgotPW: true,
		},
		{
			Name:     "name2",
			Verified: true,
			ForgotPW: true,
		},
	}

	for i := 0; i < len(data); i++ {
		hash, _ := auth.HashPassword(pins[i])
		data[i].ForgotPWPin = hash
	}

	_, controller := controllers.GetMockController(data)
	f := handlers.UserVerifyForgotPW(controller)

	for i := 0; i < len(data); i++ {
		params := map[string]interface{}{
			"name": data[i].Name,
			"pin":  pins[i],
		}
		w, ctx := makePostWithParam(params)
		f(ctx)
		if w.Code != http.StatusOK {
			t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
		}
	}
}

func TestUserChangeForgotPW(t *testing.T) {
	pins := []string{"ABCDEF", "123456"}
	data := []*models.User{
		{
			Name:     "name1",
			Verified: true,
			ForgotPW: true,
		},
		{
			Name:     "name2",
			Verified: true,
			ForgotPW: true,
		},
	}

	for i := 0; i < len(data); i++ {
		hash, _ := auth.HashPassword(pins[i])
		data[i].ForgotPWPin = hash
	}

	_, controller := controllers.GetMockController(data)
	f := handlers.UserChangeForgotPW(controller)

	for i := 0; i < len(data); i++ {
		params := map[string]interface{}{
			"name":     data[i].Name,
			"pin":      pins[i],
			"password": "new password1234XXX",
		}
		w, ctx := makePostWithParam(params)
		f(ctx)
		if w.Code != http.StatusOK {
			t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
		}
	}
}

func TestUserPatch(t *testing.T) {
	passwords := []string{"ABCDEF", "123456"}
	data := []*models.User{
		{
			Name:     "name1",
			Verified: true,
		},
		{
			Name:     "name2",
			Verified: true,
		},
	}

	for i := 0; i < len(data); i++ {
		hash, _ := auth.HashPassword(passwords[i])
		data[i].Password = hash
	}

	ids, controller := controllers.GetMockController(data)
	jwt := getJWT()
	f := handlers.UserPatch(controller, jwt)

	for i := 0; i < len(data); i++ {
		params := map[string]interface{}{
			"name":     "new name",
			"password": "new password1234XXX",
			"email":    "newmail@mail.com",
		}
		w, ctx := makePostWithParam(params)
		cookie, _ := jwt.Generate(ids[i].Hex(), data[i].Name)
		ctx.Request.AddCookie(auth.MakeJWTCookie(cookie))
		f(ctx)
		if w.Code != http.StatusOK {
			t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
		}
	}
}

func TestUserDelete(t *testing.T) {
	data := []*models.User{
		{
			Name:     "name1",
			Verified: true,
		},
		{
			Name:     "name2",
			Verified: true,
		},
	}

	ids, controller := controllers.GetMockController(data)
	jwt := getJWT()
	f := handlers.UserDelete(controller, jwt)

	for i := 0; i < len(data); i++ {
		w, ctx := makeWithQuery("DELETE", nil)
		cookie, _ := jwt.Generate(ids[i].Hex(), data[i].Name)
		ctx.Request.AddCookie(auth.MakeJWTCookie(cookie))
		f(ctx)
		if w.Code != http.StatusOK {
			t.Errorf("Expected code %v but got %v", http.StatusOK, w.Code)
		}
	}
}
