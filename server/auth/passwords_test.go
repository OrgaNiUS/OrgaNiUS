package auth_test

import (
	"testing"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
)

// Tests both hashing and checking hash together as they go hand in hand.
func TestHashPasswordAndCheck(t *testing.T) {
	tests := []string{
		// Generated from https://www.random.org/passwords
		"Sn3jbvPwV9t8G6Lw",
		"7ePbnv2QwnzFGAmL",
		"vPFYuNcReFTeTKRe",
		"3mZx4L5CrXpWd5vg",
		"NLecRAAJTmbkfaM4",
		"APVaYAvGveUN4BKF",
		"ZjpPQdLQYhjZDraf",
		"UhDtfmDbjGpQ5sLU",
		"K9NkqeZdBNKTdv34",
		"UXMySQQPPDLJRpC6",
		"ZreaE7MXQxRC8h45",
		"EFnMECz9zphxCaVc",
		"HD73TvFALHWMHukZ",
		"8LMyUSq7sXYKgyYH",
		"jkLqMzQKYtJQb4SS",
		"k9EacVqVK39QJCZz",
		"aQEWBmxLpffsdwAV",
		"Lqnuz52nMUGHLkuP",
		"KkQTBqxZXAmRhJu2",
		"48w42V2ECbGMj4wb",
	}

	for _, password := range tests {
		hash, _ := auth.HashPassword(password)
		if !auth.CheckPasswordHash(hash, password) {
			t.Errorf("Expected password %v and hash to match", password)
		}
	}
}
