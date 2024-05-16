import { Vector3 } from './vector';
import { world } from '@minecraft/server';
class Projectile {
    constructor(source, bullet, velocity, offset = 1.0) {
        this.source = source;
        this.bullet = bullet;
        this.velocity = velocity;
        this.dimension = world.getDimension(source.dimension.id);
        this.lookDir = source.getViewDirection();
        this.offset = offset;
    }
    fire() {
        try {
            const spawnLocation = this.getSpawnLocation();
            const entity = this.dimension.spawnEntity(this.bullet, spawnLocation);
            entity.applyImpulse(this.getImpulseVector());
            entity.addTag('vxl_proj');
            this.id = entity.id;
        }
        catch (e) {
            console.warn(`ERROR: Can't spawn projectile, ensure it exists in pack.`);
        }
    }
    getId() {
        return this.id;
    }
    getSpawnLocation() {
        const headPos = this.source.getHeadLocation();
        return new Vector3(headPos.x + this.lookDir.x * this.offset, headPos.y + this.lookDir.y * this.offset, headPos.z + this.lookDir.z * this.offset);
    }
    getImpulseVector() {
        return new Vector3(this.lookDir.x * this.velocity, this.lookDir.y * this.velocity, this.lookDir.z * this.velocity);
    }
}
export { Projectile };
