import { ID } from '../constants';
import batch from '../batch';

const batchAction = batch([]);
const batchId = batchAction[ID];
const batchType = batchAction.type;

export function actionTransformer(action) {
  if (action && action[ID] === batchId) {
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

      if (Array.isArray(lastArg)) {
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
