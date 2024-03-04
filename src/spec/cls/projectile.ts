import { Vec3 } from './vector';
import { world, Entity, Dimension, Vector3 } from '@minecraft/server';

class Projectile {
    private source: Entity;
    private bullet: string;
    private velocity: number;
    private dimension: Dimension;
    private lookDir: Vector3;
    private offset: number;
    private id: string | undefined;

    constructor(source: Entity, bullet: string, velocity: number, offset = 1.0) {
        this.source = source;
        this.bullet = bullet;
        this.velocity = velocity;
        this.dimension = world.getDimension(source.dimension.id);
        this.lookDir = source.getViewDirection();
        this.offset = offset;
    }

    fire(): void {
        try {
            const spawnLocation = this.getSpawnLocation();
            const entity = this.dimension.spawnEntity(this.bullet, spawnLocation);
            entity.applyImpulse(this.getImpulseVector());
            entity.addTag('vxl_proj');
            this.id = entity.id;
        } catch (e) {
            console.warn(`ERROR: Can't spawn projectile, ensure it exists in pack.`);
        }
    }

    getId(): string | undefined {
        return this.id;
    }

    private getSpawnLocation(): Vector3 {
        const headPos = this.source.getHeadLocation();
        return new Vec3(
            headPos.x + this.lookDir.x * this.offset,
            headPos.y + this.lookDir.y * this.offset,
            headPos.z + this.lookDir.z * this.offset
        );
    }

    private getImpulseVector(): Vector3 {
        return new Vec3(
            this.lookDir.x * this.velocity,
            this.lookDir.y * this.velocity,
            this.lookDir.z * this.velocity
        );
    }
}

export { Projectile };
