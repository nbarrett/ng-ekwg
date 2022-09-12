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
    MENU_TOGGLE = "menu-toggle",
    REFRESH = "refresh",
    SAVE_PAGE_CONTENT = "save-page-content",
    SHOW_PAGINATION = "show-pagination",
    WALK_SAVED = "walkSaved",
    WALK_SLOTS_CREATED = "walk-slots-created",
}

export class NamedEvent<T> {
    static named(name: NamedEventType): NamedEvent<NamedEventType> {
        return new NamedEvent(name);
    }

    constructor(public name: any, public data?: T) {
    }

    static withData<T>(key: NamedEventType, value: T) {
        return new NamedEvent(key, value);
    }
}
