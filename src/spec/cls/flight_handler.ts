import { Player, Entity } from '@minecraft/server';

const PITCH_THRESHOLD = 0.7;
const EFFECT_DURATION = 20;

class FlightHandler {
    private effectTimer: number = 0;

    public handleFlight(player: Player, entity: Entity): void {
        const modifiers = {
            typeId: entity.typeId,
            speed: 16
        };
        const look = player.getViewDirection();
        const playerPitch = Math.round(look.y * 10) / 10;
        const planePitch = playerPitch * 10;

        this.handleEffects(entity, playerPitch, planePitch, modifiers);
    }

    private applyPitchBasedEffects(entity: Entity, playerPitch: number, planePitch: number): void {
        if (playerPitch >= PITCH_THRESHOLD) {
            entity.addEffect('levitation', EFFECT_DURATION, { amplifier: planePitch, showParticles: false });
        } else if (playerPitch > -PITCH_THRESHOLD && playerPitch < PITCH_THRESHOLD) {
            this.handleNeutralPitchEffects(entity);
        } else if (playerPitch <= -PITCH_THRESHOLD) {
            entity.addEffect('slow_falling', EFFECT_DURATION, { amplifier: -planePitch, showParticles: false });
        }
    }

    private applySpeedEffect(entity: Entity, playerPitch: number, modifiers: { typeId: string; speed: number }): void {
        entity.addEffect('speed', EFFECT_DURATION, { amplifier: modifiers.speed * this.getSpeedMultiplier(playerPitch), showParticles: false });
    }

    private handleEffects(entity: Entity, playerPitch: number, planePitch: number, modifiers: { typeId: string; speed: number }): void {
        this.applyPitchBasedEffects(entity, playerPitch, planePitch);
        this.applySpeedEffect(entity, playerPitch, modifiers);
    }

    private handleNeutralPitchEffects(entity: Entity): void {
        if (this.effectTimer < 15) {
            entity.addEffect('levitation', EFFECT_DURATION, { amplifier: 0.1, showParticles: false });
        } else if (this.effectTimer < 40) {
            entity.addEffect('slow_falling', EFFECT_DURATION, { amplifier: 0.1, showParticles: false });
        } else {
            this.effectTimer = 0;
        }
        this.effectTimer++;
    }

    private getSpeedMultiplier(pitch: number): number {
        let multiplier = 1;
        if (pitch > 0) {
            multiplier -= pitch;
        } else if (pitch < 0) {
            multiplier += -pitch;
        }
        return multiplier;
    }
}

export {FlightHandler}