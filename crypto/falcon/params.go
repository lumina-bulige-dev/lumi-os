// Package crypto provides cryptographic functions and types.
package crypto

// FalconParams defines the parameters for the Falcon-512 signature scheme.
type FalconParams struct {
	N      int    // Dimension of the polynomial
	K      int    // Number of polynomials in the public key
	P      int    // Polynomial modulus
	Q      int    // Secret key modulus
	Match  string // Matching string
}

// NewFalconParams returns a new instance of FalconParams initialized for Falcon-512.
func NewFalconParams() *FalconParams {
	return &FalconParams{
		N:     512,
		K:     2,
		P:     12289,
		Q:     8191,
		Match: "Falcon-512",
	}
}