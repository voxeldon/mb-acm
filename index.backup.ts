import { cls, RawText } from './spec/lib';
import { WorldData, AddonData } from './types';
import { system, TicksPerSecond, world } from '@minecraft/server';
import { ConfigurationUiManager } from './ui_manager';

const DATA_PREFIX = "acm";
const GAME_TOOL = "acm:tool";
const INIT_DELAY = 10;

class AddonConfigurationManager {
    private DB = new cls.ADB();
    private addonData: AddonData[] = [];

    public async initialize() {
        world.sendMessage(RawText.TRANSLATE(`acm.initialize_start`))
        this.addonData = await this.loadAddonData();
        this.registerEventHandlers();
        this.print_load_list(this.addonData);
    }

    private async loadAddonData(): Promise<AddonData[]> {
        const worldData = await this.get_world_data(); // Use await here
        return this.parse_addon_data(worldData);
    }
    

    private registerEventHandlers() {
        world.afterEvents.itemUse.subscribe(event => {
            if (event.itemStack.typeId !== GAME_TOOL || !this.addonData) return; 
            const UiManager = new ConfigurationUiManager(event.source, this.addonData);
            UiManager.handle_form();
        });
    }
    
    private print_load_list(addonData: AddonData[]): void {
        let rawMessage = RawText.MESSAGE(RawText.TRANSLATE("acm.header"),RawText.TEXT("\n\n"));
        addonData.forEach(addon => {
            const packName = addon.meta.pack_name;
            rawMessage = RawText.MESSAGE(
                rawMessage,
                RawText.TRANSLATE("acm.loaded_addon"),
                RawText.TRANSLATE(`${DATA_PREFIX}.${addon.meta.team_name}.${packName}`),
                RawText.TEXT("\n\n")
            );
        });
        world.sendMessage(rawMessage);
    }

    private async get_world_data(): Promise<WorldData[]> {
        const worldData = await this.DB.getAllDB(); 
        if (!worldData) return [];
    
        const fetchScorePromises = worldData
            .filter(scoreboard => scoreboard.displayName.startsWith(DATA_PREFIX))
            .map(async scoreboard => ({
                id: scoreboard.displayName,
                scores: await this.DB.getAllKeys(scoreboard.displayName)
            }));
    
        return Promise.all(fetchScorePromises); // Wait for all score fetching to complete in parallel
    }

    private parse_addon_data(data: WorldData[]): AddonData[] {
        return data.map(item => {
            const parts = item.id.split('.');
            const teamName = parts[1];
            const packName = parts[2];

            const settings = item.scores.map(score => {
                const keyParts = score.key.match(/(.*?)\((.*?)\)/);
                return {
                    key: score.key,
                    name: keyParts ? keyParts[1] : score.key,
                    type: keyParts ? keyParts[2] : '',
                    value: score.value
                };
            });

            return {
                id: item.id,
                meta: {
                    team_name: teamName,
                    pack_name: packName
                },
                settings
            };
        });
    }
}

const addonConfigManager = new AddonConfigurationManager();

system.runTimeout(async()=>{
    await addonConfigManager.initialize()
}, TicksPerSecond * INIT_DELAY)
