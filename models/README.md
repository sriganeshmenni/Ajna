# ML Model Weights

This directory stores downloaded ML model weights. They are git-ignored.

Models are downloaded automatically on first run:

| Model | Size | Purpose |
|-------|------|---------|
| faster-whisper large-v3-turbo | ~1.5 GB | Speech-to-text (ASR) |
| MediaPipe FaceLandmarker | ~5 MB | Face detection + 478 landmarks |
| Silero VAD | ~2 MB | Voice activity detection |
| BAAI/bge-base-en-v1.5 | ~440 MB | Semantic text embeddings |
| all-MiniLM-L6-v2 | ~80 MB | Fast semantic similarity |
| openSMILE eGeMAPSv02 | ~1 MB | Acoustic feature config |
| pyannote speaker-diarization | ~100 MB | Speaker diarization |

**Total:** ~2.1 GB (approximate)

## Manual Download

If automatic download fails, models can be downloaded from Hugging Face:

```bash
# faster-whisper
pip install faster-whisper
# Models download automatically on first use

# sentence-transformers
pip install sentence-transformers
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-base-en-v1.5')"
```
