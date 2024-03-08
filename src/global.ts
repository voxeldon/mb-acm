import { RawText } from "./spec/lib";

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

const DATA_PREFIX = "acm";

const LANG_KEY = {
    ON_START: RawText.TRANSLATE(`${DATA_PREFIX}.initialize_start`),
    LOAD_MSG_HEADER: RawText.MESSAGE(RawText.TRANSLATE(`${DATA_PREFIX}.header`),RawText.TEXT("\n\n")),
    ON_ADDON_LOADED: RawText.TRANSLATE(`${DATA_PREFIX}.loaded_addon`),
    NEW_LINE: RawText.TEXT("\n\n")
}

export { AddonData, LANG_KEY, DATA_PREFIX }