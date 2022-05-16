package auth

import (
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	passwordBytes := []byte(password)
	bytes, err := bcrypt.GenerateFromPassword(passwordBytes, bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(hash, password string) bool {
	passwordBytes := []byte(password)
	hashBytes := []byte(hash)
	err := bcrypt.CompareHashAndPassword(hashBytes, passwordBytes)
	// bcrypt.CompareHashAndPassword returns ErrMismatchedHashAndPassword if hash and password does not match
	return err == nil
}
