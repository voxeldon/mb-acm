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
import { world, system, TicksPerSecond } from '@minecraft/server';
import { RegisterConfigurationData } from './register_config_data';
const GAME_TOOL = "acm:tool";
class AddonConfigurationManager {
    constructor(registeredAddonData) {
        this.registeredAddonData = registeredAddonData;
    }
    generateAddonList() {
        return __awaiter(this, void 0, void 0, function* () {
            const addonList = [];
            for (const addonData of this.registeredAddonData) {
                addonList.push(addonData.id);
            }
            return addonList;
        });
    }
    generateLoadMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const addonList = yield this.generateAddonList();
            let rawMessage = LANG_KEY.LOAD_MSG_HEADER;
            for (const addonId in addonList) {
                rawMessage = RawText.MESSAGE(rawMessage, LANG_KEY.ON_ADDON_LOADED, RawText.TRANSLATE(addonList[addonId]), LANG_KEY.NEW_LINE);
            }
            return rawMessage;
        });
    }
    registerEventHandlers() {
        return __awaiter(this, void 0, void 0, function* () {
            world.afterEvents.itemUse.subscribe(event => {
                if (event.itemStack.typeId !== GAME_TOOL || !this.registeredAddonData)
                    return;
                const UiManager = new ConfigurationUiManager(event.source, this.registeredAddonData);
                UiManager.handle_form();
            });
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const addonMessage = yield this.generateLoadMessage();
            world.sendMessage(addonMessage);
            yield this.registerEventHandlers();
        });
    }
}
system.runTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
    const registeredAddonData = yield RegisterConfigurationData.init();
    const ACM = new AddonConfigurationManager(registeredAddonData);
    yield ACM.run();
}), TicksPerSecond * 10);
world.sendMessage(LANG_KEY.ON_START);
