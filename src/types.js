const types = {};

export function add(name) {
  types[name] = true;
}

export function remove(name) {
  types[name] = false;
}

export function has(name) {
  return !!types[name];
}

export function all() {
  return Object.keys(types).filter(has);
}

export function clear() {
  all().forEach(remove);
}
