package crypto

// GaussianSampler is an interface for Gaussian sampling.
type GaussianSampler interface {
    Sample(mean, variance float64) float64
}