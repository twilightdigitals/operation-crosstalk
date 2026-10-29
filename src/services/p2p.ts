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

  // Host a new room with a 4-letter code
  public createRoom(code: string, initialState: MissionState): Promise<string> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.isHost = true;
      this.roomCode = code.toUpperCase();
      const peerId = `crosstalk-v1-${this.roomCode}`;

      try {
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', (id) => {
          resolve(id);
        });

        this.peer.on('connection', (connection) => {
          this.conn = connection;
          this.setupConnection();
          // Send initial state to newly connected client
          setTimeout(() => {
            this.send({ type: 'STATE_SYNC', state: initialState });
          }, 300);
        });

        this.peer.on('error', (err) => {
          // If ID is already taken, reject
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  // Join an existing room
  public joinRoom(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.isHost = false;
      this.roomCode = code.toUpperCase();
      const targetHostId = `crosstalk-v1-${this.roomCode}`;

      try {
        this.peer = new Peer({
          debug: 1,
        });

        this.peer.on('open', () => {
          const connection = this.peer!.connect(targetHostId, { reliable: true });
          this.conn = connection;

          connection.on('open', () => {
            this.setupConnection();
            resolve();
          });

          connection.on('error', (err) => {
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private setupConnection() {
    if (!this.conn) return;

    this.connected = true;
    if (this.onConnectionStatusCallback) {
      this.onConnectionStatusCallback(true);
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
  }

  public send(msg: PeerMessage) {
    if (this.conn && this.conn.open) {
      this.conn.send(msg);
    }
  }

  public disconnect() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connected = false;
  }
}

export const network = new MultiplayerNetwork();
