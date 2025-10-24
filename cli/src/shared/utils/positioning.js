"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCenterPosition = exports.getFillFramePosition = exports.getFitToFramePosition = exports.getResetPosition = void 0;
/**
 * Reset position to default values
 * @returns Default position object
 */
const getResetPosition = () => ({
    x: 0,
    y: 0,
    scale: 100,
    rotation: 0
});
exports.getResetPosition = getResetPosition;
/**
 * Get position values to fit screenshot within frame
 * @returns Position object for fit-to-frame
 */
const getFitToFramePosition = () => ({
    x: 0,
    y: 0,
    scale: 85,
    rotation: 0
});
exports.getFitToFramePosition = getFitToFramePosition;
/**
 * Get position values to fill the entire frame
 * @returns Position object for fill-frame
 */
const getFillFramePosition = () => ({
    x: 0,
    y: 0,
    scale: 120,
    rotation: 0
});
exports.getFillFramePosition = getFillFramePosition;
/**
 * Center the image while preserving scale and rotation
 * @param currentPosition - Current position to preserve scale/rotation from
 * @returns Centered position object
 */
const getCenterPosition = (currentPosition) => ({
    ...currentPosition,
    x: 0,
    y: 0
});
exports.getCenterPosition = getCenterPosition;
//# sourceMappingURL=positioning.js.map