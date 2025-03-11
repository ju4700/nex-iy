declare module 'simple-peer' {
    import * as stream from 'stream';
  
    interface SimplePeerOptions {
      initiator?: boolean;
      channelConfig?: object;
      channelName?: string;
      config?: RTCConfiguration;
      offerOptions?: RTCOfferOptions;
      answerOptions?: RTCAnswerOptions;
      sdpTransform?: (sdp: string) => string;
      stream?: MediaStream;
      trickle?: boolean;
      allowHalfTrickle?: boolean;
      objectMode?: boolean;
      wrtc?: object;
    }
  
    interface PeerSignalData {
      type: string;
      sdp?: string;
      candidate?: RTCIceCandidateInit;
    }
  
    interface SimplePeerError extends Error {
      code?: string;
    }
  
    class SimplePeer extends stream.Duplex {
      constructor(opts?: SimplePeerOptions);
      signal(data: string | PeerSignalData): void;
      destroy(err?: Error): void;
      on(event: 'signal', listener: (data: PeerSignalData) => void): this;
      on(event: 'connect', listener: () => void): this;
      on(event: 'data', listener: (data: Buffer | ArrayBuffer | string) => void): this;
      on(event: 'stream', listener: (stream: MediaStream) => void): this;
      on(event: 'track', listener: (track: MediaStreamTrack, stream: MediaStream) => void): this;
      on(event: 'close', listener: () => void): this;
      on(event: 'error', listener: (err: SimplePeerError) => void): this;
      on(event: string, listener: (...args: any[]) => void): this;
      readonly connected: boolean;
      readonly destroyed: boolean;
      readonly _remoteStreams: MediaStream[];
    }
  
    export default SimplePeer;
  }