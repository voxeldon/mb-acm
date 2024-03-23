var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LANG_KEY, GAME_TOOL, PACK_ID } from './global';
import { RawText, SDB } from './spec/lib';
import { ConfigurationUiManager } from './ui_manager';
import { world, system } from '@minecraft/server';
import { RegisterConfigurationData } from './register_config_data';
let CONFIG_CONFIG = {
    REQ_OP: false,
    REQ_TAG: false,
    TAG_ID: ""
};
function updateConfigData() {
    const keys = SDB.getAllKeys(PACK_ID);
    const tagIdRegex = /\[(.*?)\]/;
    for (const keyObj of keys) {
        const keyValue = keyObj.key;
        if (keyValue.startsWith('require_')) {
            if (keyValue.startsWith('require_op'))
                CONFIG_CONFIG.REQ_OP = !!keyObj.value;
            if (keyValue.startsWith('require_tag'))
                CONFIG_CONFIG.REQ_TAG = !!keyObj.value;
        }
        else if (keyValue.startsWith('tag_id')) {
            const match = keyValue.match(tagIdRegex);
            if (match && match[1]) {
                CONFIG_CONFIG.TAG_ID = match[1];
            }
        }
    }
}
class AddonConfigurationManager {
    constructor(registeredAddonData) {
        this.registeredAddonData = registeredAddonData;
        this.UiManager = new ConfigurationUiManager(this.registeredAddonData);
    }
    generateAddonList() {
        const addonList = [];
        for (const addonData of this.registeredAddonData) {
            addonList.push(addonData.id);
        }
        return addonList;
    }
    generateLoadMessage() {
        const addonList = this.generateAddonList();
        let rawMessage = LANG_KEY.LOAD_MSG_HEADER;
        for (const addonId in addonList) {
            rawMessage = RawText.MESSAGE(rawMessage, LANG_KEY.ON_ADDON_LOADED, RawText.TRANSLATE(addonList[addonId]), LANG_KEY.NEW_LINE);
        }
        return rawMessage;
    }
    registerEventHandlers() {
        world.afterEvents.itemUse.subscribe(event => {
            if (event.itemStack.typeId !== GAME_TOOL || !this.registeredAddonData)
                return;
            const player = event.source;
            if (CONFIG_CONFIG.REQ_TAG)
                if (!player.hasTag(CONFIG_CONFIG.TAG_ID)) {
                    player.sendMessage(LANG_KEY.INVALID_PERMS);
                    return;
                }
            this.UiManager.handle_form(player);
        });
    }
    sendLoadMessage() {
        const addonMessage = this.generateLoadMessage();
        world.sendMessage(addonMessage);
    }
    run() {
        this.sendLoadMessage();
        this.registerEventHandlers();
    }
}
const itemUse = world.afterEvents.itemUse;
let ACM;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        stagePack();
        itemUse.unsubscribe(run);
        const registeredAddonData = yield RegisterConfigurationData.init();
        ACM = new AddonConfigurationManager(registeredAddonData);
        ACM.run();
        updateConfigData();
    });
}
function stagePack() {
    const localDb = SDB.getDb(PACK_ID);
    if (!localDb) {
        SDB.newDb(PACK_ID);
        SDB.addToKey(PACK_ID, "require_tag(bool)");
        SDB.addToKey(PACK_ID, "tag_id(input)");
    }
    else
        return;
}
function run(event) {
    world.sendMessage(LANG_KEY.ON_START);
    if (event.itemStack.typeId !== GAME_TOOL)
        return;
    init();
}
itemUse.subscribe(run);
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const player = event.sourceEntity;
    if (event.id === 'acm:start') {
        init();
    }
    else if (event.id === 'acm:help') {
        player.sendMessage(LANG_KEY.HELP_MSG);
    }
    else if (event.id === 'acm:tool') {
        player.runCommand('/give @s acm:tool');
    }
    else if (event.id === 'acm:show') {
        ACM.UiManager.handle_form(player);
    }
    else if (event.id === 'acm:vxl.acm_config') {
        //const jsonObject = JSON.parse(event.message); 
        updateConfigData();
    }
});
