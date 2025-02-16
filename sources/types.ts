export interface SystemState {
    entropy: number;
    complexity: number;
    emergentClusters: number;
    audioData: {
      bass: number;
      midLow: number;
      midHigh: number;
      treble: number;
    };
  }
  
  export interface InteractionState {
    velocity: number;
    direction: THREE.Vector2;
    acceleration: number;
  }