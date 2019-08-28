import { StartContacts } from "../ekwg/startContacts";
import { StartWalksAndEventsManager } from "../ekwg/startWalksAndEventsManager";
import { StartWalksProgramme } from "../ekwg/startWalksProgramme";
import { StartRamblersLogin } from "../ramblers/common/startRamblersLogin";

export class Start {

    static onWalksProgramme() {
        return new StartWalksProgramme();
    }

    static onRamblersLoginPage() {
        return new StartRamblersLogin();
    }

    static onContacts() {
        return new StartContacts();
    }

    static onWalksAndEventsManager() {
        return new StartWalksAndEventsManager();
    }

}
