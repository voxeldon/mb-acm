import { cls} from './spec/lib';
import { AddonData, DATA_PREFIX } from './global';
import { ScoreboardObjective} from '@minecraft/server';

const DB = new cls.ADB();

class RegisterConfigurationData {

    public static async init() {
        const validAddons = await this.registerAddonData();
        const parsedAddons: AddonData[] = await this.parse_addon_data(validAddons);
        return parsedAddons;
    }

    private static async collectWorldData(): Promise<ScoreboardObjective[]>{
        return await DB.getAllDB() || [];
    }

    private static async registerAddonData(){
        const validData: ScoreboardObjective[] = [];
        const worldData: ScoreboardObjective[] = await this.collectWorldData();
        for(const scoreboard of worldData) {
            if (scoreboard.displayName.startsWith(DATA_PREFIX)) {
                validData.push(scoreboard)
            } else continue;
        }
        return validData;
    }

    private static async parse_addon_data(validAddons: ScoreboardObjective[]): Promise<AddonData[]> {
        const results: AddonData[] = [];

        for (const scoreboard of validAddons) {
            const id = scoreboard.displayName;
            const parts = id.split('.');
            const teamName = parts[1];
            const packName = parts[2];
            const scores = await DB.getAllKeys(id);

            const settings = scores.map(score => {
                const keyParts = score.key.match(/(.*?)\((.*?)\)/);
                return {
                    key: score.key,
                    name: keyParts ? keyParts[1] : score.key,
                    type: keyParts ? keyParts[2] : '',
                    value: score.value
                };
            });

            const addonData: AddonData = {
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
    }
    
}

export { RegisterConfigurationData }