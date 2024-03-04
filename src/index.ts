import { cls, RawText } from './spec/lib';
import { WorldData, AddonData } from './types';
import { system, world, Player } from '@minecraft/server';

const DATA_PREFIX: string = "acm";

class AddonConfigurationManager {
    private DB: cls.SDB;

    constructor() {
        this.DB = new cls.SDB();
        this.run();
    }

    private handle_form(player: Player, addonData: AddonData[]) {
        const actionForm = new cls.ActionForm();
        actionForm.setTitle('§l§5ADDON CONFIGURATION MANAGER§r')
                  .setBody('Select an Addon.');
    
        addonData.forEach(addon => {
            const packName = addon.meta.pack_name;
            const iconPath = `_acm/${packName}/pack_icon.png`;
            const buttonLabel = RawText.TRANSLATE(`acm.${addon.meta.team_name}.${packName}`);
            actionForm.addButton(buttonLabel, iconPath);
        });
    
        actionForm.show(player).then(result => {
            if (result.type === 'selected') {
                const selectedAddon = addonData[result.selection];
                this.generate_modal_form(player, selectedAddon);
            } 
        });
    }

    private generate_modal_form(player: Player, addon: AddonData) {
        if (!player || !addon) return;
    
        const modalForm = new cls.ModalForm();
        modalForm.setTitle(RawText.TRANSLATE(`acm.${addon.meta.team_name}.${addon.meta.pack_name}`));
    
        addon.settings.forEach(setting => {
            if (setting.type === 'bool') {
                modalForm.addToggle(RawText.TRANSLATE(`acm.${addon.meta.team_name}.${setting.name}`), setting.value !== 0);
            } else if (setting.type.startsWith('range')) {
                const rangeData = setting.type.replace('range', '').replace('[', '').replace(']', '');
                const split = rangeData.split(',').map(Number); 
        
                const min = split[0]; 
                const max = split[1]; 
                const step = split[2];
        
                modalForm.addSlider(RawText.TRANSLATE(`acm.${addon.meta.team_name}.${setting.name}`), min, max, step, setting.value);
            }
        });
        
    
        modalForm.show(player).then(result => {
            if (result.type === 'submitted') {
                console.warn(`Form submitted with values: ${result.values}`);
            }
        });
    }
    
    
    private print_load_list(addonData: AddonData[]): void {
        let rawMessage = RawText.MESSAGE(RawText.TEXT("§l§6A.C.M§r\n"));
        addonData.forEach(addon => {
            const packName = addon.meta.pack_name;
            rawMessage = RawText.MESSAGE(
                rawMessage,
                RawText.TEXT("§2Loaded:§r "),
                RawText.TRANSLATE(`acm.${addon.meta.team_name}.${packName}`),
                RawText.TEXT("\n\n")
            );
        });
        world.sendMessage(rawMessage);
    }
    

    private run(): void {
        const worldData = this.get_world_data();
        const addonData = this.parse_addon_data(worldData);
        this.print_load_list(addonData);
        system.runInterval(() => {
            const ALL_PLAYERS = world.getAllPlayers();
            ALL_PLAYERS.forEach(player => {
                if(player.isSneaking) this.handle_form(player, addonData)
            });
        }, 0);
    }

    private get_world_data(): WorldData[] {
        const worldData = this.DB.getAllDB();
        if (!worldData) return [];
        const filteredWorldData = worldData.filter(scoreboard => scoreboard.displayName.startsWith(DATA_PREFIX));
        const addonIndex = filteredWorldData.map(scoreboard => {
            return {
                id: scoreboard.displayName,
                scores: this.DB.getAllKeys(scoreboard.displayName)
            };
        });
        return addonIndex;
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

new AddonConfigurationManager();
