class ItemLoreHandler {
    constructor(lore_index = [["ss_df:ace_spawn_egg", ["§2Hatchling tameable using: Porkchop"]]]) {
        this.loreMap = new Map(lore_index);
    }
    processesItemLore(player) {
        const inventoryComponent = player.getComponent("inventory");
        const playerContainer = inventoryComponent === null || inventoryComponent === void 0 ? void 0 : inventoryComponent.container;
        if (!playerContainer)
            return;
        const itemsToUpdate = [];
        for (let i = 0; i < playerContainer.size; i++) {
            const item = playerContainer.getItem(i);
            if (!item || item.getLore().length !== 0)
                continue;
            const itemLore = this.loreMap.get(item.typeId);
            if (itemLore) {
                item.setLore(itemLore);
                itemsToUpdate.push({ slot: i, item });
            }
        }
        itemsToUpdate.forEach(({ slot, item }) => playerContainer.setItem(slot, item));
    }
}
export { ItemLoreHandler };
