import filter from "lodash-es/filter";
import find from "lodash-es/find";
import groupBy from "lodash-es/groupBy";
import map from "lodash-es/map";
import mapValues from "lodash-es/mapValues";
import orderBy from "lodash-es/orderBy";
import reduce from "lodash-es/reduce";
import sortBy from "lodash-es/sortBy";
import toPairs from "lodash-es/toPairs";
import unique from "lodash-es/uniq";

const supportedFunctions = {
  map,
  unique,
  find,
  filter,
  toPairs,
  reduce,
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
