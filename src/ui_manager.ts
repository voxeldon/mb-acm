import { cls } from './spec/lib';
import { AddonData } from './global';
import { Player, system, TicksPerSecond } from '@minecraft/server';

const DATA_PREFIX = "acm";
const BATCH_SIZE = 5;
const FORM_HEADER = cls.CacheRawText.processes("acm.menu_header");
const FORM_BODY = cls.CacheRawText.processes("acm.menu_body");

class ConfigurationUiManager {
    private DB = new cls.ADB();
    private player: Player;
    private addonData: AddonData[];

    constructor(player: Player, addonData: AddonData[]) {
        this.player = player;
        this.addonData = addonData;
        this.cacheAddonTranslations();
    }

    private cacheAddonTranslations() {
        this.addonData.forEach(addon => {
            const baseKey = `${DATA_PREFIX}.${addon.id}`;
            cls.CacheRawText.processes(baseKey);
            addon.settings.forEach(setting => {
                const settingKey = `${baseKey}.${setting.name}`;
                cls.CacheRawText.processes(settingKey);
            });
        });
    }

    public handle_form() {
        const actionForm = new cls.ActionForm();
        actionForm.setTitle(FORM_HEADER).setBody(FORM_BODY);

        // Define a function to process a batch of addons
        const processBatch = (startIndex: number, batchSize: number) => {
            const endIndex = Math.min(startIndex + batchSize, this.addonData.length);
            const batch = this.addonData.slice(startIndex, endIndex);

            batch.forEach(addon => {
                const { pack_name: packName, team_name: teamName } = addon.meta;
                const iconPath = `_${DATA_PREFIX}/${teamName}/${packName}/pack_icon.png`;
                const buttonLabel = cls.CacheRawText.processes(`${DATA_PREFIX}.${teamName}.${packName}`);
                actionForm.addButton(buttonLabel, iconPath);
            });

            if (endIndex < this.addonData.length) {
                // Schedule the next batch
                system.runTimeout(() => processBatch(endIndex, batchSize), TicksPerSecond * 2); // 10 tick delay
            } else {
                actionForm.show(this.player).then(result => {
                    if (result.type === 'selected') {
                        const selectedAddon = this.addonData[result.selection];
                        this.generate_modal_form(selectedAddon);
                    }
                });
            }
        };

        processBatch(0, BATCH_SIZE);
    }

    public generate_modal_form(addon: AddonData) {
        if (!this.player || !addon) return;

        const modalForm = new cls.ModalForm();
        const formTitleKey = `${DATA_PREFIX}.${addon.meta.team_name}.${addon.meta.pack_name}`;
        modalForm.setTitle(cls.CacheRawText.processes(formTitleKey));

        addon.settings.forEach(setting => {
            const settingKey = `${formTitleKey}.${setting.name}`;
            const settingLabel = cls.CacheRawText.processes(settingKey);

            if (setting.type === 'bool') {
                modalForm.addToggle(settingLabel, setting.value !== 0);
            } else if (setting.type.startsWith('range')) {
                const rangeData = setting.type.replace('range', '').replace('[', '').replace(']', '');// maybe handle split parsing in inital data set
                const split = rangeData.split(',').map(Number);
                const min = split[0];
                const max = split[1];
                const step = split[2];
                modalForm.addSlider(settingLabel, min, max, step, setting.value);
            } else if (setting.type.startsWith('choice')) {
                const options = setting.type.replace('choice[', '').replace(']', '').split(',').map(option => option.trim());
                const defaultValueIndex = Math.max(0, Math.min(options.length - 1, setting.value));
                modalForm.addDropdown(settingLabel, options, defaultValueIndex);
            }
        });

        modalForm.show(this.player).then(result => {
            if (result.type === 'submitted') {
                result.values.forEach((value: boolean | number, index: number) => {
                    const setting = addon.settings[index];
                    const key = `${setting.key}`;
                    const valueToUpdate = typeof value === "boolean" ? (value ? 1 : 0) : value;
                    this.DB.setKey(addon.id, key, valueToUpdate);
                    setting.value = valueToUpdate;
                });
            }
        });
    }
}

export { ConfigurationUiManager };
