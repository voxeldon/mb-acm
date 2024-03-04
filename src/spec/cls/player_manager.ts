import { world, Player } from '@minecraft/server';

class PlayerManager {
    public players: Player[];

    constructor() {
        this.players = [];
    }

    run() {
        world.afterEvents.playerJoin.subscribe(({ playerId }) => {
            const playerEntity = world.getEntity(playerId) as Player;
            if (playerEntity) {
                this.players.push(playerEntity);
            }
        });

        world.beforeEvents.playerLeave.subscribe(({ player }) => {
            this.players = this.players.filter(p => p.id !== player.id);
        });
    }
}

export {PlayerManager}
