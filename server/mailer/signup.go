package mailer

import (
	"fmt"
)

func (m *Mailer) SendVerification(name, email, pin string) error {
	subject := "Welcome to OrgaNiUS! Confirm Your Email!"
	format := `Hey %s!

Enter this pin "%s" in the prompt.

Regards,
OrgaNiUS Team`
	body := fmt.Sprintf(format, name, pin)
	return m.Send(name, email, subject, body)
}
