export enum NamedEventType {
    APPLY_FILTER = "apply-filter",
    EDIT_SITE = "editSite",
    IMAGE_CROP = "image-crop",
    MARKDOWN_CONTENT_CHANGED = "markdownContentChanged",
    MARKDOWN_CONTENT_DELETED = "markdownContentDeleted",
    MARKDOWN_CONTENT_SAVED = "markdownContentSaved",
    MEETUP_DEFAULT_CONTENT_CHANGED = "meetupContentChanged",
    MEMBER_LOGIN_COMPLETE = "memberLoginComplete",
    MEMBER_LOGOUT_COMPLETE = "memberLogoutComplete",
    REFRESH = "refresh",
    SHOW_PAGINATION = "show-pagination",
    WALK_SAVED = "walkSaved",
    WALK_SLOTS_CREATED = "walkSlotsCreated",
}

export class NamedEvent {
    static named(name: any): NamedEvent {
        return new NamedEvent(name);
    }

    constructor(public name: any, public data?: any) {
    }

    static withData(key: NamedEventType, value: any) {
        return new NamedEvent(key, value);
    }
}
