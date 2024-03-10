var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LANG_KEY } from './global';
import { RawText } from './spec/lib';
import { ConfigurationUiManager } from './ui_manager';
import { world } from '@minecraft/server';
import { RegisterConfigurationData } from './register_config_data';
const GAME_TOOL = "acm:tool";
class AddonConfigurationManager {
    constructor(registeredAddonData) {
        this.registeredAddonData = registeredAddonData;
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
        const UiManager = new ConfigurationUiManager(this.registeredAddonData);
        world.afterEvents.itemUse.subscribe(event => {
            if (event.itemStack.typeId !== GAME_TOOL || !this.registeredAddonData)
                return;
            UiManager.handle_form(event.source);
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
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const registeredAddonData = yield RegisterConfigurationData.init();
        const ACM = new AddonConfigurationManager(registeredAddonData);
        ACM.run();
    });
}
const itemUse = world.afterEvents.itemUse;
itemUse.subscribe(run);
function run(event) {
    world.sendMessage(LANG_KEY.ON_START);
    if (event.itemStack.typeId !== GAME_TOOL)
        return;
    init();
}
