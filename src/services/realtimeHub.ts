type EventCallback = (data: any) => void;

class RealtimeHub {
  private listeners: Record<string, EventCallback[]> = {};
  private isConnected: boolean = false;
  private timer: any = null;

  constructor() {
    this.startSimulation();
  }

  public subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  public publish(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  public getConnectionStatus() {
    return {
      connected: true,
      transport: 'SignalR WebSockets (Simulated)',
      serverTime: new Date().toISOString()
    };
  }

  private startSimulation() {
    this.isConnected = true;
    let tick = 0;
    this.timer = setInterval(() => {
      tick++;
      // Emit simulated pipeline heartbeat every 5 seconds
      if (tick % 5 === 0) {
        this.publish('RunProgressUpdate', {
          runId: 'REC-20260919',
          progressPercent: Math.min(100, +(72 + (tick * 0.2) % 25).toFixed(1)),
          completedSchools: 107 + (tick % 5),
          totalSchools: 148,
          activeStage: 'Reconciliation'
        });
      }

      // Emit live school activity update
      if (tick % 4 === 0) {
        const schools = ['ABC School', 'DPS School', 'XYZ School', 'Uttara Model', 'Milestone College'];
        const stages = ['Downloading', 'Validating', 'Reconciling', 'Logging in', 'Comparing records'];
        const randomSchool = schools[Math.floor(Math.random() * schools.length)];
        const randomStage = stages[Math.floor(Math.random() * stages.length)];

        this.publish('SchoolJobProgress', {
          schoolName: randomSchool,
          action: randomStage,
          elapsedSeconds: Math.floor(Math.random() * 90) + 5
        });
      }
    }, 1000);
  }
}

export const realtimeHub = new RealtimeHub();
