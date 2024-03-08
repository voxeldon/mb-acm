import { RawText } from "./spec/lib";
const DATA_PREFIX = "acm";
const LANG_KEY = {
    ON_START: RawText.TRANSLATE(`${DATA_PREFIX}.initialize_start`),
    LOAD_MSG_HEADER: RawText.MESSAGE(RawText.TRANSLATE(`${DATA_PREFIX}.header`), RawText.TEXT("\n\n")),
    ON_ADDON_LOADED: RawText.TRANSLATE(`${DATA_PREFIX}.loaded_addon`),
    NEW_LINE: RawText.TEXT("\n\n")
};
export { LANG_KEY, DATA_PREFIX };
