import numpy as np

class KalmanSmoother:
    def __init__(self, process_variance: float = 1e-4, measurement_variance: float = 1e-2):
        self.process_variance = process_variance
        self.measurement_variance = measurement_variance
        
        self.posteriors = {} # state estimate
        self.posteriors_error = {} # estimate error

    def filter(self, signal_name: str, measurement: float) -> float:
        if signal_name not in self.posteriors:
            self.posteriors[signal_name] = measurement
            self.posteriors_error[signal_name] = 1.0
            return measurement

        # Prediction update
        prior = self.posteriors[signal_name]
        prior_error = self.posteriors_error[signal_name] + self.process_variance

        # Measurement update
        kalman_gain = prior_error / (prior_error + self.measurement_variance)
        posterior = prior + kalman_gain * (measurement - prior)
        posterior_error = (1 - kalman_gain) * prior_error

        self.posteriors[signal_name] = posterior
        self.posteriors_error[signal_name] = posterior_error

        return posterior
