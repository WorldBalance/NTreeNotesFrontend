import {AVATAR_TAG} from "../../services/action.service";

export const SYSTEM_TAGS = [AVATAR_TAG];

export function systemTagChecker(tag) {
  let result = false;
  SYSTEM_TAGS.map(sysTag => {
    if(tag === sysTag) result = true
  })
  return result;
}
