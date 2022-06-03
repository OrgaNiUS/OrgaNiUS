package mailer_test

import (
	"context"
	"testing"

	"github.com/OrgaNiUS/OrgaNiUS/server/mailer"
	"github.com/sendgrid/rest"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type MockClient struct {
	lastSend *mail.SGMailV3
}

func (c *MockClient) Send(email *mail.SGMailV3) (*rest.Response, error) {
	c.lastSend = email
	return nil, nil
}

func (c *MockClient) SendWithContext(ctx context.Context, email *mail.SGMailV3) (*rest.Response, error) {
	// Not used.
	return nil, nil
}

type sendData struct {
	name, address, subject, body string
}

func TestNew(t *testing.T) {
	name := "tester"
	sender := "tester@test.com"
	key := "abcdef"
	mailer := mailer.New(name, sender, key)
	mailer.Client = &MockClient{}

	tests := []sendData{
		{"name1", "mail1@mail.com", "subject here", "body here\nanother line"},
		{"name2", "mail2@mail.com", "2nd subject here", "body here"},
	}

	for _, test := range tests {
		mailer.Send(test.name, test.address, test.subject, test.body)
		mail := mailer.Client.(*MockClient).lastSend
		subject := mail.Subject
		content := mail.Content
		body := content[0].Value
		if subject != test.subject {
			t.Errorf("Expected subject %v but got %v", test.subject, subject)
		}
		if body != test.body {
			t.Errorf("Expected body %v but got %v", test.body, body)
		}
	}
}
