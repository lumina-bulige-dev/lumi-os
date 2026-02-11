package falcon

import (
	"testing"
)

func TestSignAndVerify(t *testing.T) {
	message := []byte("test message")
	priv := PrivateKey{} // 仮の鍵（Phase 2で実装）
	pub := PublicKey{}

	sig, err := Sign(message, priv)
	if err != nil {
		t.Fatalf("Sign failed: %v", err)
	}

	valid, err := Verify(message, sig, pub)
	if err != nil {
		t.Fatalf("Verify failed: %v", err)
	}

	if !valid {
		t.Errorf("Signature verification failed")
	}
}