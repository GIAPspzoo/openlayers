/**
 * @module ol/util
 */

/**
 * @return {?} Any return.
 */
 export function abstract() {
  return /** @type {?} */ (
    (function () {
      throw new Error('Unimplemented abstract method.');
    })()
  );
}

/**
 * Counter for getUid.
 * @type {number}
 * @private
 */
let uidCounter_ = 0;

/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. Unique IDs are generated
 * as a strictly increasing sequence. Adapted from goog.getUid.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {string} The unique ID for the object.
 * @api
 */
export function getUid(obj) {
  return obj.ol_uid || (obj.ol_uid = String(++uidCounter_));
}

/**
 * OpenLayers version.
 * @type {string}
 */
export const VERSION = 'latest';

/**
 * Replace the last element of the array with the specified one.
 * @param {Array} array Array to replace.
 * @param {any} itemToReplace Item to replace.
 * @return {Array} Array with the replaced item.
 */
export function replaceLastArrayEntry(array, itemToReplace) {
  const replacedArray = array.slice();
  replacedArray.pop();
  replacedArray.push(itemToReplace);
  return replacedArray;
}

/**
 * The key that activates the mode of drawing/modifying perpendicular geometry. 
 */
export const PERPENDICULAR_KEY = 'z';
