import { AddonData, LANG_KEY } from './global';
import { cls, RawText } from './spec/lib';
import { ConfigurationUiManager } from './ui_manager';
import { world, system, TicksPerSecond, RawMessage } from '@minecraft/server';
import { RegisterConfigurationData } from './register_config_data';
const GAME_TOOL = "acm:tool";
class AddonConfigurationManager {
    public registeredAddonData: AddonData[] 
    constructor(registeredAddonData: AddonData[]){
        this.registeredAddonData = registeredAddonData;
    }
    private async generateAddonList(): Promise<string[]> {
        const addonList = []
        for (const addonData of this.registeredAddonData) {
            addonList.push(addonData.id);
        } return addonList
    }

    private async generateLoadMessage(): Promise<RawMessage>{
        const addonList = await this.generateAddonList();
        let rawMessage = LANG_KEY.LOAD_MSG_HEADER;
        for (const addonId in addonList) {
            rawMessage = RawText.MESSAGE(
                rawMessage,
                LANG_KEY.ON_ADDON_LOADED,
                RawText.TRANSLATE(addonList[addonId]),
                LANG_KEY.NEW_LINE
            );
            
        }
        return rawMessage
        
    }

    private async registerEventHandlers() {
        world.afterEvents.itemUse.subscribe(event => {
            if (event.itemStack.typeId !== GAME_TOOL || !this.registeredAddonData) return; 
            const UiManager = new ConfigurationUiManager(event.source, this.registeredAddonData);
            UiManager.handle_form();
        });
    }

    public async run(){
        const addonMessage = await this.generateLoadMessage();
        world.sendMessage(addonMessage);
        await this.registerEventHandlers()
        
    }
}

system.runTimeout(async()=>{
    
    const registeredAddonData: AddonData[] = await RegisterConfigurationData.init()
    const ACM = new AddonConfigurationManager(registeredAddonData);
    await ACM.run();
}, TicksPerSecond * 10);
world.sendMessage(LANG_KEY.ON_START);