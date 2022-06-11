package auth

import (
	"fmt"
	"log"
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

func (p *JWTParser) Generate(id, name string) (string, error) {
	claims := p.token.Claims.(jwt.MapClaims)

	/*
		JWT Content
			id => user id
			iat => JWT issue  time (in Unix time)
			exp => JWT expiry time (in Unix time)
	*/

	now := time.Now()

	claims["id"] = id
	claims["name"] = name
	claims["iat"] = now.Unix()
	claims["exp"] = now.Add(expTime).Unix()

	tokenString, err := p.token.SignedString(p.secret)

	if err != nil {
		log.Printf("failed to generate jwt: %v", err)
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

func (p *JWTParser) GetKey(tokenString, key string) (string, error) {
	claims, err := p.Parse(tokenString)
	if err != nil {
		return "", err
	}
	return claims[key].(string), nil
}

const (
	// 10 minutes
	expiryTime = 10 * 60
)

func MakeJWTCookie(value string) *http.Cookie {
	return &http.Cookie{
		Name:  "jwt",
		Value: value,
		Path:  "/",
		// Expires is used for compatibility with IE, all other modern browsers use MaxAge
		Expires: time.Now().Add(10 * time.Minute),
		MaxAge:  expiryTime,
		Secure:  false,
		// Same SiteStrict Mode forces the cookie to never be sent to another site
		SameSite: http.SameSiteStrictMode,
		HttpOnly: false,
	}
}

// Refreshes JWT expiry time.
func (p *JWTParser) RefreshJWT(ctx *gin.Context, id, name string) error {
	jwt, err := p.Generate(id, name)
	if err != nil {
		return err
	}
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
	http.SetCookie(ctx.Writer, MakeJWTCookie(jwt))
	return nil
}

// Gets ID and Name from JWT from Cookie.
// Returns false if the JWT is not valid.
// Refreshes JWT as well.
func (p *JWTParser) GetFromJWT(ctx *gin.Context) (string, string, bool) {
	jwt, err := ctx.Cookie("jwt")
	if err != nil {
		return "", "", false
	}
	id, err := p.GetKey(jwt, "id")
	if err != nil {
		return "", "", false
	}
	name, err := p.GetKey(jwt, "name")
	if err != nil {
		return "", "", false
	}
	// refresh JWT on any request
	// GetID already ensures that the JWT is valid
	p.RefreshJWT(ctx, id, name)
	return id, name, true
}

func (p *JWTParser) DeleteJWT(ctx *gin.Context) {
	// MaxAge < 0 deletes the cookie
	http.SetCookie(ctx.Writer, &http.Cookie{
		Name:  "jwt",
		Value: "",
		Path:  "/",
		// Expires is used for compatibility with IE, all other modern browsers use MaxAge
		Expires: time.Now(),
		MaxAge:  -1,
		Secure:  false,
		// Same SiteStrict Mode forces the cookie to never be sent to another site
		SameSite: http.SameSiteStrictMode,
		HttpOnly: false,
	})
}
