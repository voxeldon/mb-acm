var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cls, SDB } from './spec/lib';
import { LANG_KEY } from './global';
const DATA_PREFIX = "acm";
class ConfigurationUiManager {
    constructor(addonData) {
        this.addonData = addonData;
    }
    handle_form(player) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionForm = this.createActionForm();
            this.addonData.forEach(addon => this.createButtonForAddon(actionForm, addon));
            this.showActionFormToPlayer(actionForm, player);
        });
    }
    createActionForm() {
        const actionForm = new cls.ActionForm();
        actionForm.setTitle(LANG_KEY.MENU_HEADER).setBody(LANG_KEY.MENU_BODY);
        return actionForm;
    }
    createButtonForAddon(actionForm, addon) {
        const { pack_name: packName, team_name: teamName } = addon.meta;
        const iconPath = `_${DATA_PREFIX}/${teamName}/${packName}/pack_icon.png`;
        const buttonLabel = `${DATA_PREFIX}.${teamName}.${packName}`;
        actionForm.addButton(buttonLabel, iconPath);
    }
    showActionFormToPlayer(actionForm, player) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield actionForm.show(player);
            if (result.type === 'selected') {
                const selectedAddon = this.addonData[result.selection];
                this.generate_modal_form(player, selectedAddon);
            }
        });
    }
    generate_modal_form(player, addon) {
        if (!player || !addon)
            return;
        const modalForm = new cls.ModalForm();
        const formTitle = `${DATA_PREFIX}.${addon.meta.team_name}.${addon.meta.pack_name}`;
        modalForm.setTitle(formTitle);
        addon.settings.forEach(setting => {
            const settingLabel = `${formTitle}.${setting.name}`;
            if (setting.type === 'bool') {
                modalForm.addToggle(settingLabel, setting.value !== 0);
            }
            else if (setting.type.startsWith('range')) {
                const rangeData = setting.type.replace('range', '').replace('[', '').replace(']', ''); // maybe handle split parsing in inital data set
                const split = rangeData.split(',').map(Number);
                const min = split[0];
                const max = split[1];
                const step = split[2];
                modalForm.addSlider(settingLabel, min, max, step, setting.value);
            }
            else if (setting.type.startsWith('choice')) {
                const options = setting.type.replace('choice[', '').replace(']', '').split(',').map(option => option.trim());
                const defaultValueIndex = Math.max(0, Math.min(options.length - 1, setting.value));
                modalForm.addDropdown(settingLabel, options, defaultValueIndex);
            }
            else if (setting.type.startsWith('input')) {
                modalForm.addTextField(settingLabel, this.getInputField(setting.key));
            }
        });
        modalForm.show(player).then(result => {
            if (result.type === 'submitted') {
                result.values.forEach((value, index) => {
                    const setting = addon.settings[index];
                    const key = `${setting.key}`;
                    if (typeof value === "string") {
                        SDB.removeKey(addon.id, key);
                        const newKey = this.parseInputField(key, value);
                        setting.key = newKey;
                        SDB.setKey(addon.id, newKey, 0);
                        return;
                    }
                    const valueToUpdate = typeof value === "boolean" ? (value ? 1 : 0) : value;
                    SDB.setKey(addon.id, key, valueToUpdate);
                    setting.value = valueToUpdate;
                });
            }
        });
    }
    parseInputField(key, value) {
        const originalText = key.replace(/\([^)]*\)/, '');
        const newText = `${originalText}(input[${value}])`;
        return newText;
    }
    getInputField(key) {
        const match = key.match(/\[([^]+)\]/);
        const extractedText = match ? match[1] : '';
        return extractedText;
    }
}
export { ConfigurationUiManager };
