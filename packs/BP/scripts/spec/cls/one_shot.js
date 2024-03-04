/**
 * Manages impulse actions for entities or events.
*/
class OneShot {
    constructor() {
        this.ONESHOT_TRACKER = new Map();
    }
    /**
     * Handles the execution of a impulse action based on a specific condition.
     * If the condition is met and the action has not yet been executed, it will be executed.
     * Once executed, the condition is marked as completed to prevent future executions.
     *
     * @param id {string} - The unique identifier for the entity or event to track.
     * @param condition {string} - The specific condition under which the action should be executed.
     * @param state {boolean} - The current state of the condition. If true, the action may be executed.
     * @param func {() => void} - The action to be executed as a function.
     */
    handleOneShot(id, condition, state, func) {
        if (!this.ONESHOT_TRACKER.has(id)) {
            this.ONESHOT_TRACKER.set(id, {});
        }
        let conditions = this.ONESHOT_TRACKER.get(id);
        if (conditions && state && !conditions[condition]) {
            func();
            conditions[condition] = true;
        }
        else if (conditions && !state) {
            conditions[condition] = false;
        }
    }
    /**
     * Deletes the tracking record for a impulse action associated with a given ID.
     * This effectively resets the impulse action, allowing it to be executed again if conditions are met.
     *
     * @param oneShotId {string} - The unique identifier for the entity or event whose impulse action should be reset.
     */
    deleteOneShot(oneShotId) {
        if (!this.ONESHOT_TRACKER.has(oneShotId))
            return;
        console.warn(`removed ${oneShotId} from mem`);
        this.ONESHOT_TRACKER.delete(oneShotId);
    }
}
export { OneShot };
