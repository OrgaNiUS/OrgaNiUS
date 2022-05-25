package auth

import (
	"crypto/rand"
	"encoding/base32"
	"fmt"
)

// Generates a hash and the 6-character PIN. Used for email verification.
// PIN will be sent to the user's email and only the hash will be stored in the database.
// Hash must not be exposed to the user because it is fairly easy to brute force (only 6 characters).
func GeneratePin() (string, string) {
	// https://pkg.go.dev/crypto/rand?utm_source=gopls#Read
	length := 6
	// 2^20 == 1'048'576 (sufficient for all 6 digit numbers)
	randomBytes := make([]byte, 20)
	_, err := rand.Read(randomBytes)
	if err != nil {
		fmt.Println(err.Error())
		return "", ""
	}
	pin := base32.StdEncoding.EncodeToString(randomBytes)[:length]
	hash, err := HashPassword(pin)
	if err != nil {
		fmt.Println(err.Error())
		return "", ""
	}
	return hash, pin
}
