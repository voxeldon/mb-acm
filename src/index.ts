import { AddonData, LANG_KEY } from './global';
import { RawText } from './spec/lib';
import { ConfigurationUiManager } from './ui_manager';
import { world, RawMessage, Player, ItemUseAfterEvent } from '@minecraft/server';
import { RegisterConfigurationData } from './register_config_data';
const GAME_TOOL = "acm:tool";
class AddonConfigurationManager {
    public registeredAddonData: AddonData[];

    constructor(registeredAddonData: AddonData[]){
        this.registeredAddonData = registeredAddonData;
    }
    
    private generateAddonList(): string[] {
        const addonList = []
        for (const addonData of this.registeredAddonData) {
            addonList.push(addonData.id);
        } return addonList
    }

    private generateLoadMessage(): RawMessage{
        const addonList = this.generateAddonList();
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

    private registerEventHandlers() {
        const UiManager = new ConfigurationUiManager(this.registeredAddonData);
        world.afterEvents.itemUse.subscribe(event => {
            if (event.itemStack.typeId !== GAME_TOOL || !this.registeredAddonData) return;
            UiManager.handle_form(event.source);
            
        });
    }

    private sendLoadMessage(){
        const addonMessage = this.generateLoadMessage();
        world.sendMessage(addonMessage);
    }

    public run(){
        this.sendLoadMessage();
        this.registerEventHandlers();
        
    }
}

async function init(){
    const registeredAddonData: AddonData[] = await RegisterConfigurationData.init()
    const ACM = new AddonConfigurationManager(registeredAddonData);
    ACM.run();
}

const itemUse = world.afterEvents.itemUse

itemUse.subscribe(run);

function run(event: ItemUseAfterEvent){
    world.sendMessage(LANG_KEY.ON_START)
    if (event.itemStack.typeId !== GAME_TOOL) return;
    init();
}