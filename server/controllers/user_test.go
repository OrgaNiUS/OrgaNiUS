package controllers_test

import (
	"net/http/httptest"
	"testing"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Creates a controller populated with some data.
func getController(data []*models.User) ([]primitive.ObjectID, controllers.Controller) {
	collection := &MockCollection{
		data: map[primitive.ObjectID]*models.User{},
	}

	ids := []primitive.ObjectID{}
	for i := 0; i < len(data); i++ {
		user := data[i]
		if user.Id == primitive.NilObjectID {
			// if nil, populate with some object id
			user.Id = primitive.NewObjectID()
		}
		id := user.Id
		ids = append(ids, id)
		collection.data[id] = user
	}

	controller := controllers.Controller{
		Collection: func(name string, opts ...*options.CollectionOptions) controllers.CollectionInterface {
			return collection
		},
		URL: TEST_URL,
	}

	return ids, controller
}

func TestUserRetrieve(t *testing.T) {
	data := []*models.User{
		{
			Name:     "name1",
			Password: "Password1234",
			Email:    "name1@mail.com",
		},
		{
			Name:     "name2",
			Password: "Password1234",
			Email:    "name2@mail.com",
		},
		{
			Name:     "name3",
			Password: "Password1234",
			Email:    "name3@mail.com",
		},
	}

	ids, controller := getController(data)

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	var result models.User
	var err error

	_, err = controller.UserRetrieve(ctx, "", "")
	if err == nil {
		t.Error("Expected error if both id and name are empty")
	}
	result, _ = controller.UserRetrieve(ctx, "", "name2")
	if result.Name != "name2" {
		t.Errorf("Expected name2 but got %v", result.Name)
	}
	result, _ = controller.UserRetrieve(ctx, ids[0].Hex(), "")
	if result.Name != "name1" {
		t.Errorf("Expected name1 but got %v", result.Name)
	}
	result, _ = controller.UserRetrieve(ctx, ids[1].Hex(), "name2")
	if result.Name != "name2" {
		t.Errorf("Expected name2 but got %v", result.Name)
	}
	_, err = controller.UserRetrieve(ctx, "", "noexist")
	if err == nil {
		t.Error("Expected error if user does not exist")
	}
}

func TestUserExists(t *testing.T) {
	data := []*models.User{
		{
			Name:     "name1",
			Password: "Password1234",
			Email:    "name1@mail.com",
		},
		{
			Name:     "name2",
			Password: "Password1234",
			Email:    "name2@mail.com",
		},
		{
			Name:     "name3",
			Password: "Password1234",
			Email:    "name3@mail.com",
		},
	}

	_, controller := getController(data)

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	var exists bool
	var err error

	_, err = controller.UserExists(ctx, "", "")
	if err == nil {
		t.Error("Expected error if both name and email are empty")
	}

	for _, u := range data {
		exists, _ = controller.UserExists(ctx, u.Name, "")
		if !exists {
			t.Errorf("Expected user %v to exist", u.Name)
		}
		exists, _ = controller.UserExists(ctx, "", u.Email)
		if !exists {
			t.Errorf("Expected email %v to exist", u.Email)
		}
		exists, _ = controller.UserExists(ctx, u.Name, u.Email)
		if !exists {
			t.Errorf("Expected user %v or email %v to exist", u.Name, u.Email)
		}
	}

	testName := "name that does not exist"
	exists, _ = controller.UserExists(ctx, testName, "")
	if exists {
		t.Errorf("Expected user %v to not exist", testName)
	}

	testEmail := "bademail@exist.not"
	exists, _ = controller.UserExists(ctx, "", testEmail)
	if exists {
		t.Errorf("Expected email %v to not exist", testEmail)
	}

	exists, _ = controller.UserExists(ctx, testName, testEmail)
	if exists {
		t.Errorf("Expected user %v and email %v to not exist", testName, testEmail)
	}
}

func TestUserCreate(t *testing.T) {
	data := []*models.User{}

	_, controller := getController(data)

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	user := models.User{
		Name:     "name1",
		Password: "Password1234",
		Email:    "name1@mail.com",
	}

	err := controller.UserCreate(ctx, &user)
	if err != nil {
		t.Errorf("Expected no error but got %v", err.Error())
	}
}

func TestUserVerifyPin(t *testing.T) {
	pins := []string{"ABC123", "FNA2NA", "JW62AS"}

	data := []*models.User{
		{
			Name:     "name1",
			Password: "Password1234",
			Email:    "name1@mail.com",
			Verified: false,
		},
		{
			Name:     "name2",
			Password: "Password1234",
			Email:    "name2@mail.com",
			Verified: false,
		},
		{
			Name:     "name3",
			Password: "Password1234",
			Email:    "name3@mail.com",
			Verified: false,
		},
	}

	for i := 0; i < len(data); i++ {
		// populate with hashed pins
		hash, _ := auth.HashPassword(pins[i])
		data[i].VerificationPin = hash
	}

	_, controller := getController(data)

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	var objectID primitive.ObjectID
	var err error

	// Wrong PIN.
	objectID, err = controller.UserVerifyPin(ctx, "name1", "MMMMMM")
	if objectID != primitive.NilObjectID {
		t.Errorf("Expected object ID to be nil but got %v", objectID)
	} else if err == nil {
		t.Error("Expected error if wrong pin")
	}

	// Correct PINs.
	for i := 0; i < len(data); i++ {
		user := data[i]
		_, err = controller.UserVerifyPin(ctx, user.Name, pins[i])

		if !user.Verified {
			t.Error("Expected user to be verified")
		} else if err != nil {
			t.Errorf("Expected no error but got %v", err.Error())
		}
	}
}

func TestUserCheckPassword(t *testing.T) {
	passwords := []string{"NicePassword000", "Password1234", "PASSSWORD1234bbb", "NANIUGA22iiki"}

	data := []*models.User{
		{
			Name:     "name0",
			Email:    "name0@mail.com",
			Verified: false,
		},
		{
			Name:     "name1",
			Email:    "name1@mail.com",
			Verified: true,
		},
		{
			Name:     "name2",
			Email:    "name2@mail.com",
			Verified: true,
		},
		{
			Name:     "name3",
			Email:    "name3@mail.com",
			Verified: true,
		},
	}

	for i := 0; i < len(data); i++ {
		// populate with hashed passwords
		hash, _ := auth.HashPassword(passwords[i])
		data[i].Password = hash
	}

	_, controller := getController(data)

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	var ok bool
	var err error

	// Wrong password.
	ok, err = controller.UserCheckPassword(ctx, &models.User{
		Name:     "name1",
		Password: "wrongpassword",
	})
	if ok {
		t.Error("Expected not ok when wrong password")
	} else if err == nil {
		t.Error("Expected error when wrong password")
	}

	// Non-existennt user.
	ok, err = controller.UserCheckPassword(ctx, &models.User{
		Name:     "idontexist",
		Password: "passssword1234OO",
	})
	if ok {
		t.Error("Expected not ok when wrong password")
	} else if err == nil {
		t.Error("Expected error when wrong password")
	}

	// Not verified should fail.
	ok, err = controller.UserCheckPassword(ctx, &models.User{
		Name:     data[0].Name,
		Password: passwords[0],
	})
	if ok {
		t.Error("Expected not ok when not verified")
	} else if err == nil {
		t.Error("Expected error when not verified")
	}

	// Correct logins.
	for i := 1; i < len(data); i++ {
		u := data[i]
		ok, err = controller.UserCheckPassword(ctx, &models.User{
			Name:     u.Name,
			Password: passwords[i],
		})
		if !ok {
			t.Error("Expected ok when correct login")
		} else if err != nil {
			t.Errorf("Expected no error when correct login but got %v", err.Error())
		}
	}
}

func TestUserForgotPW(t *testing.T) {
	pins := []string{"ABC123", "LALA22", "097532"}

	data := []*models.User{
		{
			Name:     "name0",
			Email:    "name0@mail.com",
			Verified: true,
		},
		{
			Name:     "name1",
			Email:    "name1@mail.com",
			Verified: true,
		},
		{
			Name:     "name2",
			Email:    "name2@mail.com",
			Verified: true,
		},
	}

	_, controller := getController(data)

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	var email string
	var err error

	// Does not exist.
	_, err = controller.UserForgotPW(ctx, "user that not registered", "")
	if err == nil {
		t.Error("Expected error when user does not exist")
	}

	// Not verified.
	data[0].Verified = false
	_, err = controller.UserForgotPW(ctx, data[0].Name, pins[0])
	if err == nil {
		t.Error("Expected error when user not verified")
	}
	data[0].Verified = true

	// OK.
	for i := 0; i < len(data); i++ {
		u := data[i]
		hash, _ := auth.HashPassword(pins[i])
		email, err = controller.UserForgotPW(ctx, u.Name, hash)
		if email != u.Email {
			t.Errorf("Expected email %v but got %v", u.Email, email)
		} else if err != nil {
			t.Errorf("Expected no error but got %v", err.Error())
		} else if !u.ForgotPW {
			t.Error("Expected user to be marked as forgot PW")
		} else if !auth.CheckPasswordHash(u.ForgotPWPin, pins[i]) {
			t.Errorf("Expected PIN %v but got %v", pins[i], u.ForgotPWPin)
		}
	}
}

func TestUserVerifyForgotPW(t *testing.T) {
	pins := []string{"ABC123", "LALA22", "097532"}

	data := []*models.User{
		{
			Name:     "name0",
			Email:    "name0@mail.com",
			ForgotPW: true,
		},
		{
			Name:     "name1",
			Email:    "name1@mail.com",
			ForgotPW: true,
		},
		{
			Name:     "name2",
			Email:    "name2@mail.com",
			ForgotPW: true,
		},
	}

	for i := 0; i < len(data); i++ {
		hash, _ := auth.HashPassword(pins[i])
		data[i].ForgotPWPin = hash
	}

	_, controller := getController(data)

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	var ok bool
	var err error

	// Does not exist.
	_, err = controller.UserVerifyForgotPW(ctx, "user that does not exist", "")
	if err == nil {
		t.Error("Expected error when user does not exist")
	}

	// Did not request for password reset.
	data[0].ForgotPW = false
	_, err = controller.UserVerifyForgotPW(ctx, data[0].Name, pins[0])
	if err == nil {
		t.Error("Expected error when user did not request for password reset")
	}
	data[0].ForgotPW = true

	// Wrong PIN.
	ok, err = controller.UserVerifyForgotPW(ctx, data[0].Name, "wrongpin")
	if ok {
		t.Error("Expected not ok when wrong pin")
	} else if err == nil {
		t.Error("Expected error when wrong pin")
	}

	// OK.
	for i := 0; i < len(data); i++ {
		u := data[i]
		ok, err = controller.UserVerifyForgotPW(ctx, u.Name, pins[i])
		if !ok {
			t.Error("Expected pin to match")
		} else if err != nil {
			t.Errorf("Expected no error but got %v", err.Error())
		}
	}
}

func TestUserChangeForgotPW(t *testing.T) {
	pins := []string{"ABC123", "LALA22", "097532"}

	data := []*models.User{
		{
			Name:     "name0",
			Email:    "name0@mail.com",
			ForgotPW: true,
		},
		{
			Name:     "name1",
			Email:    "name1@mail.com",
			ForgotPW: true,
		},
		{
			Name:     "name2",
			Email:    "name2@mail.com",
			ForgotPW: true,
		},
	}

	for i := 0; i < len(data); i++ {
		hash, _ := auth.HashPassword(pins[i])
		data[i].ForgotPWPin = hash
	}

	_, controller := getController(data)

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	var err error

	// Does not exist.
	err = controller.UserChangeForgotPW(ctx, "does not exist", "pin", "new hash password")
	if err == nil {
		t.Error("Expected error when user does not exist")
	}

	// Did not request for password reset.
	data[0].ForgotPW = false
	err = controller.UserChangeForgotPW(ctx, data[0].Name, pins[0], "new hash password")
	if err == nil {
		t.Error("Expected error when user did not request for password reset")
	}
	data[0].ForgotPW = true

	// Wrong PIN.
	err = controller.UserChangeForgotPW(ctx, data[0].Name, "wrongpin", "")
	if err == nil {
		t.Error("Expected error when wrong pin")
	}

	newPassword := "newPASSword1234"
	hash, _ := auth.HashPassword(newPassword)

	// OK.
	for i := 0; i < len(data); i++ {
		u := data[i]
		err = controller.UserChangeForgotPW(ctx, u.Name, pins[i], hash)
		if err != nil {
			t.Errorf("Expected no error but got %v", err.Error())
		} else if !auth.CheckPasswordHash(u.Password, newPassword) {
			t.Errorf("Expected Password %v but got %v", newPassword, u.Password)
		}
	}
}

func TestUserModify(t *testing.T) {
	name := "name"
	email := "name@mail.com"

	data := []*models.User{{
		Name:  name,
		Email: email,
	}}

	ids, controller := getController(data)
	id := ids[0]

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	name = "changeName"
	controller.UserModify(ctx, &models.User{
		Id:   id,
		Name: name,
	})
	if data[0].Name != name {
		t.Errorf("Expected name %v but got %v", name, data[0].Name)
	}

	email = "newEmail@mail.com"
	controller.UserModify(ctx, &models.User{
		Id:    id,
		Email: email,
	})
	if data[0].Email != email {
		t.Errorf("Expected email %v but got %v", email, data[0].Email)
	}
}

func TestUserDelete(t *testing.T) {
	data := []*models.User{
		{
			Name:  "name0",
			Email: "name0@mail.com",
		},
		{
			Name:  "name1",
			Email: "name1@mail.com",
		},
		{
			Name:  "name2",
			Email: "name2@mail.com",
		},
	}

	ids, controller := getController(data)

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	err := controller.UserDelete(ctx, ids[1].Hex())
	if err != nil {
		t.Error("Expected no error when deleting valid user")
	} else if exists, _ := controller.UserExists(ctx, data[1].Name, data[1].Email); exists {
		t.Error("Expected user to not exist after deletion")
	}
}
