// Bootstrap module for extension initialization
import { fetchVoices } from "./handlers/voices";
import { resolveBootstrap } from "./state";
import { createContextMenus } from "./utils/context-menus";
import { migrateSyncStorage, setDefaultSettings } from "./utils/storage";

export async function bootstrap(): Promise<void> {
	await migrateSyncStorage();
	await fetchVoices();
	await setDefaultSettings();
	await createContextMenus();
	resolveBootstrap();
}
