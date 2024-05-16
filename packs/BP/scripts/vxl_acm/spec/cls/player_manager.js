import { world } from '@minecraft/server';
class PlayerManager {
    constructor() {
        this.players = [];
    }
    run() {
        world.afterEvents.playerJoin.subscribe(({ playerId }) => {
            const playerEntity = world.getEntity(playerId);
            if (playerEntity) {
                this.players.push(playerEntity);
            }
        });
        world.beforeEvents.playerLeave.subscribe(({ player }) => {
            this.players = this.players.filter(p => p.id !== player.id);
        });
    }
}
export { PlayerManager };
