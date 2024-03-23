import { cls, RawText, SDB } from './spec/lib';
import { AddonData, LANG_KEY } from './global';
import { Player } from '@minecraft/server';

const DATA_PREFIX = "acm";

class ConfigurationUiManager {
    private addonData: AddonData[];

    constructor(addonData: AddonData[]) {
        this.addonData = addonData;
    }

    public async handle_form(player: Player) {
        const actionForm = this.createActionForm();
        this.addonData.forEach(addon => this.createButtonForAddon(actionForm, addon));
        this.showActionFormToPlayer(actionForm, player);
    }

    private createActionForm(): cls.ActionForm {
        const actionForm = new cls.ActionForm();
        actionForm.setTitle(LANG_KEY.MENU_HEADER).setBody(LANG_KEY.MENU_BODY);
        return actionForm;
    }

    private createButtonForAddon(actionForm: cls.ActionForm, addon: AddonData): void {
        const { pack_name: packName, team_name: teamName } = addon.meta;
        const iconPath = `_${DATA_PREFIX}/${teamName}/${packName}/pack_icon.png`;
        const buttonLabel = `${DATA_PREFIX}.${teamName}.${packName}`;
        actionForm.addButton(buttonLabel, iconPath);
    }

    private async showActionFormToPlayer(actionForm: cls.ActionForm, player: Player) {
        const result = await actionForm.show(player);
        if (result.type === 'selected') {
            const selectedAddon = this.addonData[result.selection];
            this.generate_modal_form(player, selectedAddon);
        }
    }

    public generate_modal_form(player: Player, addon: AddonData) {
        if (!player || !addon) return;
    
        const modalForm = new cls.ModalForm();
        const formTitle = addon.id;
        modalForm.setTitle(formTitle);
    
        addon.settings.forEach(setting => {
            const settingLabel = `${formTitle}.${setting.name}`;
    
            if (setting.type === 'bool') {
                modalForm.addToggle(settingLabel, setting.value !== 0);
            } else if (setting.type.startsWith('range')) {
                const rangeData = setting.type.replace('range', '').replace('[', '').replace(']', ''); 
                const split = rangeData.split(',').map(Number);
                const min = split[0];
                const max = split[1];
                const step = split[2];
                modalForm.addSlider(RawText.TRANSLATE(settingLabel), min, max, step, setting.value);
            } else if (setting.type.startsWith('choice')) {
                const options = setting.type.replace('choice[', '').replace(']', '').split(',').map(option => option.trim());
                const defaultValueIndex = Math.max(0, Math.min(options.length - 1, setting.value));
                modalForm.addDropdown(settingLabel, options, defaultValueIndex);
            } else if (setting.type.startsWith('input')) {
                modalForm.addTextField(settingLabel,this.getInputField(setting.key),this.getInputField(setting.key));
            }
        });
    
        modalForm.show(player).then(result => {
            if (result.type === 'submitted') {
                const resultMapping: { [key: string]: boolean | number | string } = {};
                result.values.forEach((value: boolean | number | string, index: number) => {
                    const setting = addon.settings[index];
                    resultMapping[setting.name] = value;
        
                    if (typeof value === "string") {
                        // Use setting.key instead of the undefined 'key'
                        SDB.removeKey(addon.id, setting.key); // Corrected line
                        const newKey = this.parseInputField(setting.key, value);
                        setting.key = newKey; 
                        SDB.setKey(addon.id, newKey, 0);
                    } else {
                        const valueToUpdate = typeof value === "boolean" ? (value ? 1 : 0) : value;
                        SDB.setKey(addon.id, setting.key, valueToUpdate);
                        setting.value = valueToUpdate;
                    }
                });
        
                player.runCommand(`/scriptevent ${addon.id.replace('acm.', 'acm:')} ${JSON.stringify(resultMapping)}`);
            }
        });
        
    }

    private parseInputField(key: string, value: string): string {
        const originalText = key.replace(/\([^)]*\)/, ''); 
        const newText = `${originalText}(input[${value}])`
    
        return newText
    }

    private getInputField(key: string): string {
        const match = key.match(/\[([^]+)\]/);
        const extractedText = match ? match[1] : ''; 
        return extractedText;
    }    
}

export { ConfigurationUiManager };
