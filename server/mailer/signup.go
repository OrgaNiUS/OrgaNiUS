package mailer

import (
	"fmt"
)

const (
	SignupSubject = "Welcome to OrgaNiUS! Confirm Your Email!"
	SignupFormat  = `Hey %s!

	Enter this pin "%s" in the prompt.

	Regards,
	OrgaNiUS Team`
)

func (m *Mailer) SendVerification(name, email, pin string) error {
	body := fmt.Sprintf(SignupFormat, name, pin)
	return m.Send(name, email, SignupSubject, body)
}
