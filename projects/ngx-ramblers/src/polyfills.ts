/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

import "url-polyfill";
import "core-js/modules/es.array.includes";
import "zone.js";
(window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
(window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
(window as any).__zone_symbol__BLACK_LISTED_EVENTS = ["scroll", "mousemove"];
