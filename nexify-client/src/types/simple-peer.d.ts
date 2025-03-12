declare module 'simple-peer' {
    interface SimplePeerData {
      type: string;
      sdp?: string;
      candidate?: RTCIceCandidate;
    }
  
    interface SimplePeerConfig {
      initiator?: boolean;
      channelConfig?: object;
      channelName?: string;
      config?: object;
      offerConstraints?: object;
      answerConstraints?: object;
      sdpTransform?: (sdp: string) => string;
      stream?: MediaStream | null;
      streams?: MediaStream[];
      trickle?: boolean;
      allowHalfTrickle?: boolean;
      objectMode?: boolean;
      wrtc?: object;
    }
  
    interface Instance {
      signal(data: string | SimplePeerData): void;
      send(data: string | Uint8Array | ArrayBuffer | Buffer): void;
      addStream(stream: MediaStream): void;
      removeStream(stream: MediaStream): void;
      addTrack(track: MediaStreamTrack, stream: MediaStream): void;
      removeTrack(track: MediaStreamTrack, stream: MediaStream): void;
      destroy(err?: Error): void;
      
      on(event: 'signal', listener: (data: SimplePeerData) => void): this;
      on(event: 'connect', listener: () => void): this;
      on(event: 'data', listener: (data: any) => void): this;
      on(event: 'stream', listener: (stream: MediaStream) => void): this;
      on(event: 'track', listener: (track: MediaStreamTrack, stream: MediaStream) => void): this;
      on(event: 'close', listener: () => void): this;
      on(event: 'error', listener: (err: Error) => void): this;
      on(event: string, listener: Function): this;
      
      once(event: string, listener: Function): this;
      off(event: string, listener: Function): this;
      removeListener(event: string, listener: Function): this;
      
      connected: boolean;
      destroyed: boolean;
    }
  
    function SimplePeer(opts?: SimplePeerConfig): Instance;
    
    namespace SimplePeer {}
    export = SimplePeer;
  }