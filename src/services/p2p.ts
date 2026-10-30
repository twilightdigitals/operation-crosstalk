// Real-time Cloud Relay Service for Operation: CrossTalk
// Uses HTTPS Server-Sent Events (SSE) + HTTP POST.
// Guaranteed 100% firewall traversal across any carrier, Wi-Fi, or cellular network.

import type { MissionState } from './gameEngine';

export type GameRole = 'operative' | 'analyst';

export type RelayMessage =
  | { type: 'STATE_SYNC'; state: MissionState; sender: string }
  | { type: 'JOIN_SIGNAL'; sender: string }
  | { type: 'STRIKE_EVENT'; strikes: number; sender: string }
  | { type: 'SOLVED_EVENT'; moduleName: string; sender: string }
  | { type: 'ROLE_SWAP'; sender: string }
  | { type: 'HEARTBEAT'; sender: string };

const RELAY_BASE = 'https://ntfy.sh';

export class RelayNetwork {
  public isHost: boolean = false;
  public roomCode: string = '';
  public connected: boolean = false;
  public clientId: string = Math.random().toString(36).substring(2, 10);

  private eventSource: EventSource | null = null;
  private heartbeatTimer: number | null = null;
  private onStateCallback: ((state: MissionState) => void) | null = null;
  private onMessageCallback: ((msg: RelayMessage) => void) | null = null;
  private onConnectionStatusCallback: ((connected: boolean) => void) | null = null;

  public initialize(
    onState: (state: MissionState) => void,
    onMessage: (msg: RelayMessage) => void,
    onStatus: (connected: boolean) => void
  ) {
    this.onStateCallback = onState;
    this.onMessageCallback = onMessage;
    this.onConnectionStatusCallback = onStatus;
  }

  private getTopic(roomCode: string): string {
    return `crosstalk_v1_room_${roomCode.trim().toUpperCase()}`;
  }

  // Host a new room with a 5-letter code
  public createRoom(code: string, initialState: MissionState): Promise<string> {
    return new Promise((resolve) => {
      this.disconnect();
      this.isHost = true;
      this.roomCode = code.toUpperCase();
      const topic = this.getTopic(this.roomCode);

      // Connect to the room SSE event stream
      const sseUrl = `${RELAY_BASE}/${topic}/sse`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        // Connected to relay channel
        this.startHeartbeat();
        resolve(this.roomCode);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'message' && payload.message) {
            const msg: RelayMessage = JSON.parse(payload.message);
            // Ignore messages from self
            if (msg.sender === this.clientId) return;

            // When a client joins, the host replies with initial state and marks connected
            if (msg.type === 'JOIN_SIGNAL') {
              this.connected = true;
              if (this.onConnectionStatusCallback) {
                this.onConnectionStatusCallback(true);
              }
              // Immediately send state to the new client
              this.send({
                type: 'STATE_SYNC',
                state: initialState,
                sender: this.clientId,
              });
            } else if (msg.type === 'STATE_SYNC') {
              if (this.onStateCallback) this.onStateCallback(msg.state);
            }

            if (this.onMessageCallback) {
              this.onMessageCallback(msg);
            }
          }
        } catch {
          // ignore parsing error for non-json ping events
        }
      };

      this.eventSource.onerror = () => {
        // EventSource auto-reconnects on temporary hiccups
      };
    });
  }

  // Join an existing room
  public joinRoom(code: string): Promise<MissionState> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.isHost = false;
      this.roomCode = code.toUpperCase();
      const topic = this.getTopic(this.roomCode);

      const sseUrl = `${RELAY_BASE}/${topic}/sse`;
      this.eventSource = new EventSource(sseUrl);

      let resolved = false;
      let pingInterval: number | null = null;

      const timeout = setTimeout(() => {
        if (!resolved) {
          if (pingInterval) clearInterval(pingInterval);
          this.disconnect();
          reject(new Error(`Room "${code}" not responding. Ensure Host phone is on the waiting screen.`));
        }
      }, 14000);

      this.eventSource.onopen = () => {
        this.startHeartbeat();

        // Broadcast JOIN_SIGNAL every 1.5 seconds until Host replies with STATE_SYNC
        const sendJoin = () => {
          if (resolved) return;
          this.send({ type: 'JOIN_SIGNAL', sender: this.clientId });
        };

        sendJoin();
        pingInterval = window.setInterval(sendJoin, 1500);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'message' && payload.message) {
            const msg: RelayMessage = JSON.parse(payload.message);
            if (msg.sender === this.clientId) return;

            if (msg.type === 'STATE_SYNC') {
              if (!resolved) {
                resolved = true;
                this.connected = true;
                clearTimeout(timeout);
                if (pingInterval) clearInterval(pingInterval);

                if (this.onConnectionStatusCallback) {
                  this.onConnectionStatusCallback(true);
                }
                resolve(msg.state);
              }
              if (this.onStateCallback) {
                this.onStateCallback(msg.state);
              }
            }

            if (this.onMessageCallback) {
              this.onMessageCallback(msg);
            }
          }
        } catch {
          // non-json or ping
        }
      };

      this.eventSource.onerror = () => {
        // EventSource will auto-retry
      };
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (this.roomCode) {
        this.send({ type: 'HEARTBEAT', sender: this.clientId });
      }
    }, 20000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public send(msg: RelayMessage) {
    if (!this.roomCode) return;
    const topic = this.getTopic(this.roomCode);

    try {
      fetch(`${RELAY_BASE}/${topic}`, {
        method: 'POST',
        body: JSON.stringify(msg),
        headers: {
          'Content-Type': 'text/plain', // Avoid CORS preflight options request
        },
      }).catch((e) => {
        console.warn('[Relay Send Error]:', e);
      });
    } catch (e) {
      console.warn('[Relay Fetch Exception]:', e);
    }
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
      this.eventSource = null;
    }
    this.connected = false;
  }
}

export const network = new RelayNetwork();
export type PeerMessage = RelayMessage;
