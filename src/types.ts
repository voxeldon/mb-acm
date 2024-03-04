type WorldData = {
    id: string;
    scores: { key: string; value: number }[];
};

type AddonData = {
    id: string;
    meta: {
        team_name: string;
        pack_name: string;
    };
    settings: {
        key: string;
        name: string;
        type: string;
        value: number;
    }[];
};

export { WorldData, AddonData }