import { system, TicksPerSecond } from '@minecraft/server';

class DeltaTime {
    private lastUpdateTime: number;
    private accumulatedTicks: number = 0;
    private updateThreshold: number = 20; // Update every 20 ticks (1 second if 20 ticks per second)

    constructor() {
        this.lastUpdateTime = system.currentTick;
        this.scheduleUpdate();
    }

    private scheduleUpdate(): void {
        system.runTimeout(() => {
            const currentTime = system.currentTick;
            this.accumulatedTicks += 1;

            if (this.accumulatedTicks >= this.updateThreshold) {
                this.lastUpdateTime = currentTime;
                this.accumulatedTicks = 0; // Reset accumulated ticks
            }

            this.scheduleUpdate(); // Reschedule the next update
        }, 1); // Check every tick, but only update at the threshold
    }

    get Delta(): number {
        const currentTime = system.currentTick;
        const deltaTime = (currentTime - this.lastUpdateTime) / TicksPerSecond;
        return deltaTime;
    }
}

const globalDeltaTimeInstance = new DeltaTime();

function getDelta(): number {
    return globalDeltaTimeInstance.Delta;
}

export const delta: () => number = getDelta;
