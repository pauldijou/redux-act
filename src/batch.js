import { ID } from './constants';

export default function batch(actions) {
  return {
    [ID]: 0,
    type: 'BATCH',
    payload: actions
  };
}
