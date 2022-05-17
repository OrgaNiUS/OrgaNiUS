package auth

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

type JWTParser struct {
	token  *jwt.Token
	secret []byte
}

const (
	expTime = 10 * time.Minute
)

func New(jwtSecret string) *JWTParser {
	jwtSecretBytes := []byte(jwtSecret)
	token := jwt.New(jwt.SigningMethodHS256)
	return &JWTParser{
		token,
		jwtSecretBytes,
	}
}

func (p *JWTParser) Generate(id string) (string, error) {
	claims := p.token.Claims.(jwt.MapClaims)

	/*
		JWT Content
			id => user id
			iat => JWT issue  time (in Unix time)
			exp => JWT expiry time (in Unix time)
	*/

	now := time.Now()

	claims["id"] = id
	claims["iat"] = now.Unix()
	claims["exp"] = now.Add(expTime).Unix()

	tokenString, err := p.token.SignedString(p.secret)

	if err != nil {
		fmt.Println(err.Error())
		return "", err
	}
	return tokenString, nil
}

func (p *JWTParser) Parse(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// HS256 is a HMAC signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("wrong signing method: %v", token.Header["alg"])
		}
		return p.secret, nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, err
}

func (p *JWTParser) GetID(tokenString string) (string, error) {
	claims, err := p.Parse(tokenString)
	if err != nil {
		return "", err
	}
	return claims["id"].(string), nil
}

const (
	// 10 minutes
	expiryTime = 10 * 60 * 60
)

// Refreshes JWT expiry time.
func (p *JWTParser) RefreshJWT(ctx *gin.Context, jwt string) {
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
	http.SetCookie(ctx.Writer, &http.Cookie{
		Name:     "jwt",
		Value:    jwt,
		Path:     "/",
		MaxAge:   expiryTime,
		Secure:   false,
		HttpOnly: true,
	})
}

// Gets ID from JWT from Cookie.
// Returns false if the JWT is not valid.
// Refreshes JWT as well.
func (p *JWTParser) GetFromJWT(ctx *gin.Context) (string, bool) {
	jwt, err := ctx.Cookie("jwt")
	if err != nil {
		return "", false
	}
	id, err := p.GetID(jwt)
	if err != nil {
		return "", false
	}
	// refresh JWT on any request
	p.RefreshJWT(ctx, jwt)
	return id, true
}
