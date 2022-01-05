import GeographicLib from 'geographiclib';
import {transform} from './proj.js';

const geod = GeographicLib.Geodesic.WGS84;

const DEFAULT_OL_CRS = 'EPSG:3857';
const DEFAULT_GEOLIB_CRS = 'EPSG:4326';

/**
 * Determines the coordinates perpendicular to the indicated points.
 * The function is used when only one point has been added to
 * the measurements (there is no segment yet).
 * @param {Array} lastPoint Last point of the segment.
 * @param {Array} currentPoint The current cursor point.
 * @return {Array} Perpendicular coordinates
 */
export const getPerpendicularCoordinates = (lastPoint, currentPoint) => {
  // NW
  if (currentPoint[0] > lastPoint[0] && currentPoint[1] < lastPoint[1]) {
    return [
      [lastPoint[0], lastPoint[1]],
      [lastPoint[0], currentPoint[1]],
    ];
  }

  // NE
  if (currentPoint[0] > lastPoint[0] && currentPoint[1] > lastPoint[1]) {
    return [
      [lastPoint[0], lastPoint[1]],
      [currentPoint[0], lastPoint[1]],
    ];
  }

  // SE
  if (currentPoint[0] < lastPoint[0] && currentPoint[1] > lastPoint[1]) {
    return [
      [lastPoint[0], lastPoint[1]],
      [lastPoint[0], currentPoint[1]],
    ];
  }

  // SW
  if (currentPoint[0] < lastPoint[0] && currentPoint[1] < lastPoint[1]) {
    return [
      [lastPoint[0], lastPoint[1]],
      [currentPoint[0], lastPoint[1]],
    ];
  }

  return [
    [lastPoint[0], lastPoint[1]],
    [currentPoint[0], currentPoint[1]],
  ];
};

/**
 * The function calculates the azimuth of the line to take measurements at
 * right angles. We need separate calculations for the 4 directions of
 * the world + additionally for the combination NE / NW / SE / SW.
 * For greater clarity, it is best to stay in the form as it is - it
 * may not be entirely consistent with the Clean Code rules, but I think
 * that it is much more readable ...
 * @param {object} config Configuration object
 * @param {Array} config.lastPoint Last point of the segment.
 * @param {Array} config.penultimatePoint Penultimate point of the segment.
 * @param {Array} config.currentPoint The current cursor point.
 * @return {number} Azimuth.
 */
const getPerpendicularAzimuth = ({
  lastPoint,
  penultimatePoint,
  currentPoint,
}) => {
  // @ts-ignore
  const {azi1: drawnLineAzimuth} = geod.Inverse(
    lastPoint[0],
    lastPoint[1],
    penultimatePoint[0],
    penultimatePoint[1]
  );

  // NE
  if (
    lastPoint[0] > penultimatePoint[0] &&
    lastPoint[1] > penultimatePoint[1]
  ) {
    if (drawnLineAzimuth > -130) {
      if (currentPoint[0] > lastPoint[0]) {
        return drawnLineAzimuth + 90;
      }

      if (currentPoint[0] < lastPoint[0]) {
        return drawnLineAzimuth - 90;
      }
    }

    if (currentPoint[1] > lastPoint[1]) {
      return drawnLineAzimuth - 90;
    }

    if (currentPoint[1] < lastPoint[1]) {
      return drawnLineAzimuth + 90;
    }
  }

  // NW
  if (
    lastPoint[0] > penultimatePoint[0] &&
    lastPoint[1] < penultimatePoint[1]
  ) {
    if (drawnLineAzimuth < 130) {
      if (currentPoint[0] > lastPoint[0]) {
        return drawnLineAzimuth - 90;
      }

      if (currentPoint[0] < lastPoint[0]) {
        return drawnLineAzimuth + 90;
      }
    }

    if (currentPoint[1] > lastPoint[1]) {
      return drawnLineAzimuth - 90;
    }

    if (currentPoint[1] < lastPoint[1]) {
      return drawnLineAzimuth + 90;
    }
  }

  // SE
  if (
    lastPoint[0] < penultimatePoint[0] &&
    lastPoint[1] > penultimatePoint[1]
  ) {
    if (drawnLineAzimuth < -50) {
      if (currentPoint[0] > lastPoint[0]) {
        return drawnLineAzimuth + 90;
      }

      if (currentPoint[0] < lastPoint[0]) {
        return drawnLineAzimuth - 90;
      }
    }

    if (currentPoint[1] > lastPoint[1]) {
      return drawnLineAzimuth + 90;
    }

    if (currentPoint[1] < lastPoint[1]) {
      return drawnLineAzimuth - 90;
    }
  }

  // SW
  if (
    lastPoint[0] < penultimatePoint[0] &&
    lastPoint[1] < penultimatePoint[1]
  ) {
    if (drawnLineAzimuth > 50) {
      if (currentPoint[0] > lastPoint[0]) {
        return drawnLineAzimuth - 90;
      }

      if (currentPoint[0] < lastPoint[0]) {
        return drawnLineAzimuth + 90;
      }
    }

    if (currentPoint[1] > lastPoint[1]) {
      return drawnLineAzimuth + 90;
    }

    if (currentPoint[1] < lastPoint[1]) {
      return drawnLineAzimuth - 90;
    }
  }

  // N & S
  if (lastPoint[1] === penultimatePoint[1]) {
    if (currentPoint[1] > lastPoint[1]) {
      return 90;
    }

    return -90;
  }

  // W & E
  if (lastPoint[0] === penultimatePoint[0]) {
    if (currentPoint[0] > lastPoint[0]) {
      return 0;
    }

    return 180;
  }

  return drawnLineAzimuth;
};

/**
 * The function calculates the coordinates of the forming point perpendicular to the selected segment.
 * @param {object} config Configuration object
 * @param {Array} config.lastPoint Last point of the segment.
 * @param {Array} config.penultimatePoint Penultimate point of the segment.
 * @param {Array} config.currentPoint The current cursor point.
 * @return {Array} Perpendicular destination.
 */
export const getPrependicularDestination = ({
  lastPoint,
  penultimatePoint,
  currentPoint,
}) => {
  const sketchLine = geod.Inverse(
    lastPoint[0],
    lastPoint[1],
    currentPoint[0],
    currentPoint[1]
  );
  const azimuth = getPerpendicularAzimuth({
    lastPoint,
    penultimatePoint,
    currentPoint,
  });
  const destination = geod.Direct(
    lastPoint[0],
    lastPoint[1],
    azimuth,
    sketchLine.s12
  );

  // @ts-ignore
  return [destination.lat2, destination.lon2];
};

export const transformCoordForGeolib = (coords) =>
  transform(coords, DEFAULT_OL_CRS, DEFAULT_GEOLIB_CRS).reverse();

export const transformCoordFromGeolib = (coords) =>
  transform(coords.reverse(), DEFAULT_GEOLIB_CRS, DEFAULT_OL_CRS);
