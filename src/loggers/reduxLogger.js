import batch from '../batch';

const batchType = batch.getType();

export function actionTransformer(action) {
  if (action && action.type === batchType) {
    action.payload.type = batchType;
    return action.payload;
  }
  return action;
}

export const logger = {};

for (const level in console) {
  if (typeof console[level] === 'function') {
    logger[level] = function levelFn(...args) {
      const lastArg = args.pop();

      if (Array.isArray(lastArg) && lastArg.type === batchType) {
        lastArg.forEach(action => {
          console[level].apply(console, [...args, action]);
        });
      } else {
        args.push(lastArg);
        console[level].apply(console, args);
      }
    };
  }
}
