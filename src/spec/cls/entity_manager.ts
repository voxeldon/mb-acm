import { world, system } from '@minecraft/server';
import { SDB } from './db';
import { Entity, EntitySpawnAfterEvent, EntityDieAfterEvent, EntityRemoveAfterEvent, EntityLoadAfterEvent } from '@minecraft/server';

/**
 * Manages entities, tracking their existence and state changes.
 */
class EntityManager {
    private ACTIVE_ENTITIES: Map<string, Entity>;
    private typeId: string;
    private packId: string;
    private oneshot?: { deleteOneShot: (entityId: string) => void };

    /**
     * Creates an instance of EntityManager.
     * @param typeId {string} - The type ID of entities this manager is responsible for.
     * @param oneshot {{ deleteOneShot: (entityId: string) => void }} - An optional object with a method to handle one-shot actions for entities.
     */
    constructor(typeId: string, packId: string, oneshot?: { deleteOneShot: (entityId: string) => void }) {
        this.ACTIVE_ENTITIES = new Map<string, Entity>();
        this.typeId = typeId;
        this.oneshot = oneshot;
        this.packId = packId
        this.#run();
    }

    /**
     * Loads entities from the database and populates the active entities map.
     * @private
     */
    #loadData(): void {
        if (this.ACTIVE_ENTITIES.size === 0) {
            const db = new SDB();
            const saved_entities: string[] | null = db.getArray(this.packId, "active_entities");
            if (!saved_entities) return;
            for (let id of saved_entities) {
                const entity = world.getEntity(id);
                if (entity) {
                    this.ACTIVE_ENTITIES.set(id, entity);
                }
            }
        }
    }

    /**
     * Saves the current state of active entities to the database.
     * @private
     */
    #saveData(): void {
        let entitiesToSave: string[] = [];
        for (let [id, entity] of this.ACTIVE_ENTITIES) {
            entitiesToSave.push(entity.id);
        }
        const db = new SDB();
        db.setArray(this.packId, "active_entities", entitiesToSave);
    }

     /**
     * Initializes event listeners to track entity events and update the active entities map accordingly.
     * @private
     */
    #run(): void {
        this.#loadData();

        world.afterEvents.entitySpawn.subscribe((event: EntitySpawnAfterEvent) => {
            if (event.entity.typeId !== this.typeId) return;
            this.ACTIVE_ENTITIES.set(event.entity.id, event.entity);
            event.entity.addTag(event.entity.id)
            this.#saveData();
        });

        world.afterEvents.entityLoad.subscribe((event: EntityLoadAfterEvent) => {
            if (event.entity.typeId !== this.typeId) return;
            this.ACTIVE_ENTITIES.set(event.entity.id, event.entity);
            event.entity.addTag(event.entity.id)
            this.#saveData();
        });

        world.afterEvents.entityDie.subscribe((event: EntityDieAfterEvent) => {
            if (event.deadEntity.typeId !== this.typeId) return;
            this.ACTIVE_ENTITIES.delete(event.deadEntity.id);
            this.oneshot?.deleteOneShot(event.deadEntity.id);
            this.#saveData();
        });

        world.afterEvents.entityRemove.subscribe((event: EntityRemoveAfterEvent) => {
            if (event.removedEntityId !== this.typeId) return;
            this.ACTIVE_ENTITIES.delete(event.removedEntityId);
            this.oneshot?.deleteOneShot(event.removedEntityId);
            this.#saveData();
        });
    }

    /**
     * Executes a callback function for each active entity at a specified interval.
     * @param _func {(context: { entity: Entity }) => void} - The function to execute for each entity, receiving the entity as an argument.
     * @param delayInterval {number} - The interval in ticks between each execution of the function.
     */
    forEntity(_func: (context: { entity: Entity }) => void, delayInterval: number): void {
        system.runInterval(() => {
            for (let [id, entity] of this.ACTIVE_ENTITIES) {
                _func({ entity });
            }
        }, delayInterval);
    }
}

export { EntityManager };
