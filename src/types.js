const types = {};
const config = {
  checkExisting: true
};

export function add(name) {
  types[name] = true;
}

export function remove(name) {
  types[name] = false;
}

export function has(name) {
  return !!types[name];
}

export function check(name) {
  if (config.checkExisting && has(name)) {
    throw new TypeError(`Duplicate action type: ${name}`);
  }
}

export function all() {
  return Object.keys(types).filter(has);
}

export function clear() {
  all().forEach(remove);
}

export function enableChecking() {
  config.checkExisting = true;
}

export function disableChecking() {
  config.checkExisting = false;
}
