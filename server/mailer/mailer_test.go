package mailer_test

import (
	"context"
	"fmt"
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

func getTestMailer() *mailer.Mailer {
	name := "tester"
	sender := "tester@test.com"
	key := "abcdef"
	mailer := mailer.New(name, sender, key)
	mailer.Client = &MockClient{}
	return mailer
}

func TestSend(t *testing.T) {
	mailer := getTestMailer()

	type sendData struct {
		name, address, subject, body string
	}

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

func TestSendVerification(t *testing.T) {
	mailer_ := getTestMailer()

	type sendData struct {
		name, email, pin string
	}

	tests := []sendData{
		{"name1", "xxxx@mail.com", "ABCDE0"},
		{"name2", "yyyy@mail.com", "12345F"},
	}

	for _, test := range tests {
		mailer_.SendVerification(test.name, test.email, test.pin)
		mail := mailer_.Client.(*MockClient).lastSend
		if mail.Subject != mailer.SignupSubject {
			t.Errorf("Expected subject %v but got %v", mailer.SignupSubject, mail.Subject)
		}
		actual := mail.Content[0].Value
		expected := fmt.Sprintf(mailer.SignupFormat, test.name, test.pin)
		if actual != expected {
			t.Errorf("Expected body %v but got %v", expected, actual)
		}
	}
}

func TestSendForgotPW(t *testing.T) {
	mailer_ := getTestMailer()

	type sendData struct {
		name, email, pin string
	}

	tests := []sendData{
		{"name1", "xxxx@mail.com", "ABCDE0"},
		{"name2", "yyyy@mail.com", "12345F"},
	}

	for _, test := range tests {
		mailer_.SendForgotPW(test.name, test.email, test.pin)
		mail := mailer_.Client.(*MockClient).lastSend
		if mail.Subject != mailer.ForgotPWSubject {
			t.Errorf("Expected subject %v but got %v", mailer.ForgotPWSubject, mail.Subject)
		}
		actual := mail.Content[0].Value
		expected := fmt.Sprintf(mailer.ForgotPWFormat, test.name, test.pin)
		if actual != expected {
			t.Errorf("Expected body %v but got %v", expected, actual)
		}
	}
}
