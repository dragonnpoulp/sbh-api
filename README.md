### Golang example:
```go
package main

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
)

func main() {
	signer, err := loadPrivateKey("private.pem")
	if err != nil {
		fmt.Errorf("signer is damaged: %v", err)
	}

	toSign := `POST /v1/notify-ekyc
REQUEST_20220110001.1641816102370.{"txid":"1ea682c5-b786-480e-be1d-f0dff0eb5781","status":"success","result":{"fullname":"Nguyễn Văn A","phone":"0973333333","bankAccount":198120046903,"identityNumber":2696338,"email":"seller@example.com"}}`

	signed, err := signer.Sign([]byte(toSign))
	if err != nil {
		fmt.Errorf("could not sign request: %v", err)
	}
	sig := base64.StdEncoding.EncodeToString(signed)
	fmt.Printf("Signature: %v\n", sig)

	parser, perr := loadPublicKey("public.pem")
	if perr != nil {
		fmt.Errorf("could not sign request: %v", err)
	}

	err = parser.Unsign([]byte(toSign), signed)
	if err != nil {
		fmt.Errorf("could not sign request: %v", err)
	}

	fmt.Printf("Unsign error: %v\n", err)
}

// loadPrivateKey loads an parses a PEM encoded private key file.
func loadPublicKey(path string) (Unsigner, error) {

	return parsePublicKey([]byte(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArUuxMybnO2dfD43NaaNG
hcM+dkgXIWpykHZPQWCKxVuqcEvSyGBfNwGB3BB6GxNxTkl0Wpv5fR3mcJbLtklI
Mnznfq9Q9x9kpjpjICuqFZrSjRdkw8BzowBQv/zegZ7jIaSR6r3chvbYNstIrO8p
KTbSdbFa0lSq+ZjwO6nLy98h7Bdxujt6XPCxpNr3VqLpIP45pkeNNeUmKQ8Bj/Ul
/ctjsl51elhqFC/qCfWISsqduCaNOX2IwKMl2EW918hqFtqMWNveHNcx8a9/vSjg
jhVD0paDRFNA+MD2Ml1VJiK1e0+EoO7llLR4biyPXa9pfg4NMot4BiS2+jLEcVO+
4QIDAQAB
-----END PUBLIC KEY-----`))
}

// parsePublicKey parses a PEM encoded private key.
func parsePublicKey(pemBytes []byte) (Unsigner, error) {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, errors.New("ssh: no key found")
	}

	var rawkey interface{}
	switch block.Type {
	case "PUBLIC KEY":
		rsa, err := x509.ParsePKIXPublicKey(block.Bytes)
		if err != nil {
			return nil, err
		}
		rawkey = rsa
	default:
		return nil, fmt.Errorf("ssh: unsupported key type %q", block.Type)
	}

	return newUnsignerFromKey(rawkey)
}

// loadPrivateKey loads an parses a PEM encoded private key file.
func loadPrivateKey(path string) (Signer, error) {
	return parsePrivateKey([]byte(`-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEArUuxMybnO2dfD43NaaNGhcM+dkgXIWpykHZPQWCKxVuqcEvS
yGBfNwGB3BB6GxNxTkl0Wpv5fR3mcJbLtklIMnznfq9Q9x9kpjpjICuqFZrSjRdk
w8BzowBQv/zegZ7jIaSR6r3chvbYNstIrO8pKTbSdbFa0lSq+ZjwO6nLy98h7Bdx
ujt6XPCxpNr3VqLpIP45pkeNNeUmKQ8Bj/Ul/ctjsl51elhqFC/qCfWISsqduCaN
OX2IwKMl2EW918hqFtqMWNveHNcx8a9/vSjgjhVD0paDRFNA+MD2Ml1VJiK1e0+E
oO7llLR4biyPXa9pfg4NMot4BiS2+jLEcVO+4QIDAQABAoIBAEvFT7pM5Ue8//x+
BPWOdXRhFPuEs9BhiawOfsLYInT+inxFOulv8dHML+p3rdwO2TjgtyYzEpgZLbvG
w1V1n0KsCFAE+cLDkC96UgMr9Fcz9aHJO763dBguOCBpwSQtw6PfIAnib/z3CzyS
D7nFbFrf5I+fN1XFvWga7dc4e6ossnsRAyTlJR0QnZ1BTgHUGrvdymrCJO+CrRDf
UTOpwr11ici6y4JnhMSFO41zGDtkR8UTQpe4MqY1OQqgcZup1K/v/Bs64nzNSBlv
UCd+3TsrUfzozDZepACl1AyHlGUeLmBRT52KAf1SJnGtq8Gc6Ebv4f54icp4Jimg
LPp/R1ECgYEA3B6VD9g+ZjIy+tJWAf5ZjpzEK8XGLX0T6DwoFLjoWjN8Ejx0blJP
2aBPOZUPpqf3Jm7P73XPSAsHbIKgyrS9EyRSyk40Na3JoP641l68bc02oqE0tLrO
ViKfXy+8mUaDa5qIrL00yU7k6QxQtoWVeHBJN436nAtwAO73jCH2cyUCgYEAyYsw
VPKFyOWxkSPzyiO1sIg0401cCsFH/FiNPw8AzZ6oDl+wwn0ntMlNp6+4wl9BLm13
dctf5kJhYjHnjv8HJ8vnN0msrCBUbjd7jDFKIHRNLQqn2OPZ0k0tMFI5F75CDOHO
klvNMohwNgSvukv1cFYEAay6BjNiBcNGYcQebg0CgYBL1hF/Ev50kSj1N1BAgZPz
SVlgx1O+yk/4e/lHImmS4hgF5GQsuhkenleNPCjXPxksWZM0Kf+PD5WwMdUZ4Wke
1i3b21OrhsNnvzqJSLxcjA4du7J/7bg2/tivn6+3kw6mHOinsswj6xV8oSyRpbZY
dz8Sb8z+xAYDnFEXK4BQLQKBgF+c88HpCEUFixbTGo30IPbtt0F6ascDaNYzYFbh
FD14Hjwrc1zhKRwgQAHkYF999xtCfWDZqdY/+ZkvGa6CGG/t0PQutIc4EzXyhl88
5vC8m/xZSMWhWq3lRSHecA1uikE4Qtq2SIPHrIxD7uYPsRGpDN+KhPn6GG+pc1Ng
ShtlAoGBAKnJXG9GpIsUIKG09g796z3F/VD8HCBTH0s9jtWclnlQU7faTzIVh0cf
QI+85jpPLguMbM4tR2ikSSV9VTdVoo7ZJqO90gH6zCM6FMwg7sayevr8OOwD4BAd
lpZEmvRzcGHn7TxV593ujvaGL+lkxLh0CKVSWFu6dALcOMDRogZj
-----END RSA PRIVATE KEY-----`))
}

// parsePublicKey parses a PEM encoded private key.
func parsePrivateKey(pemBytes []byte) (Signer, error) {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, errors.New("ssh: no key found")
	}

	var rawkey interface{}
	switch block.Type {
	case "RSA PRIVATE KEY":
		rsa, err := x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			return nil, err
		}
		rawkey = rsa
	default:
		return nil, fmt.Errorf("ssh: unsupported key type %q", block.Type)
	}
	return newSignerFromKey(rawkey)
}

// A Signer is can create signatures that verify against a public key.
type Signer interface {
	// Sign returns raw signature for the given data. This method
	// will apply the hash specified for the keytype to the data.
	Sign(data []byte) ([]byte, error)
}

// A Signer is can create signatures that verify against a public key.
type Unsigner interface {
	// Sign returns raw signature for the given data. This method
	// will apply the hash specified for the keytype to the data.
	Unsign(data []byte, sig []byte) error
}

func newSignerFromKey(k interface{}) (Signer, error) {
	var sshKey Signer
	switch t := k.(type) {
	case *rsa.PrivateKey:
		sshKey = &rsaPrivateKey{t}
	default:
		return nil, fmt.Errorf("ssh: unsupported key type %T", k)
	}
	return sshKey, nil
}

func newUnsignerFromKey(k interface{}) (Unsigner, error) {
	var sshKey Unsigner
	switch t := k.(type) {
	case *rsa.PublicKey:
		sshKey = &rsaPublicKey{t}
	default:
		return nil, fmt.Errorf("ssh: unsupported key type %T", k)
	}
	return sshKey, nil
}

type rsaPublicKey struct {
	*rsa.PublicKey
}

type rsaPrivateKey struct {
	*rsa.PrivateKey
}

// Sign signs data with rsa-sha256
func (r *rsaPrivateKey) Sign(data []byte) ([]byte, error) {
	h := sha256.New()
	h.Write(data)
	d := h.Sum(nil)
	return rsa.SignPKCS1v15(rand.Reader, r.PrivateKey, crypto.SHA256, d)
}

// Unsign verifies the message using a rsa-sha256 signature
func (r *rsaPublicKey) Unsign(message []byte, sig []byte) error {
	h := sha256.New()
	h.Write(message)
	d := h.Sum(nil)
	return rsa.VerifyPKCS1v15(r.PublicKey, crypto.SHA256, d, sig)
}
```

### NodeJS example:
```javascript
const crypto = require('crypto');

const data = `POST /v1/notify-ekyc
REQUEST_20220110001.1641816102370.{"txid":"1ea682c5-b786-480e-be1d-f0dff0eb5781","status":"success","result":{"fullname":"Nguyễn Văn A","phone":"0973333333","bankAccount":198120046903,"identityNumber":2696338,"email":"seller@example.com"}}`;

const key = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEArUuxMybnO2dfD43NaaNGhcM+dkgXIWpykHZPQWCKxVuqcEvS
yGBfNwGB3BB6GxNxTkl0Wpv5fR3mcJbLtklIMnznfq9Q9x9kpjpjICuqFZrSjRdk
w8BzowBQv/zegZ7jIaSR6r3chvbYNstIrO8pKTbSdbFa0lSq+ZjwO6nLy98h7Bdx
ujt6XPCxpNr3VqLpIP45pkeNNeUmKQ8Bj/Ul/ctjsl51elhqFC/qCfWISsqduCaN
OX2IwKMl2EW918hqFtqMWNveHNcx8a9/vSjgjhVD0paDRFNA+MD2Ml1VJiK1e0+E
oO7llLR4biyPXa9pfg4NMot4BiS2+jLEcVO+4QIDAQABAoIBAEvFT7pM5Ue8//x+
BPWOdXRhFPuEs9BhiawOfsLYInT+inxFOulv8dHML+p3rdwO2TjgtyYzEpgZLbvG
w1V1n0KsCFAE+cLDkC96UgMr9Fcz9aHJO763dBguOCBpwSQtw6PfIAnib/z3CzyS
D7nFbFrf5I+fN1XFvWga7dc4e6ossnsRAyTlJR0QnZ1BTgHUGrvdymrCJO+CrRDf
UTOpwr11ici6y4JnhMSFO41zGDtkR8UTQpe4MqY1OQqgcZup1K/v/Bs64nzNSBlv
UCd+3TsrUfzozDZepACl1AyHlGUeLmBRT52KAf1SJnGtq8Gc6Ebv4f54icp4Jimg
LPp/R1ECgYEA3B6VD9g+ZjIy+tJWAf5ZjpzEK8XGLX0T6DwoFLjoWjN8Ejx0blJP
2aBPOZUPpqf3Jm7P73XPSAsHbIKgyrS9EyRSyk40Na3JoP641l68bc02oqE0tLrO
ViKfXy+8mUaDa5qIrL00yU7k6QxQtoWVeHBJN436nAtwAO73jCH2cyUCgYEAyYsw
VPKFyOWxkSPzyiO1sIg0401cCsFH/FiNPw8AzZ6oDl+wwn0ntMlNp6+4wl9BLm13
dctf5kJhYjHnjv8HJ8vnN0msrCBUbjd7jDFKIHRNLQqn2OPZ0k0tMFI5F75CDOHO
klvNMohwNgSvukv1cFYEAay6BjNiBcNGYcQebg0CgYBL1hF/Ev50kSj1N1BAgZPz
SVlgx1O+yk/4e/lHImmS4hgF5GQsuhkenleNPCjXPxksWZM0Kf+PD5WwMdUZ4Wke
1i3b21OrhsNnvzqJSLxcjA4du7J/7bg2/tivn6+3kw6mHOinsswj6xV8oSyRpbZY
dz8Sb8z+xAYDnFEXK4BQLQKBgF+c88HpCEUFixbTGo30IPbtt0F6ascDaNYzYFbh
FD14Hjwrc1zhKRwgQAHkYF999xtCfWDZqdY/+ZkvGa6CGG/t0PQutIc4EzXyhl88
5vC8m/xZSMWhWq3lRSHecA1uikE4Qtq2SIPHrIxD7uYPsRGpDN+KhPn6GG+pc1Ng
ShtlAoGBAKnJXG9GpIsUIKG09g796z3F/VD8HCBTH0s9jtWclnlQU7faTzIVh0cf
QI+85jpPLguMbM4tR2ikSSV9VTdVoo7ZJqO90gH6zCM6FMwg7sayevr8OOwD4BAd
lpZEmvRzcGHn7TxV593ujvaGL+lkxLh0CKVSWFu6dALcOMDRogZj
-----END RSA PRIVATE KEY-----`;

const sign = crypto.createSign('sha256');
sign.write(data);
sign.end();

console.log(sign.sign(key, 'base64'));
```