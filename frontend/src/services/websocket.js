import ReconnectingWebSocket from 'reconnecting-websocket';

const HEADER_SIZE = 13;

export class MultimodalStreamService {
  constructor(baseUrl = 'ws://localhost:8000') {
    this.baseUrl = baseUrl;
    this.ws = null;
    this.messageHandlers = new Set();
    this.sessionId = null;
  }

  connect(sessionId = 'sess_default', ticket = null, token = null) {
    this.sessionId = sessionId;
    let wsUrl = `${this.baseUrl}/ws/${sessionId}`;
    const params = new URLSearchParams();
    if (ticket) params.append('ticket', ticket);
    else if (token) params.append('token', token);
    
    const queryString = params.toString();
    if (queryString) {
      wsUrl += `?${queryString}`;
    }
    
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new ReconnectingWebSocket(wsUrl, [], {
      maxRetries: 10,
      connectionTimeout: 4000,
    });
    this.ws.binaryType = 'arraybuffer';

    this.ws.addEventListener('open', () => {
      console.log(`[WS] Connected: ${wsUrl}`);
      this._notifyHandlers({ type: 'connection', status: 'connected', sessionId });
    });

    this.ws.addEventListener('message', (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          this._notifyHandlers(data);
        } catch (e) {
          console.error('[WS] JSON parse error:', e);
        }
      }
    });

    this.ws.addEventListener('close', () => {
      console.log('[WS] Disconnected');
      this._notifyHandlers({ type: 'connection', status: 'disconnected' });
    });

    this.ws.addEventListener('error', (err) => {
      console.error('[WS] Error:', err);
      this._notifyHandlers({ type: 'connection', status: 'error' });
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  _notifyHandlers(data) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (e) {
        console.error('[WS] Handler error:', e);
      }
    });
  }

  packPacket(modality, payloadArrayBuffer) {
    const payloadLength = payloadArrayBuffer.byteLength;
    const buffer = new ArrayBuffer(HEADER_SIZE + payloadLength);
    const view = new DataView(buffer);
    
    // Byte 0: Modality (0x01: Video, 0x02: Audio, 0x03: Control)
    view.setUint8(0, modality);
    
    // Bytes 1-8: Timestamp uint64 ms
    const now = Date.now();
    const high = Math.floor(now / 0x100000000);
    const low = now % 0x100000000;
    view.setUint32(1, high, false);
    view.setUint32(5, low, false);
    
    // Bytes 9-12: Payload length uint32
    view.setUint32(9, payloadLength, false);
    
    // Copy payload bytes into buffer starting at offset 13
    const uint8View = new Uint8Array(buffer);
    uint8View.set(new Uint8Array(payloadArrayBuffer), HEADER_SIZE);
    
    return buffer;
  }

  sendVideoFrame(jpegBlob) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      jpegBlob.arrayBuffer().then(buffer => {
        const packet = this.packPacket(0x01, buffer);
        this.ws.send(packet);
      });
    }
  }

  sendAudioChunk(pcmArrayBuffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const packet = this.packPacket(0x02, pcmArrayBuffer);
      this.ws.send(packet);
    }
  }

  sendControl(jsonData) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const jsonString = JSON.stringify(jsonData);
      const encoder = new TextEncoder();
      const jsonBuffer = encoder.encode(jsonString).buffer;
      const packet = this.packPacket(0x03, jsonBuffer);
      this.ws.send(packet);
    }
  }

  onMessage(callback) {
    this.messageHandlers.add(callback);
    return () => this.messageHandlers.delete(callback);
  }
}

export const streamService = new MultimodalStreamService();

/**
 * Creates a telemetry router that dispatches WebSocket messages
 * to the appropriate Zustand store slices.
 * 
 * Usage in App.jsx:
 *   useEffect(() => {
 *     const unsubscribe = createTelemetryRouter(store);
 *     return unsubscribe;
 *   }, []);
 */
export function createTelemetryRouter(store) {
  return streamService.onMessage((data) => {
    switch (data.type) {
      case 'telemetry_update':
        if (data.modality === 'vision') {
          store.setVisionTelemetry(data.payload);
          store.updateMetrics({
            facePresent: data.payload.face_count > 0,
            faceProbability: data.payload.face_presence_probability,
            faceCount: data.payload.face_count,
            headPose: data.payload.head_orientation,
            gazeDeviation: data.payload.gaze_deviation_angle,
          });
        } else if (data.modality === 'audio' || data.modality === 'audio_speech') {
          store.setAudioTelemetry(data.payload);
          if (data.payload.f0_hz && data.payload.is_speech) {
            store.addF0(data.payload.f0_hz);
          }
          store.updateMetrics({
            speechActive: data.payload.is_speech,
            speechProbability: data.payload.speech_probability,
            speakingRate: data.payload.speaking_rate_wpm || 0,
          });
        }
        break;

      case 'state_update':
        store.setStateTelemetry(data.payload);
        store.updateMetrics({
          currentState: data.payload.dominant_state,
          stateProbs: data.payload.states,
        });
        break;

      case 'fusion_update':
        if (data.payload?.weights) {
          store.setFusionWeights(data.payload.weights);
        }
        break;

      case 'transcription':
        store.addTranscription({
          text: data.payload.text,
          words: data.payload.words || [],
          speaker: data.payload.speaker || 'CANDIDATE',
          timestamp: data.payload.timestamp || Date.now(),
          wpm: data.payload.wpm || 0,
          start: data.payload.start,
          end: data.payload.end,
        });
        break;

      case 'event':
        store.addEvent({
          type: data.payload.type,
          timestamp: data.payload.timestamp || Date.now(),
          modality: data.payload.modality || data.payload.source,
          severity: data.payload.severity || 'informational',
          description: data.payload.description || data.payload.type,
          probability: data.payload.probability || 1.0,
        });
        break;

      case 'evidence_created':
        store.addEvidence(data.payload);
        break;

      case 'engine_status':
        store.setEngineStatus(data.payload);
        break;

      case 'connection':
        if (data.status === 'connected') {
          store.setEngineStatus({
            vision: 'online',
            audio: 'online',
            asr: 'online',
            nlp: 'online',
            fusion: 'online',
            llm: 'online',
          });
        } else if (data.status === 'disconnected' || data.status === 'error') {
          store.setEngineStatus({
            vision: 'offline',
            audio: 'offline',
            asr: 'offline',
            nlp: 'offline',
            fusion: 'offline',
            llm: 'offline',
          });
        }
        break;

      default:
        break;
    }
  });
}
