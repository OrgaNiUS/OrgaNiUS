package mailer

import (
	"log"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type Mailer struct {
	Sender *mail.Email
	Client *sendgrid.Client
}

func New(name, sender, key string) *Mailer {
	return &Mailer{
		Sender: mail.NewEmail(name, sender),
		Client: sendgrid.NewSendClient(key),
	}
}

func (m *Mailer) Send(name, address, subject, body string) error {
	from := m.Sender
	to := mail.NewEmail(name, address)
	// there is also a mail.NewSingleEmail() that accepts HTML content
	message := mail.NewSingleEmailPlainText(from, subject, to, body)
	_, err := m.Client.Send(message)
	if err != nil {
		log.Printf("failed to send email: %v", err)
		return err
	}
	return nil
}
