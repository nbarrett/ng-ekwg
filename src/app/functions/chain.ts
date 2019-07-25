import map from "lodash-es/map";
import find from "lodash-es/find";
import filter from "lodash-es/filter";
import mapValues from "lodash-es/mapValues";
import toPairs from "lodash-es/toPairs";
import orderBy from "lodash-es/orderBy";
import groupBy from "lodash-es/groupBy";
import sortBy from "lodash-es/sortBy";
import unique from "lodash-es/uniq";

const supportedFunctions = {
  map,
  unique,
  find,
  filter,
  toPairs,
  orderBy,
  groupBy,
  sortBy,
};

export const chain = <T>(input: T) => {
  let value: any = input;
  const wrapper = {
    ...mapValues(
      supportedFunctions,
      (f: any) => (...args) => {
        value = f(value, ...args);
        return wrapper;
      },
    ),
    value: () => value,
  };
  return wrapper;
};
