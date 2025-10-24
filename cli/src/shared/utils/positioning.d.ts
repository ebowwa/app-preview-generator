import type { Screen } from '../types/preview-generator';
type Position = NonNullable<Screen['position']>;
/**
 * Reset position to default values
 * @returns Default position object
 */
export declare const getResetPosition: () => Position;
/**
 * Get position values to fit screenshot within frame
 * @returns Position object for fit-to-frame
 */
export declare const getFitToFramePosition: () => Position;
/**
 * Get position values to fill the entire frame
 * @returns Position object for fill-frame
 */
export declare const getFillFramePosition: () => Position;
/**
 * Center the image while preserving scale and rotation
 * @param currentPosition - Current position to preserve scale/rotation from
 * @returns Centered position object
 */
export declare const getCenterPosition: (currentPosition: Position) => Position;
export {};
//# sourceMappingURL=positioning.d.ts.map