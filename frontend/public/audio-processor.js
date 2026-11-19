/**
 * AudioStreamProcessor (AudioWorklet)
 * Buffers 16kHz Float32 mono mic input into 100ms (1600 samples) 16-bit PCM chunks.
 */
class AudioStreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 1600; // 100ms chunk at 16kHz
    this.buffer = new Int16Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0]; // Float32 mono
      const len = channelData.length;

      for (let i = 0; i < len; i++) {
        const s = Math.max(-1, Math.min(1, channelData[i]));
        this.buffer[this.bufferIndex++] = s < 0 ? s * 0x8000 : s * 0x7FFF;

        if (this.bufferIndex >= this.bufferSize) {
          const chunk = new Int16Array(this.buffer);
          this.port.postMessage(chunk.buffer, [chunk.buffer]);
          this.bufferIndex = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor('audio-stream-processor', AudioStreamProcessor);
