import escapeRegExp = require("lodash/escapeRegExp");
import isNumber = require("lodash/isNumber");

export const generateUid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, value => {
    const r = Math.random() * 16 | 0;
    const v = value === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const replaceAll = (find: string, replace: string, str: string): string | number => {
  let replacedValue;
  let initialValue = "" + str;
  while (true) {
    replacedValue = initialValue.replace(new RegExp(escapeRegExp("" + find), "g"), replace);
    if (replacedValue !== initialValue) {
      initialValue = replacedValue;
    } else {
      break;
    }
  }
  return isNumber(str) ? +replacedValue : replacedValue;
};
