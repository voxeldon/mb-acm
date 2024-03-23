import { AddonData, LANG_KEY,GAME_TOOL, PACK_ID } from './global';
import { RawText, SDB } from './spec/lib';
import { ConfigurationUiManager } from './ui_manager';
import { world, RawMessage, Player, ItemUseAfterEvent, system } from '@minecraft/server';
import { RegisterConfigurationData } from './register_config_data';

let CONFIG_CONFIG = {
    REQ_OP: false,
    REQ_TAG: false,
    TAG_ID: ""
}

function updateConfigData() {
    const keys = SDB.getAllKeys(PACK_ID);
    const tagIdRegex = /\[(.*?)\]/;
    for (const keyObj of keys) {
        const keyValue = keyObj.key;

        if (keyValue.startsWith('require_')) {
            if (keyValue.startsWith('require_op')) CONFIG_CONFIG.REQ_OP = !!keyObj.value;
            if (keyValue.startsWith('require_tag')) CONFIG_CONFIG.REQ_TAG = !!keyObj.value;
        } else if (keyValue.startsWith('tag_id')) {
            const match = keyValue.match(tagIdRegex);
            if (match && match[1]) {
                CONFIG_CONFIG.TAG_ID = match[1];
            }
        }
    }
}

class AddonConfigurationManager {
    public registeredAddonData: AddonData[];
    public UiManager: ConfigurationUiManager;

    constructor(registeredAddonData: AddonData[]){
        this.registeredAddonData = registeredAddonData;
        this.UiManager = new ConfigurationUiManager(this.registeredAddonData)
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
        world.afterEvents.itemUse.subscribe(event => {
            if (event.itemStack.typeId !== GAME_TOOL || !this.registeredAddonData) return;
            const player = event.source as Player;
            if (CONFIG_CONFIG.REQ_TAG) if (!player.hasTag(CONFIG_CONFIG.TAG_ID)) {
                player.sendMessage(LANG_KEY.INVALID_PERMS);
                return;
            }
            this.UiManager.handle_form(player);
            
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

const itemUse = world.afterEvents.itemUse;

let ACM: AddonConfigurationManager

async function init(){
    stagePack();
    itemUse.unsubscribe(run);
    const registeredAddonData: AddonData[] = await RegisterConfigurationData.init();
    ACM = new AddonConfigurationManager(registeredAddonData);
    ACM.run();
    updateConfigData();
}

function stagePack(){
    const localDb = SDB.getDb(PACK_ID);
    if (!localDb) {
        SDB.newDb(PACK_ID);
        SDB.addToKey(PACK_ID,"require_tag(bool)");
        SDB.addToKey(PACK_ID,"tag_id(input)");
    } else return;
}

function run(event: ItemUseAfterEvent){
    world.sendMessage(LANG_KEY.ON_START);
    if (event.itemStack.typeId !== GAME_TOOL) return;
    init();
}

itemUse.subscribe(run);

system.afterEvents.scriptEventReceive.subscribe((event) => {
    const player = event.sourceEntity as Player;
    if (event.id === 'acm:start') {
        init();
    } else if (event.id === 'acm:help') {
        player.sendMessage(LANG_KEY.HELP_MSG);
    } else if (event.id === 'acm:tool') {
        player.runCommand('/give @s acm:tool');
    } else if (event.id === 'acm:show') {
        ACM.UiManager.handle_form(player);
    } else if(event.id === 'acm:vxl.acm_config'){
        //const jsonObject = JSON.parse(event.message); 
        updateConfigData();
    }
    
});

