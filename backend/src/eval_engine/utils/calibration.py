import numpy as np

def brier_score(probabilities: list[float], outcomes: list[int]) -> float:
    """Calculate Brier score."""
    p = np.array(probabilities)
    o = np.array(outcomes)
    return float(np.mean((p - o) ** 2))

def expected_calibration_error(probabilities: list[float], outcomes: list[int], n_bins: int = 10) -> float:
    """Calculate Expected Calibration Error."""
    p = np.array(probabilities)
    o = np.array(outcomes)
    bins = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    for i in range(n_bins):
        mask = (p >= bins[i]) & (p < bins[i + 1])
        if i == n_bins - 1:
            mask = (p >= bins[i]) & (p <= bins[i + 1])
        if np.any(mask):
            bin_p = np.mean(p[mask])
            bin_o = np.mean(o[mask])
            ece += np.abs(bin_p - bin_o) * np.sum(mask) / len(p)
    return float(ece)

def reliability_diagram_data(probabilities: list[float], outcomes: list[int], n_bins: int = 10) -> dict:
    """Generate data for reliability diagrams."""
    p = np.array(probabilities)
    o = np.array(outcomes)
    bins = np.linspace(0, 1, n_bins + 1)
    data = {"bins": [], "accuracies": [], "confidences": [], "counts": []}
    for i in range(n_bins):
        mask = (p >= bins[i]) & (p < bins[i + 1])
        if i == n_bins - 1:
            mask = (p >= bins[i]) & (p <= bins[i + 1])
        if np.any(mask):
            data["bins"].append(float((bins[i] + bins[i+1]) / 2))
            data["accuracies"].append(float(np.mean(o[mask])))
            data["confidences"].append(float(np.mean(p[mask])))
            data["counts"].append(int(np.sum(mask)))
    return data
