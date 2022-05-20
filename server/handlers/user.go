package handlers

import (
	"net/http"
	"net/mail"
	"strings"
	"unicode"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// This handler is meant to be accessed without an account.
func UserExistsGet(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		name := ctx.DefaultQuery("name", "")
		email := ctx.DefaultQuery("email", "")
		exists, err := controller.UserExists(ctx, name, email)
		if err != nil {
			DisplayError(ctx, err.Error())
		} else {
			ctx.JSON(http.StatusOK, gin.H{"exists": exists})
		}
	}
}

// This handler is meant to be accessed without an account.
// Thus, no sensitive information should be leaked from this!
func UserGet(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id := ctx.DefaultQuery("id", "")
		name := ctx.DefaultQuery("name", "")
		user, err := controller.UserRetrieve(ctx, id, name)
		if err == mongo.ErrNoDocuments {
			DisplayError(ctx, "user does not exist")
		} else if err != nil {
			DisplayError(ctx, err.Error())
		} else {
			// only return a non-sensitive subset of the information
			returnedUser := gin.H{
				"name":     user.Name,
				"email":    user.Email,
				"projects": user.Projects,
			}
			ctx.JSON(http.StatusOK, returnedUser)
		}
	}
}

func UserGetSelf(controller controllers.Controller, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		user, err := controller.UserRetrieve(ctx, id, "")
		if err == mongo.ErrNoDocuments {
			DisplayError(ctx, "user does not exist")
		} else if err != nil {
			DisplayError(ctx, err.Error())
		} else {
			ctx.JSON(http.StatusOK, user)
		}
	}
}

func alreadySignedUp(controller controllers.Controller, ctx *gin.Context, name, email string) (string, bool) {
	if exists, _ := controller.UserExists(ctx, name, email); exists {
		return "username or email already exists", false
	}
	return "", true
}

func isValidEmail(email string) (string, bool) {
	if email == "" {
		return "please provide an email", false
	}
	_, err := mail.ParseAddress(email)
	if err != nil {
		return "email is not a valid address", false
	}
	return "", true
}

func isValidName(name string) (string, bool) {
	if name == "" {
		return "please provide a username", false
	} else if len(name) < 5 {
		return "username too short", false
	}
	for i := 0; i < len(name); i++ {
		c := name[i]
		if 'a' <= c && c <= 'z' ||
			'A' <= c && c <= 'Z' ||
			'0' <= c && c <= '9' ||
			c == ' ' ||
			c == '_' ||
			c == '.' {
			continue
		}
		return "name contains invalid character", false
	}
	return "", true
}

func isValidPassword(name, password string) (string, bool) {
	if password == "" {
		return "please provide a password", false
	} else if len(password) < 8 {
		return "password too short", false
	} else if strings.Contains(password, name) {
		return "password cannot contain username", false
	}
	hasLowerCase := false
	hasUpperCase := false
	hasDigit := false
	for i := 0; i < len(password); i++ {
		c := password[i]
		// check for non-ascii character
		// https://stackoverflow.com/a/53069799
		if c > unicode.MaxASCII {
			return "password contains invalid character", false
		} else if 'a' <= c && c <= 'z' {
			hasLowerCase = true
		} else if 'A' <= c && c <= 'Z' {
			hasUpperCase = true
		} else if '0' <= c && c <= '9' {
			hasDigit = true
		}
	}
	if !hasLowerCase {
		return "password missing required lowercase letter", false
	} else if !hasUpperCase {
		return "password missing required uppercase letter", false
	} else if !hasDigit {
		return "password missing required digit", false
	}
	return "", true
}

func UserSignup(controller controllers.Controller, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var user models.User
		tests := []func() (string, bool){
			func() (string, bool) {
				return isValidName(user.Name)
			},
			func() (string, bool) {
				return isValidPassword(user.Name, user.Password)
			},
			func() (string, bool) {
				return isValidEmail(user.Email)
			},
			func() (string, bool) {
				return alreadySignedUp(controller, ctx, user.Name, user.Email)
			},
		}
		for _, t := range tests {
			if msg, ok := t(); !ok {
				DisplayError(ctx, msg)
				return
			}
		}
		if err := ctx.BindJSON(&user); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		hashedPassword, err := auth.HashPassword(user.Password)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		user.Password = hashedPassword
		if err := controller.UserCreate(ctx, &user); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		if err := jwtParser.RefreshJWT(ctx, user.Id.Hex()); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		ctx.JSON(http.StatusCreated, gin.H{})
	}
}

func UserLogin(controller controllers.Controller, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var user models.User
		if err := ctx.BindJSON(&user); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		if len(user.Name) == 0 || len(user.Password) == 0 {
			DisplayError(ctx, "please provide a username and password")
			return
		}
		validLogin, err := controller.UserCheckPassword(ctx, &user)
		if !validLogin || err != nil {
			// Intentionally not exposing any other details.
			DisplayError(ctx, "username and password do not match")
			return
		}
		if err := jwtParser.RefreshJWT(ctx, user.Id.Hex()); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		ctx.JSON(http.StatusCreated, gin.H{})
	}
}

// Only used for modifying username, password and email.
func UserPatch(controller controllers.Controller, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type query struct {
			Name     string `bson:"name" json:"name"`
			Password string `bson:"password" json:"password"`
			Email    string `bson:"email" json:"email"`
		}
		var q query
		if err := ctx.BindJSON(&q); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		tests := []func() (string, bool){
			func() (string, bool) {
				if q.Name == "" {
					return "", true
				}
				return isValidName(q.Name)
			},
			func() (string, bool) {
				if q.Password == "" {
					return "", true
				} else if q.Name == "" {
					return "for modifying password, send username as well (even if its the same)", false
				}
				return isValidPassword(q.Name, q.Password)
			},
			func() (string, bool) {
				if q.Email == "" {
					return "", true
				}
				return isValidEmail(q.Email)
			},
		}
		for _, t := range tests {
			if msg, ok := t(); !ok {
				DisplayError(ctx, msg)
				return
			}
		}
		objectId, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		user := models.User{
			Id: objectId,
		}
		if q.Name != "" {
			user.Name = q.Name
		}
		if q.Password != "" {
			hashedPassword, err := auth.HashPassword(q.Password)
			if err != nil {
				DisplayError(ctx, err.Error())
				return
			}
			user.Password = hashedPassword
		}
		if q.Email != "" {
			user.Email = q.Email
		}
		controller.UserModify(ctx, &user)
		// hide password from output
		user.Password = ""
		ctx.JSON(http.StatusOK, user)
	}
}

func UserDelete(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id := ctx.Param("id")
		if err := controller.UserDelete(ctx, id); err != nil {
			DisplayError(ctx, err.Error())
		} else {
			ctx.JSON(http.StatusOK, gin.H{})
		}
	}
}
