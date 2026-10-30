// P2P Multiplayer Networking Service for Operation: CrossTalk
import Peer, { type DataConnection } from 'peerjs';
import type { MissionState } from './gameEngine';

export type GameRole = 'operative' | 'analyst';

export type PeerMessage =
  | { type: 'STATE_SYNC'; state: MissionState }
  | { type: 'STRIKE_EVENT'; strikes: number }
  | { type: 'SOLVED_EVENT'; moduleName: string }
  | { type: 'ROLE_SWAP' }
  | { type: 'PING' };

// High-reliability STUN & TURN configuration
export const PEER_CONFIG = {
  debug: 2,
  config: {
    iceServers: [
      // Standard STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
      // OpenRelay Public TURN (UDP & TCP fallback)
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
  },
};

export class MultiplayerNetwork {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  public isHost: boolean = false;
  public roomCode: string = '';
  public connected: boolean = false;

  private onStateCallback: ((state: MissionState) => void) | null = null;
  private onMessageCallback: ((msg: PeerMessage) => void) | null = null;
  private onConnectionStatusCallback: ((connected: boolean) => void) | null = null;

  public initialize(
    onState: (state: MissionState) => void,
    onMessage: (msg: PeerMessage) => void,
    onStatus: (connected: boolean) => void
  ) {
    this.onStateCallback = onState;
    this.onMessageCallback = onMessage;
    this.onConnectionStatusCallback = onStatus;
  }

  // Host a new room with a 5-letter code
  public createRoom(code: string, initialState: MissionState): Promise<string> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.isHost = true;
      this.roomCode = code.toUpperCase();
      const peerId = `crosstalk-v1-${this.roomCode}`;

      try {
        this.peer = new Peer(peerId, PEER_CONFIG);

        let opened = false;
        const timeout = setTimeout(() => {
          if (!opened) {
            reject(new Error('Room server timed out. Check connection.'));
          }
        }, 12000);

        this.peer.on('open', (id) => {
          opened = true;
          clearTimeout(timeout);
          resolve(id);
        });

        this.peer.on('connection', (connection) => {
          this.conn = connection;
          this.setupConnection(() => {
            // Send state on link established
            this.send({ type: 'STATE_SYNC', state: initialState });
            // Send again after brief tick to ensure non-dropped packet
            setTimeout(() => {
              this.send({ type: 'STATE_SYNC', state: initialState });
            }, 500);
          });
        });

        this.peer.on('error', (err) => {
          clearTimeout(timeout);
          console.error('[PeerJS Host Error]:', err);
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  // Join an existing room
  public joinRoom(code: string): Promise<MissionState> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.isHost = false;
      this.roomCode = code.toUpperCase();
      const targetHostId = `crosstalk-v1-${this.roomCode}`;

      try {
        this.peer = new Peer(PEER_CONFIG);

        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            this.disconnect();
            reject(new Error('Could not reach Host. Verify code and cellular data.'));
          }
        }, 15000);

        this.peer.on('open', () => {
          const connection = this.peer!.connect(targetHostId, {
            reliable: true,
          });
          this.conn = connection;

          this.setupConnection();

          // Wait for first STATE_SYNC message from host to confirm actual data flow
          const stateListener = (msg: PeerMessage) => {
            if (msg.type === 'STATE_SYNC' && !resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve(msg.state);
            }
          };

          const prevMsgCallback = this.onMessageCallback;
          this.onMessageCallback = (msg: PeerMessage) => {
            stateListener(msg);
            if (prevMsgCallback) prevMsgCallback(msg);
          };

          connection.on('error', (err) => {
            clearTimeout(timeout);
            console.error('[PeerJS Conn Error]:', err);
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          clearTimeout(timeout);
          console.error('[PeerJS Client Error]:', err);
          if (err.type === 'peer-unavailable') {
            reject(new Error(`Room "${code}" not found. Ensure Host phone is on waiting screen.`));
          } else {
            reject(new Error(err.message || 'Connection failure.'));
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private setupConnection(onOpenCallback?: () => void) {
    if (!this.conn) return;

    const handleOpen = () => {
      this.connected = true;
      if (this.onConnectionStatusCallback) {
        this.onConnectionStatusCallback(true);
      }
      if (onOpenCallback) onOpenCallback();
    };

    if (this.conn.open) {
      handleOpen();
    } else {
      this.conn.on('open', handleOpen);
    }

    this.conn.on('data', (data) => {
      const msg = data as PeerMessage;
      if (msg.type === 'STATE_SYNC' && this.onStateCallback) {
        this.onStateCallback(msg.state);
      }
      if (this.onMessageCallback) {
        this.onMessageCallback(msg);
      }
    });

    this.conn.on('close', () => {
      this.connected = false;
      if (this.onConnectionStatusCallback) {
        this.onConnectionStatusCallback(false);
      }
    });

    this.conn.on('error', (err) => {
      console.error('[Connection Data Error]:', err);
    });
  }

  public send(msg: PeerMessage) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(msg);
      } catch (err) {
        console.error('[Send Error]:', err);
      }
    }
  }

  public disconnect() {
    if (this.conn) {
      try {
        this.conn.close();
      } catch {}
      this.conn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
    this.connected = false;
  }
}

export const network = new MultiplayerNetwork();
