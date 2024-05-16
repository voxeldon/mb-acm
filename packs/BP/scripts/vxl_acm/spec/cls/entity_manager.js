import { world, system } from '@minecraft/server';
import { SDB } from './db';
/**
 * Manages entities, tracking their existence and state changes.
 */
class EntityManager {
    /**
     * Creates an instance of EntityManager.
     * @param typeId {string} - The type ID of entities this manager is responsible for.
     * @param oneshot {{ deleteOneShot: (entityId: string) => void }} - An optional object with a method to handle one-shot actions for entities.
     */
    constructor(typeIds, packId, oneshot) {
        this.ACTIVE_ENTITIES = new Map();
        this.typeIds = typeIds;
        this.oneshot = oneshot;
        this.packId = packId;
        this.run();
    }
    /**
     * Loads entities from the database and populates the active entities map.
     * @private
     */
    loadData() {
        try {
            if (this.ACTIVE_ENTITIES.size === 0) {
                const saved_entities = SDB.getArray(this.packId, "active_entities");
                if (!saved_entities)
                    return;
                for (let id of saved_entities) {
                    const entity = world.getEntity(id);
                    if (entity)
                        this.ACTIVE_ENTITIES.set(id, entity);
                }
            }
        }
        catch (error) {
            console.warn(`EntityManager: Error loading memory in ${this.packId}`);
        }
    }
    /**
     * Saves the current state of active entities to the database.
     * @private
     */
    saveData() {
        let entitiesToSave = [];
        for (let [id, entity] of this.ACTIVE_ENTITIES) {
            entitiesToSave.push(entity.id);
        }
        SDB.setArray(this.packId, "active_entities", entitiesToSave);
    }
    /**
    * Initializes event listeners to track entity events and update the active entities map accordingly.
    * @private
    */
    run() {
        this.loadData();
        world.afterEvents.entitySpawn.subscribe((event) => {
            if (!this.typeIds.includes(event.entity.typeId))
                return;
            this.ACTIVE_ENTITIES.set(event.entity.id, event.entity);
            try {
                event.entity.addTag(event.entity.id);
            }
            catch (error) { }
            this.saveData();
        });
        world.afterEvents.entityLoad.subscribe((event) => {
            if (!this.typeIds.includes(event.entity.typeId))
                return;
            this.ACTIVE_ENTITIES.set(event.entity.id, event.entity);
            try {
                event.entity.addTag(event.entity.id);
            }
            catch (error) { }
            this.saveData();
        });
        world.afterEvents.entityDie.subscribe((event) => {
            var _a;
            if (!this.typeIds.includes(event.deadEntity.typeId))
                return;
            this.ACTIVE_ENTITIES.delete(event.deadEntity.id);
            (_a = this.oneshot) === null || _a === void 0 ? void 0 : _a.deleteOneShot(event.deadEntity.id);
            this.saveData();
        });
        world.afterEvents.entityRemove.subscribe((event) => {
            var _a;
            if (!this.typeIds.includes(event.removedEntityId))
                return;
            this.ACTIVE_ENTITIES.delete(event.removedEntityId);
            (_a = this.oneshot) === null || _a === void 0 ? void 0 : _a.deleteOneShot(event.removedEntityId);
            this.saveData();
        });
    }
    /**
     * Executes a callback function for each active entity at a specified interval.
     * @param _func {(context: { entity: Entity }) => void} - The function to execute for each entity, receiving the entity as an argument.
     * @param delayInterval {number} - The interval in ticks between each execution of the function.
     */
    forEntity(_func, delayInterval) {
        system.runInterval(() => {
            for (let [id, entity] of this.ACTIVE_ENTITIES) {
                _func({ entity });
            }
        }, delayInterval);
    }
}
export { EntityManager };
