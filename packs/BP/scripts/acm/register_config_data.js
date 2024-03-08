var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cls } from './spec/lib';
import { DATA_PREFIX } from './global';
const DB = new cls.ADB();
class RegisterConfigurationData {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            const validAddons = yield this.registerAddonData();
            const parsedAddons = yield this.parse_addon_data(validAddons);
            return parsedAddons;
        });
    }
    static collectWorldData() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield DB.getAllDB()) || [];
        });
    }
    static registerAddonData() {
        return __awaiter(this, void 0, void 0, function* () {
            const validData = [];
            const worldData = yield this.collectWorldData();
            for (const scoreboard of worldData) {
                if (scoreboard.displayName.startsWith(DATA_PREFIX)) {
                    validData.push(scoreboard);
                }
                else
                    continue;
            }
            return validData;
        });
    }
    static parse_addon_data(validAddons) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (const scoreboard of validAddons) {
                const id = scoreboard.displayName;
                const parts = id.split('.');
                const teamName = parts[1];
                const packName = parts[2];
                const scores = yield DB.getAllKeys(id);
                const settings = scores.map(score => {
                    const keyParts = score.key.match(/(.*?)\((.*?)\)/);
                    return {
                        key: score.key,
                        name: keyParts ? keyParts[1] : score.key,
                        type: keyParts ? keyParts[2] : '',
                        value: score.value
                    };
                });
                const addonData = {
                    id: scoreboard.displayName,
                    meta: {
                        team_name: teamName,
                        pack_name: packName
                    },
                    settings
                };
                results.push(addonData);
            }
            return results;
        });
    }
}
export { RegisterConfigurationData };
