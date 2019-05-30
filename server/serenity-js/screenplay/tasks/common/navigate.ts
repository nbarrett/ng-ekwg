import { Task } from 'serenity-js/lib/screenplay';
import { Open, ResizeBrowserWindow, UseAngular } from 'serenity-js/lib/serenity-protractor';

export const Navigate = { to: (url: string) => Task.where(`#actor navigates to ${url}`,
    UseAngular.disableSynchronisation(),
    ResizeBrowserWindow.toMaximum(),
    Open.browserOn(url),
)};
