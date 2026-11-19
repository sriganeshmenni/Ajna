import numpy as np

def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    arr_a = np.array(a)
    arr_b = np.array(b)
    norm_a = np.linalg.norm(arr_a)
    norm_b = np.linalg.norm(arr_b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(arr_a, arr_b) / (norm_a * norm_b))

def moving_average(values: list[float], window: int) -> list[float]:
    """Calculate moving average."""
    if not values or window <= 0:
        return []
    res = []
    for i in range(len(values)):
        start = max(0, i - window + 1)
        res.append(float(np.mean(values[start:i+1])))
    return res

def z_score_normalize(values: list[float]) -> list[float]:
    """Apply Z-score normalization."""
    arr = np.array(values)
    std = np.std(arr)
    if std == 0:
        return [0.0] * len(values)
    res = (arr - np.mean(arr)) / std
    return res.tolist()

def entropy(probabilities: list[float]) -> float:
    """Calculate entropy of a probability distribution."""
    p = np.array(probabilities)
    p = p[p > 0]
    return float(-np.sum(p * np.log2(p)))

def kl_divergence(p: list[float], q: list[float]) -> float:
    """Calculate KL divergence between distributions p and q."""
    p_arr = np.array(p)
    q_arr = np.array(q)
    mask = (p_arr > 0) & (q_arr > 0)
    p_valid = p_arr[mask]
    q_valid = q_arr[mask]
    return float(np.sum(p_valid * np.log(p_valid / q_valid)))
