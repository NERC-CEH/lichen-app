/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Vector handling functions                           (c) Chris Veness 2011-2014 / MIT Licence  */
/*                                                                                                */
/*  These are generic 3-d vector manipulation routines.                                           */
/*                                                                                                */
/*  In a geodesy context, these may be used to represent:                                         */
/*   - n-vector representing a normal to point on Earth's surface                                 */
/*   - earth-centered, earth fixed vector (= n-vector for spherical model)                        */
/*   - great circle normal to vector                                                              */
/*   - motion vector on Earth's surface                                                           */
/*   - etc                                                                                        */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';


/**
 * Creates a 3-d vector.
 *
 * The vector may be normalised, or use x/y/z values for eg height relative to the sphere or
 * ellipsoid, distance from earth centre, etc.
 *
 * @classdesc Tools for manipulating 3-d vectors, to support various latitude/longitude functions.
 *
 * @constructor
 * @param {number} x - X component of vector.
 * @param {number} y - Y component of vector.
 * @param {number} z - Z component of vector.
 */
function Vector3d(x, y, z) {
    // allow instantiation without 'new'
    if (!(this instanceof Vector3d)) return new Vector3d(x, y, z);

    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
}


/**
 * Adds supplied vector to ‘this’ vector.
 *
 * @param   {Vector3d} v - Vector to be added to this vector.
 * @returns {Vector3d} Vector representing sum of this and v.
 */
Vector3d.prototype.plus = function(v) {
    return new Vector3d(this.x + v.x, this.y + v.y, this.z + v.z);
};


/**
 * Subtracts supplied vector from ‘this’ vector.
 *
 * @param   {Vector3d} v - Vector to be subtracted from this vector.
 * @returns {Vector3d} Vector representing difference between this and v.
 */
Vector3d.prototype.minus = function(v) {
    return new Vector3d(this.x - v.x, this.y - v.y, this.z - v.z);
};


/**
 * Multiplies ‘this’ vector by a scalar value.
 *
 * @param   {number}   x - Factor to multiply this vector by.
 * @returns {Vector3d} Vector scaled by x.
 */
Vector3d.prototype.times = function(x) {
    x = Number(x);
    return new Vector3d(this.x * x, this.y * x, this.z * x);
};


/**
 * Divides ‘this’ vector by a scalar value.
 *
 * @param   {number}   x - Factor to divide this vector by.
 * @returns {Vector3d} Vector divided by x.
 */
Vector3d.prototype.dividedBy = function(x) {
    x = Number(x);
    return new Vector3d(this.x / x, this.y / x, this.z / x);
};


/**
 * Multiplies ‘this’ vector by the supplied vector using dot (scalar) product.
 *
 * @param   {Vector3d} v - Vector to be dotted with this vector.
 * @returns {number} Dot product of ‘this’ and v.
 */
Vector3d.prototype.dot = function(v) {
    return this.x*v.x + this.y*v.y + this.z*v.z;
};


/**
 * Multiplies ‘this’ vector by the supplied vector using cross (vector) product.
 *
 * @param   {Vector3d} v - Vector to be crossed with this vector.
 * @returns {Vector3d} Cross product of ‘this’ and v.
 */
Vector3d.prototype.cross = function(v) {
    var x = this.y*v.z - this.z*v.y;
    var y = this.z*v.x - this.x*v.z;
    var z = this.x*v.y - this.y*v.x;

    return new Vector3d(x, y, z);
};


/**
 * Negates a vector to point in the opposite direction
 *
 * @returns {Vector3d} Negated vector.
 */
Vector3d.prototype.negate = function() {
    return new Vector3d(-this.x, -this.y, -this.z);
};


/**
 * Length (magnitude or norm) of ‘this’ vector
 *
 * @returns {number} Magnitude of this vector.
 */
Vector3d.prototype.length = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
};


/**
 * Normalizes a vector to its unit vector
 * – if the vector is already unit or is zero magnitude, this is a no-op.
 *
 * @returns {Vector3d} Normalised version of this vector.
 */
Vector3d.prototype.unit = function() {
    var norm = this.length();
    if (norm == 1) return this;
    if (norm == 0) return this;

    var x = this.x/norm;
    var y = this.y/norm;
    var z = this.z/norm;
    
    return new Vector3d(x, y, z);
};


/**
 * Calculates the angle between ‘this’ vector and supplied vector.
 *
 * @param   {Vector3d} v
 * @param   {Vector3d} [vSign] - If supplied (and out of plane of this and v), angle is signed +ve if
 *     this->v is clockwise looking along vSign, -ve in opposite direction (otherwise unsigned angle).
 * @returns {number} Angle (in radians) between this vector and supplied vector.
 */
Vector3d.prototype.angleTo = function(v, vSign) {
    var sinθ = this.cross(v).length();
    var cosθ = this.dot(v);

    if (typeof vSign != 'undefined') {
        // use vSign as reference to get sign of sinθ
        sinθ = this.cross(v).dot(vSign)<0 ? -sinθ : sinθ;
    }

    return Math.atan2(sinθ, cosθ);
};


/**
 * Rotates ‘this’ point around an axis by a specified angle.
 *
 * @param   {Vector3d} axis - The axis being rotated around.
 * @param   {number}   theta - The angle of rotation (in radians).
 * @returns {Vector3d} The rotated point.
 */
Vector3d.prototype.rotateAround = function(axis, theta) {
    // en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
    // en.wikipedia.org/wiki/Quaternions_and_spatial_rotation#Quaternion-derived_rotation_matrix
    var p1 = this.unit();
    var p = [ p1.x, p1.y, p1.z ]; // the point being rotated
    var a = axis.unit();          // the axis being rotated around
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    // quaternion-derived rotation matrix
    var q = [ [ a.x*a.x*(1-c) + c,     a.x*a.y*(1-c) - a.z*s, a.x*a.z*(1-c) + a.y*s],
              [ a.y*a.x*(1-c) + a.z*s, a.y*a.y*(1-c) + c,     a.y*a.z*(1-c) - a.x*s],
              [ a.z*a.x*(1-c) - a.y*s, a.z*a.y*(1-c) + a.x*s, a.z*a.z*(1-c) + c    ] ];
    // multiply q × p
    var qp = [0, 0, 0];
    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            qp[i] += q[i][j] * p[j];
        }
    }
    var p2 = new Vector3d(qp[0], qp[1], qp[2]);
    return p2;
    // qv en.wikipedia.org/wiki/Rodrigues'_rotation_formula...
};


/**
 * String representation of vector.
 *
 * @param   {number} [precision=3] - Number of decimal places to be used.
 * @returns {string} Vector represented as [x,y,z].
 */
Vector3d.prototype.toString = function(precision) {
    if (typeof precision == 'undefined') precision = 3;

    var p = Number(precision);

    var str = '[' + this.x.toFixed(p) + ',' + this.y.toFixed(p) + ',' + this.z.toFixed(p) + ']';

    return str;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Vector3d; // CommonJS
if (typeof define == 'function' && define.amd) define([], function() { return Vector3d; }); // AMD


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy representation conversion functions                       (c) Chris Veness 2002-2014  */
/*   - www.movable-type.co.uk/scripts/latlong.html                                   MIT Licence  */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var lat = Geo.parseDMS('51° 28′ 40.12″ N');                                                 */
/*    var lon = Geo.parseDMS('000° 00′ 05.31″ W');                                                */
/*    var p1 = new LatLon(lat, lon);                                                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';


/**
 * Tools for converting between numeric degrees and degrees / minutes / seconds.
 *
 * @namespace
 */
var Geo = {};


// note Unicode Degree = U+00B0. Prime = U+2032, Double prime = U+2033


/**
 * Parses string representing degrees/minutes/seconds into numeric degrees.
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3° 37′ 09″W).
 * Seconds and minutes may be omitted.
 *
 * @param   {string|number} dmsStr - Degrees or deg/min/sec in variety of formats.
 * @returns {number} Degrees as decimal number.
 */
Geo.parseDMS = function(dmsStr) {
    // check for signed decimal degrees without NSEW, if so return it directly
    if (typeof dmsStr == 'number' && isFinite(dmsStr)) return Number(dmsStr);

    // strip off any sign or compass dir'n & split out separate d/m/s
    var dms = String(dmsStr).trim().replace(/^-/,'').replace(/[NSEW]$/i,'').split(/[^0-9.,]+/);
    if (dms[dms.length-1]=='') dms.splice(dms.length-1);  // from trailing symbol

    if (dms == '') return NaN;

    // and convert to decimal degrees...
    var deg;
    switch (dms.length) {
        case 3:  // interpret 3-part result as d/m/s
            deg = dms[0]/1 + dms[1]/60 + dms[2]/3600;
            break;
        case 2:  // interpret 2-part result as d/m
            deg = dms[0]/1 + dms[1]/60;
            break;
        case 1:  // just d (possibly decimal) or non-separated dddmmss
            deg = dms[0];
            // check for fixed-width unseparated format eg 0033709W
            //if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
            //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600;
            break;
        default:
            return NaN;
    }
    if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve

    return Number(deg);
};


/**
 * Converts decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added.
 *
 * @private
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toDMS = function(deg, format, dp) {
    if (isNaN(deg)) return null;  // give up here if we can't make a number from deg

    // default values
    if (typeof format == 'undefined') format = 'dms';
    if (typeof dp == 'undefined') {
        switch (format) {
            case 'd':   dp = 4; break;
            case 'dm':  dp = 2; break;
            case 'dms': dp = 0; break;
            default:    format = 'dms'; dp = 0;  // be forgiving on invalid format
        }
    }

    deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)

    var dms, d, m, s;
    switch (format) {
        default: // invalid format spec!
        case 'd':
            d = deg.toFixed(dp);     // round degrees
            if (d<100) d = '0' + d;  // pad with leading zeros
            if (d<10) d = '0' + d;
            dms = d + '°';
            break;
        case 'dm':
            var min = (deg*60).toFixed(dp);  // convert degrees to minutes & round
            d = Math.floor(min / 60);    // get component deg/min
            m = (min % 60).toFixed(dp);  // pad with trailing zeros
            if (d<100) d = '0' + d;          // pad with leading zeros
            if (d<10) d = '0' + d;
            if (m<10) m = '0' + m;
            dms = d + '°' + m + '′';
            break;
        case 'dms':
            var sec = (deg*3600).toFixed(dp);  // convert degrees to seconds & round
            d = Math.floor(sec / 3600);    // get component deg/min/sec
            m = Math.floor(sec/60) % 60;
            s = (sec % 60).toFixed(dp);    // pad with trailing zeros
            if (d<100) d = '0' + d;            // pad with leading zeros
            if (d<10) d = '0' + d;
            if (m<10) m = '0' + m;
            if (s<10) s = '0' + s;
            dms = d + '°' + m + '′' + s + '″';
        break;
    }

    return dms;
};


/**
 * Converts numeric degrees to deg/min/sec latitude (2-digit degrees, suffixed with N/S).
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toLat = function(deg, format, dp) {
    var lat = Geo.toDMS(deg, format, dp);
    return lat===null ? '–' : lat.slice(1) + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
};


/**
 * Convert numeric degrees to deg/min/sec longitude (3-digit degrees, suffixed with E/W)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toLon = function(deg, format, dp) {
    var lon = Geo.toDMS(deg, format, dp);
    return lon===null ? '–' : lon + (deg<0 ? 'W' : 'E');
};


/**
 * Converts numeric degrees to deg/min/sec as a bearing (0°..360°)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toBrng = function(deg, format, dp) {
    deg = (Number(deg)+360) % 360;  // normalise -ve values to 180°..360°
    var brng =  Geo.toDMS(deg, format, dp);
    return brng===null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360°!
};


/**
 * Returns compass point (to given precision) for supplied bearing.
 *
 * @param   {number} bearing - Bearing in degrees from north.
 * @param   {number} [precision=3] - Precision (cardinal / intercardinal / secondary-intercardinal).
 * @returns {string} Compass point for supplied bearing.
 *
 * @example
 *   var point = Geo.compassPoint(24);    // point = 'NNE'
 *   var point = Geo.compassPoint(24, 1); // point = 'N'
 */
Geo.compassPoint = function(bearing, precision) {
    if (typeof precision == 'undefined') precision = 3;
    // note precision = max length of compass point; it could be extended to 4 for quarter-winds
    // (eg NEbN), but I think they are little used

    bearing = ((bearing%360)+360)%360; // normalise to 0..360

    var point;

    switch (precision) {
        case 1: // 4 compass points
            switch (Math.round(bearing*4/360)%4) {
                case 0: point = 'N'; break;
                case 1: point = 'E'; break;
                case 2: point = 'S'; break;
                case 3: point = 'W'; break;
            }
            break;
        case 2: // 8 compass points
            switch (Math.round(bearing*8/360)%8) {
                case 0: point = 'N';  break;
                case 1: point = 'NE'; break;
                case 2: point = 'E';  break;
                case 3: point = 'SE'; break;
                case 4: point = 'S';  break;
                case 5: point = 'SW'; break;
                case 6: point = 'W';  break;
                case 7: point = 'NW'; break;
            }
            break;
        case 3: // 16 compass points
            switch (Math.round(bearing*16/360)%16) {
                case  0: point = 'N';   break;
                case  1: point = 'NNE'; break;
                case  2: point = 'NE';  break;
                case  3: point = 'ENE'; break;
                case  4: point = 'E';   break;
                case  5: point = 'ESE'; break;
                case  6: point = 'SE';  break;
                case  7: point = 'SSE'; break;
                case  8: point = 'S';   break;
                case  9: point = 'SSW'; break;
                case 10: point = 'SW';  break;
                case 11: point = 'WSW'; break;
                case 12: point = 'W';   break;
                case 13: point = 'WNW'; break;
                case 14: point = 'NW';  break;
                case 15: point = 'NNW'; break;
            }
            break;
        default:
            throw RangeError('Precision must be between 1 and 3');
    }

    return point;
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** Extend Number object with method to  trim whitespace from string
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Geo; // CommonJS
if (typeof define == 'function' && define.amd) define([], function() { return Geo; }); // AMD


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy tools for an ellipsoidal earth model         (c) Chris Veness 2005-2014 / MIT Licence  */
/*                                                                                                */
/* Includes methods for converting lat/lon coordinates between different coordinate systems.      */
/*   - www.movable-type.co.uk/scripts/latlong-convert-coords.html                                 */
/*                                                                                                */
/*  Usage: to eg convert WGS 84 coordinate to OSGB coordinate:                                    */
/*   - var wgs84 = new LatLonE(latWGS84, lonWGS84, LatLonE.datum.WGS84);                          */
/*   - var osgb = wgs84.convertDatum(LatLonE.datum.OSGB36);                                       */
/*   - var latOSGB = osgb.lat, lonOSGB = osgb.lon;                                                */
/*                                                                                                */
/*  q.v. Ordnance Survey 'A guide to coordinate systems in Great Britain' Section 6               */
/*   - www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf           */
/*                                                                                                */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';
if (typeof module!='undefined' && module.exports) var Vector3d = require('./vector3d.js'); // CommonJS (Node.js)
if (typeof module!='undefined' && module.exports) var Geo = require('./geo.js'); // CommonJS (Node.js)


/**
 * Creates lat/lon (polar) point with latitude & longitude values and height above ellipsoid, on a
 * specified datum.
 *
 * @classdesc Library of geodesy functions for operations on an ellipsoidal earth model.
 * @requires Geo
 *
 * @constructor
 * @param {number}        lat - Geodetic latitude in degrees.
 * @param {number}        lon - Longitude in degrees.
 * @param {LatLonE.datum} [datum=WGS84] - Datum this point is defined within.
 * @param {number}        [height=0] - Height above ellipsoid, in metres.
 *
 * @example
 *     var p1 = new LatLonE(51.4778, -0.0016, LatLonE.datum.WGS84);
 */
function LatLonE(lat, lon, datum, height) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLonE)) return new LatLonE(lat, lon, datum, height);

    if (typeof datum == 'undefined') datum = LatLonE.datum.WGS84;
    if (typeof height == 'undefined') height = 0;

    this.lat = Number(lat);
    this.lon = Number(lon);
    this.datum = datum;
    this.height = Number(height);
}


/**
 * Ellipsoid parameters; major axis (a), minor axis (b), and flattening (f) for each ellipsoid.
 */
LatLonE.ellipsoid = {
    WGS84:        { a: 6378137,     b: 6356752.31425, f: 1/298.257223563 },
    GRS80:        { a: 6378137,     b: 6356752.31414, f: 1/298.257222101 },
    Airy1830:     { a: 6377563.396, b: 6356256.909,   f: 1/299.3249646   },
    AiryModified: { a: 6377340.189, b: 6356034.448,   f: 1/299.3249646   },
    Intl1924:     { a: 6378388,     b: 6356911.946,   f: 1/297           },
    Bessel1841:   { a: 6377397.155, b: 6356078.963,   f: 1/299.152815351 }
};

/**
 * Datums; with associated *ellipsoid* and Helmert *transform* parameters to convert from WGS 84
 * into given datum.
 */
LatLonE.datum = {
    WGS84: {
        ellipsoid: LatLonE.ellipsoid.WGS84,
        transform: { tx:    0.0,    ty:    0.0,     tz:    0.0,    // m
                     rx:    0.0,    ry:    0.0,     rz:    0.0,    // sec
                      s:    0.0 }                                  // ppm
    },
    NAD83: { // (2009); functionally ≡ WGS84 - www.uvm.edu/giv/resources/WGS84_NAD83.pdf
        ellipsoid: LatLonE.ellipsoid.GRS80,
        transform: { tx:    1.004,  ty:   -1.910,   tz:   -0.515,  // m
                     rx:    0.0267 ,ry:    0.00034, rz:    0.011,  // sec
                      s:   -0.0015 }                               // ppm
    }, // note: if you *really* need to convert WGS84<->NAD83, you need more knowledge than this!
    OSGB36: { // www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf
        ellipsoid: LatLonE.ellipsoid.Airy1830,
        transform: { tx: -446.448,  ty:  125.157,   tz: -542.060,  // m
                     rx:   -0.1502, ry:   -0.2470,  rz:   -0.8421, // sec
                      s:   20.4894 }                               // ppm
    },
    ED50: { // og.decc.gov.uk/en/olgs/cms/pons_and_cop/pons/pon4/pon4.aspx
        ellipsoid: LatLonE.ellipsoid.Intl1924,
        transform: { tx:   89.5,    ty:   93.8,     tz:  123.1,    // m
                     rx:    0.0,    ry:    0.0,     rz:    0.156,  // sec
                      s:   -1.2 }                                  // ppm
    },
    Irl1975: { // osi.ie/OSI/media/OSI/Content/Publications/transformations_booklet.pdf
        ellipsoid: LatLonE.ellipsoid.AiryModified,
        transform: { tx: -482.530,  ty:  130.596,   tz: -564.557,  // m
                     rx:   -1.042,  ry:   -0.214,   rz:   -0.631,  // sec
                      s:   -8.150 }                                // ppm
    },
    TokyoJapan: { // www.geocachingtoolbox.com?page=datumEllipsoidDetails
        ellipsoid: LatLonE.ellipsoid.Bessel1841,
        transform: { tx:  148,      ty: -507,       tz: -685,      // m
                     rx:    0,      ry:    0,       rz:    0,      // sec
                      s:    0 }                                    // ppm
    }
};


/**
 * Converts ‘this’ lat/lon coordinate to new coordinate system.
 *
 * @param   {LatLonE.datum} toDatum - Datum this coordinate is to be converted to.
 * @returns {LatLonE} This point converted to new datum.
 *
 * @example
 *     var pWGS84 = new LatLonE(51.4778, -0.0016, LatLonE.datum.WGS84);
 *     var pOSGB = pWGS84.convertDatum(LatLonE.datum.OSGB36); // pOSGB.toString(): 51.4773°N, 000.0000°E
 */
LatLonE.prototype.convertDatum = function(toDatum) {
    var oldLatLon = this;
    var transform;

    if (oldLatLon.datum == LatLonE.datum.WGS84) {
        // converting from WGS 84
        transform = toDatum.transform;
    }
    if (toDatum == LatLonE.datum.WGS84) {
        // converting to WGS 84; use inverse transform (don't overwrite original!)
        transform = {};
        for (var param in oldLatLon.datum.transform) {
            if (oldLatLon.datum.transform.hasOwnProperty(param)) {
                transform[param] = -oldLatLon.datum.transform[param];
            }
        }
    }
    if (typeof transform == 'undefined') {
        // neither this.datum nor toDatum are WGS84: convert this to WGS84 first
        oldLatLon = this.convertDatum(LatLonE.datum.WGS84);
        transform = toDatum.transform;
    }

    // convert polar to cartesian
    var cartesian = oldLatLon.toCartesian();

    // apply transform
    cartesian = cartesian.applyTransform(transform);

    // convert cartesian to polar
    var newLatLon = cartesian.toLatLon(toDatum);

    return newLatLon;
};


/**
 * Converts ‘this’ point from (geodetic) latitude/longitude coordinates to (geocentric) cartesian
 * (x/y/z) coordinates.
 *
 * @returns {Vector3d} Vector pointing to lat/lon point, with x, y, z in metres from earth centre.
 */
LatLonE.prototype.toCartesian = function() {
    var φ = this.lat.toRadians(), λ = this.lon.toRadians();
    var h = this.height; // above ellipsoid
    var a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b;

    var sinφ = Math.sin(φ), cosφ = Math.cos(φ);
    var sinλ = Math.sin(λ), cosλ = Math.cos(λ);

    var eSq = (a*a - b*b) / (a*a);
    var ν = a / Math.sqrt(1 - eSq*sinφ*sinφ);

    var x = (ν+h) * cosφ * cosλ;
    var y = (ν+h) * cosφ * sinλ;
    var z = ((1-eSq)*ν + h) * sinφ;

    var point = new Vector3d(x, y, z);

    return point;
};


/**
 * Converts ‘this’ (geocentric) cartesian (x/y/z) point to (ellipsoidal geodetic) latitude/longitude
 * coordinates on specified datum.
 *
 * Uses Bowring’s (1985) formulation for μm precision.
 *
 * @param {LatLonE.datum.transform} datum - Datum to use when converting point.
 */
Vector3d.prototype.toLatLon = function(datum) {
    var x = this.x, y = this.y, z = this.z;
    var a = datum.ellipsoid.a, b = datum.ellipsoid.b;

    var e2 = (a*a-b*b) / (a*a); // 1st eccentricity squared
    var ε2 = (a*a-b*b) / (b*b); // 2nd eccentricity squared
    var p = Math.sqrt(x*x + y*y);
    var R = Math.sqrt(p*p + z*z); // radius

    // u = parametric latitude (Bowring eqn 17)
    var tanu = (b*z)/(a*p) * (1+ε2*b/R);
    var sinu = tanu / Math.sqrt(1+tanu*tanu);
    var cosu = sinu / tanu;

    // geodetic latitude (Bowring eqn 18)
    var B = Math.atan2(z + ε2*b*sinu*sinu*sinu,
                       p - e2*a*cosu*cosu*cosu);

    // longitude
    var λ = Math.atan2(y, x);

    // height above ellipsoid (Bowring eqn 7)
    var sinB = Math.sin(B), cosB = Math.cos(B);
    var ν = a*Math.sqrt(1-e2*sinB*sinB); // length of the normal terminated by the minor axis
    var h = p*cosB + z*sinB - (a*a/ν);

    var point = new LatLonE(B.toDegrees(), λ.toDegrees(), datum, h);

    return point;
};

/**
 * Applies Helmert transform to ‘this’ point using transform parameters t.
 *
 * @private
 * @param {LatLonE.datum.transform} t - Transform to apply to this point.
 */
Vector3d.prototype.applyTransform = function(t)   {
    var x1 = this.x, y1 = this.y, z1 = this.z;

    var tx = t.tx, ty = t.ty, tz = t.tz;
    var rx = (t.rx/3600).toRadians(); // normalise seconds to radians
    var ry = (t.ry/3600).toRadians(); // normalise seconds to radians
    var rz = (t.rz/3600).toRadians(); // normalise seconds to radians
    var s1 = t.s/1e6 + 1;             // normalise ppm to (s+1)

    // apply transform
    var x2 = tx + x1*s1 - y1*rz + z1*ry;
    var y2 = ty + x1*rz + y1*s1 - z1*rx;
    var z2 = tz - x1*ry + y1*rx + z1*s1;

    var point = new Vector3d(x2, y2, z2);

    return point;
};


/**
 * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLonE.prototype.toString = function(format, dp) {
    return Geo.toLat(this.lat, format, dp) + ', ' + Geo.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (typeof Number.prototype.toRadians == 'undefined') {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (typeof Number.prototype.toDegrees == 'undefined') {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLonE; // CommonJS
if (typeof module != 'undefined' && module.exports) module.exports.Vector3d = Vector3d; // CommonJs
if (typeof define == 'function' && define.amd) define([], function() { return LatLonE; }); // AMD
if (typeof define == 'function' && define.amd) define([], function() { return Vector3d; }); // AMD??


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Ordnance Survey Grid Reference functions            (c) Chris Veness 2005-2014 / MIT Licence  */
/*                                                                                                */
/*   - www.movable-type.co.uk/scripts/latlon-gridref.html                                         */
/*   - www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf           */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';
if (typeof module!='undefined' && module.exports) var LatLonE = require('./latlon-ellipsoid.js'); // CommonJS (Node.js)


/**
 * Creates an OsGridRef object.
 *
 * @classdesc Convert OS grid references to/from OSGB latitude/longitude points.
 * @requires  LatLonE
 *
 * @constructor
 * @param {number} easting - Easting in metres from OS false origin.
 * @param {number} northing - Northing in metres from OS false origin.
 *
 * @example
 *   var grid = new OsGridRef(651409, 313177);
 */
function OsGridRef(easting, northing) {
    // allow instantiation without 'new'
    if (!(this instanceof OsGridRef)) return new OsGridRef(easting, northing);

    this.easting = Math.floor(Number(easting));   // truncate if necessary to left of 1m grid square
    this.northing = Math.floor(Number(northing)); // truncate if necessary to bottom of 1m grid square
}


/**
 * Converts (OSGB36) latitude/longitude to Ordnance Survey grid reference easting/northing coordinate.
 *
 * @param   {LatLonE}   point - OSGB36 latitude/longitude.
 * @returns {OsGridRef} OS Grid Reference easting/northing.
 * @throws  {Error}     If datum of point is not OSGB36.
 *
 * @example
 *   var p = new LatLonE(52.65757, 1.71791, LatLonE.datum.OSGB36);
 *   var grid = OsGridRef.latLonToOsGrid(p); // grid.toString(): TG 51409 13177
 */
OsGridRef.latLonToOsGrid = function(point) {
    if (point.datum != LatLonE.datum.OSGB36) throw new Error('Can only convert OSGB36 point to OsGrid');
    var φ = point.lat.toRadians();
    var λ = point.lon.toRadians();

    var a = 6377563.396, b = 6356256.909;              // Airy 1830 major & minor semi-axes
    var F0 = 0.9996012717;                             // NatGrid scale factor on central meridian
    var φ0 = (49).toRadians(), λ0 = (-2).toRadians();  // NatGrid true origin is 49°N,2°W
    var N0 = -100000, E0 = 400000;                     // northing & easting of true origin, metres
    var e2 = 1 - (b*b)/(a*a);                          // eccentricity squared
    var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;         // n, n², n³

    var cosφ = Math.cos(φ), sinφ = Math.sin(φ);
    var ν = a*F0/Math.sqrt(1-e2*sinφ*sinφ);            // nu = transverse radius of curvature
    var ρ = a*F0*(1-e2)/Math.pow(1-e2*sinφ*sinφ, 1.5); // rho = meridional radius of curvature
    var η2 = ν/ρ-1;                                    // eta = ?

    var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (φ-φ0);
    var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(φ-φ0) * Math.cos(φ+φ0);
    var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(φ-φ0)) * Math.cos(2*(φ+φ0));
    var Md = (35/24)*n3 * Math.sin(3*(φ-φ0)) * Math.cos(3*(φ+φ0));
    var M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

    var cos3φ = cosφ*cosφ*cosφ;
    var cos5φ = cos3φ*cosφ*cosφ;
    var tan2φ = Math.tan(φ)*Math.tan(φ);
    var tan4φ = tan2φ*tan2φ;

    var I = M + N0;
    var II = (ν/2)*sinφ*cosφ;
    var III = (ν/24)*sinφ*cos3φ*(5-tan2φ+9*η2);
    var IIIA = (ν/720)*sinφ*cos5φ*(61-58*tan2φ+tan4φ);
    var IV = ν*cosφ;
    var V = (ν/6)*cos3φ*(ν/ρ-tan2φ);
    var VI = (ν/120) * cos5φ * (5 - 18*tan2φ + tan4φ + 14*η2 - 58*tan2φ*η2);

    var Δλ = λ-λ0;
    var Δλ2 = Δλ*Δλ, Δλ3 = Δλ2*Δλ, Δλ4 = Δλ3*Δλ, Δλ5 = Δλ4*Δλ, Δλ6 = Δλ5*Δλ;

    var N = I + II*Δλ2 + III*Δλ4 + IIIA*Δλ6;
    var E = E0 + IV*Δλ + V*Δλ3 + VI*Δλ5;

    return new OsGridRef(E, N); // gets truncated to SW corner of 1m grid square
};


/**
 * Converts Ordnance Survey grid reference easting/northing coordinate to (OSGB36) latitude/longitude
 *
 * @param   {OsGridRef} gridref - Easting/northing to be converted to latitude/longitude.
 * @returns {LatLonE}   Latitude/longitude (in OSGB36) of supplied grid reference.
 *
 * @example
 *   var grid = new OsGridRef(651409, 313177);
 *   var p = OsGridRef.osGridToLatLon(grid); // p.toString(): 52°39′27″N, 001°43′04″E
 */
OsGridRef.osGridToLatLon = function(gridref) {
    var E = gridref.easting + 0.5;  // easting of centre of 1m grid square
    var N = gridref.northing + 0.5; // northing of centre of 1m grid square

    var a = 6377563.396, b = 6356256.909;              // Airy 1830 major & minor semi-axes
    var F0 = 0.9996012717;                             // NatGrid scale factor on central meridian
    var φ0 = 49*Math.PI/180, λ0 = -2*Math.PI/180;      // NatGrid true origin
    var N0 = -100000, E0 = 400000;                     // northing & easting of true origin, metres
    var e2 = 1 - (b*b)/(a*a);                          // eccentricity squared
    var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;         // n, n², n³

    var φ=φ0, M=0;
    do {
        φ = (N-N0-M)/(a*F0) + φ;

        var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (φ-φ0);
        var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(φ-φ0) * Math.cos(φ+φ0);
        var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(φ-φ0)) * Math.cos(2*(φ+φ0));
        var Md = (35/24)*n3 * Math.sin(3*(φ-φ0)) * Math.cos(3*(φ+φ0));
        M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

    } while (N-N0-M >= 0.00001);  // ie until < 0.01mm

    var cosφ = Math.cos(φ), sinφ = Math.sin(φ);
    var ν = a*F0/Math.sqrt(1-e2*sinφ*sinφ);            // nu = transverse radius of curvature
    var ρ = a*F0*(1-e2)/Math.pow(1-e2*sinφ*sinφ, 1.5); // rho = meridional radius of curvature
    var η2 = ν/ρ-1;                                    // eta = ?

    var tanφ = Math.tan(φ);
    var tan2φ = tanφ*tanφ, tan4φ = tan2φ*tan2φ, tan6φ = tan4φ*tan2φ;
    var secφ = 1/cosφ;
    var ν3 = ν*ν*ν, ν5 = ν3*ν*ν, ν7 = ν5*ν*ν;
    var VII = tanφ/(2*ρ*ν);
    var VIII = tanφ/(24*ρ*ν3)*(5+3*tan2φ+η2-9*tan2φ*η2);
    var IX = tanφ/(720*ρ*ν5)*(61+90*tan2φ+45*tan4φ);
    var X = secφ/ν;
    var XI = secφ/(6*ν3)*(ν/ρ+2*tan2φ);
    var XII = secφ/(120*ν5)*(5+28*tan2φ+24*tan4φ);
    var XIIA = secφ/(5040*ν7)*(61+662*tan2φ+1320*tan4φ+720*tan6φ);

    var dE = (E-E0), dE2 = dE*dE, dE3 = dE2*dE, dE4 = dE2*dE2, dE5 = dE3*dE2, dE6 = dE4*dE2, dE7 = dE5*dE2;
    φ = φ - VII*dE2 + VIII*dE4 - IX*dE6;
    var λ = λ0 + X*dE - XI*dE3 + XII*dE5 - XIIA*dE7;

    return new LatLonE(φ.toDegrees(), λ.toDegrees(), LatLonE.datum.OSGB36);
};


/**
 * Converts standard grid reference (eg 'SU387148') to fully numeric ref (eg [438700,114800]).
 *
 * @param   {string}    gridref - Standard format OS grid reference.
 * @returns {OsGridRef} Numeric version of grid reference in metres from false origin, centred on
 *   supplied grid square.
 *
 * @example
 *   var grid = OsGridRef.parse('TG 51409 13177'); // grid: { easting: 651409, northing: 313177 }
 */
OsGridRef.parse = function(gridref) {
    gridref = String(gridref).trim();
    // get numeric values of letter references, mapping A->0, B->1, C->2, etc:
    var l1 = gridref.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    var l2 = gridref.toUpperCase().charCodeAt(1) - 'A'.charCodeAt(0);
    // shuffle down letters after 'I' since 'I' is not used in grid:
    if (l1 > 7) l1--;
    if (l2 > 7) l2--;

    // convert grid letters into 100km-square indexes from false origin (grid square SV):
    var e = ((l1-2)%5)*5 + (l2%5);
    var n = (19-Math.floor(l1/5)*5) - Math.floor(l2/5);
    if (e<0 || e>6 || n<0 || n>12) return new OsGridRef(NaN, NaN);

    // skip grid letters to get numeric part of ref, stripping any spaces:
    gridref = gridref.slice(2).replace(/ /g,'');

    // append numeric part of references to grid index:
    e += gridref.slice(0, gridref.length/2);
    n += gridref.slice(gridref.length/2);

    // normalise to 1m grid, rounding up to centre of grid square:
    switch (gridref.length) {
        case 0: e += '50000'; n += '50000'; break;
        case 2: e += '5000'; n += '5000'; break;
        case 4: e += '500'; n += '500'; break;
        case 6: e += '50'; n += '50'; break;
        case 8: e += '5'; n += '5'; break;
        case 10: break; // 10-digit refs are already 1m
        default: return new OsGridRef(NaN, NaN);
    }

    return new OsGridRef(e, n);
};


/**
 * Converts ‘this’ numeric grid reference to standard OS grid reference.
 *
 * @param   {number} [digits=6] - Precision of returned grid reference (6 digits = metres).
 * @returns {string} This grid reference in standard format.
 */
OsGridRef.prototype.toString = function(digits) {
    digits = (typeof digits == 'undefined') ? 10 : digits;
    var e = this.easting;
    var n = this.northing;
    if (isNaN(e) || isNaN(n)) return '??';

    // get the 100km-grid indices
    var e100k = Math.floor(e/100000), n100k = Math.floor(n/100000);

    if (e100k<0 || e100k>6 || n100k<0 || n100k>12) return '';

    // translate those into numeric equivalents of the grid letters
    var l1 = (19-n100k) - (19-n100k)%5 + Math.floor((e100k+10)/5);
    var l2 = (19-n100k)*5%25 + e100k%5;

    // compensate for skipped 'I' and build grid letter-pairs
    if (l1 > 7) l1++;
    if (l2 > 7) l2++;
    var letPair = String.fromCharCode(l1+'A'.charCodeAt(0), l2+'A'.charCodeAt(0));

    // strip 100km-grid indices from easting & northing, and reduce precision
    e = Math.floor((e%100000)/Math.pow(10,5-digits/2));
    n = Math.floor((n%100000)/Math.pow(10,5-digits/2));

    var gridRef = letPair + ' ' + e.pad(digits/2) + ' ' + n.pad(digits/2);

    return gridRef;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** Extend String object with method to trim whitespace from string
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}


/** Extend Number object with method to pad with leading zeros to make it w chars wide
 *  (q.v. stackoverflow.com/questions/2998784 */
if (typeof Number.prototype.pad == 'undefined') {
    Number.prototype.pad = function(w) {
        var n = this.toString();
        while (n.length < w) n = '0' + n;
        return n;
    };
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = OsGridRef; // CommonJS
if (typeof define == 'function' && define.amd) define([], function() { return OsGridRef; }); // AMD


/*!

 handlebars v2.0.0

Copyright (C) 2011-2014 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
/* exported Handlebars */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Handlebars = root.Handlebars || factory();
  }
}(this, function () {
// handlebars/safe-string.js
var __module4__ = (function() {
  "use strict";
  var __exports__;
  // Build out our basic SafeString type
  function SafeString(string) {
    this.string = string;
  }

  SafeString.prototype.toString = function() {
    return "" + this.string;
  };

  __exports__ = SafeString;
  return __exports__;
})();

// handlebars/utils.js
var __module3__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  /*jshint -W004 */
  var SafeString = __dependency1__;

  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  function escapeChar(chr) {
    return escape[chr];
  }

  function extend(obj /* , ...source */) {
    for (var i = 1; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          obj[key] = arguments[i][key];
        }
      }
    }

    return obj;
  }

  __exports__.extend = extend;var toString = Object.prototype.toString;
  __exports__.toString = toString;
  // Sourced from lodash
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  var isFunction = function(value) {
    return typeof value === 'function';
  };
  // fallback for older versions of Chrome and Safari
  /* istanbul ignore next */
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return typeof value === 'function' && toString.call(value) === '[object Function]';
    };
  }
  var isFunction;
  __exports__.isFunction = isFunction;
  /* istanbul ignore next */
  var isArray = Array.isArray || function(value) {
    return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
  };
  __exports__.isArray = isArray;

  function escapeExpression(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof SafeString) {
      return string.toString();
    } else if (string == null) {
      return "";
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = "" + string;

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  }

  __exports__.escapeExpression = escapeExpression;function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  __exports__.isEmpty = isEmpty;function appendContextPath(contextPath, id) {
    return (contextPath ? contextPath + '.' : '') + id;
  }

  __exports__.appendContextPath = appendContextPath;
  return __exports__;
})(__module4__);

// handlebars/exception.js
var __module5__ = (function() {
  "use strict";
  var __exports__;

  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  function Exception(message, node) {
    var line;
    if (node && node.firstLine) {
      line = node.firstLine;

      message += ' - ' + line + ':' + node.firstColumn;
    }

    var tmp = Error.prototype.constructor.call(this, message);

    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }

    if (line) {
      this.lineNumber = line;
      this.column = node.firstColumn;
    }
  }

  Exception.prototype = new Error();

  __exports__ = Exception;
  return __exports__;
})();

// handlebars/base.js
var __module2__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  var Utils = __dependency1__;
  var Exception = __dependency2__;

  var VERSION = "2.0.0";
  __exports__.VERSION = VERSION;var COMPILER_REVISION = 6;
  __exports__.COMPILER_REVISION = COMPILER_REVISION;
  var REVISION_CHANGES = {
    1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '== 1.x.x',
    5: '== 2.0.0-alpha.x',
    6: '>= 2.0.0-beta.1'
  };
  __exports__.REVISION_CHANGES = REVISION_CHANGES;
  var isArray = Utils.isArray,
      isFunction = Utils.isFunction,
      toString = Utils.toString,
      objectType = '[object Object]';

  function HandlebarsEnvironment(helpers, partials) {
    this.helpers = helpers || {};
    this.partials = partials || {};

    registerDefaultHelpers(this);
  }

  __exports__.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
    constructor: HandlebarsEnvironment,

    logger: logger,
    log: log,

    registerHelper: function(name, fn) {
      if (toString.call(name) === objectType) {
        if (fn) { throw new Exception('Arg not supported with multiple helpers'); }
        Utils.extend(this.helpers, name);
      } else {
        this.helpers[name] = fn;
      }
    },
    unregisterHelper: function(name) {
      delete this.helpers[name];
    },

    registerPartial: function(name, partial) {
      if (toString.call(name) === objectType) {
        Utils.extend(this.partials,  name);
      } else {
        this.partials[name] = partial;
      }
    },
    unregisterPartial: function(name) {
      delete this.partials[name];
    }
  };

  function registerDefaultHelpers(instance) {
    instance.registerHelper('helperMissing', function(/* [args, ]options */) {
      if(arguments.length === 1) {
        // A missing field in a {{foo}} constuct.
        return undefined;
      } else {
        // Someone is actually trying to call something, blow up.
        throw new Exception("Missing helper: '" + arguments[arguments.length-1].name + "'");
      }
    });

    instance.registerHelper('blockHelperMissing', function(context, options) {
      var inverse = options.inverse,
          fn = options.fn;

      if(context === true) {
        return fn(this);
      } else if(context === false || context == null) {
        return inverse(this);
      } else if (isArray(context)) {
        if(context.length > 0) {
          if (options.ids) {
            options.ids = [options.name];
          }

          return instance.helpers.each(context, options);
        } else {
          return inverse(this);
        }
      } else {
        if (options.data && options.ids) {
          var data = createFrame(options.data);
          data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
          options = {data: data};
        }

        return fn(context, options);
      }
    });

    instance.registerHelper('each', function(context, options) {
      if (!options) {
        throw new Exception('Must pass iterator to #each');
      }

      var fn = options.fn, inverse = options.inverse;
      var i = 0, ret = "", data;

      var contextPath;
      if (options.data && options.ids) {
        contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
      }

      if (isFunction(context)) { context = context.call(this); }

      if (options.data) {
        data = createFrame(options.data);
      }

      if(context && typeof context === 'object') {
        if (isArray(context)) {
          for(var j = context.length; i<j; i++) {
            if (data) {
              data.index = i;
              data.first = (i === 0);
              data.last  = (i === (context.length-1));

              if (contextPath) {
                data.contextPath = contextPath + i;
              }
            }
            ret = ret + fn(context[i], { data: data });
          }
        } else {
          for(var key in context) {
            if(context.hasOwnProperty(key)) {
              if(data) {
                data.key = key;
                data.index = i;
                data.first = (i === 0);

                if (contextPath) {
                  data.contextPath = contextPath + key;
                }
              }
              ret = ret + fn(context[key], {data: data});
              i++;
            }
          }
        }
      }

      if(i === 0){
        ret = inverse(this);
      }

      return ret;
    });

    instance.registerHelper('if', function(conditional, options) {
      if (isFunction(conditional)) { conditional = conditional.call(this); }

      // Default behavior is to render the positive path if the value is truthy and not empty.
      // The `includeZero` option may be set to treat the condtional as purely not empty based on the
      // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
      if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    });

    instance.registerHelper('unless', function(conditional, options) {
      return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
    });

    instance.registerHelper('with', function(context, options) {
      if (isFunction(context)) { context = context.call(this); }

      var fn = options.fn;

      if (!Utils.isEmpty(context)) {
        if (options.data && options.ids) {
          var data = createFrame(options.data);
          data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
          options = {data:data};
        }

        return fn(context, options);
      } else {
        return options.inverse(this);
      }
    });

    instance.registerHelper('log', function(message, options) {
      var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
      instance.log(level, message);
    });

    instance.registerHelper('lookup', function(obj, field) {
      return obj && obj[field];
    });
  }

  var logger = {
    methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

    // State enum
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    level: 3,

    // can be overridden in the host environment
    log: function(level, message) {
      if (logger.level <= level) {
        var method = logger.methodMap[level];
        if (typeof console !== 'undefined' && console[method]) {
          console[method].call(console, message);
        }
      }
    }
  };
  __exports__.logger = logger;
  var log = logger.log;
  __exports__.log = log;
  var createFrame = function(object) {
    var frame = Utils.extend({}, object);
    frame._parent = object;
    return frame;
  };
  __exports__.createFrame = createFrame;
  return __exports__;
})(__module3__, __module5__);

// handlebars/runtime.js
var __module6__ = (function(__dependency1__, __dependency2__, __dependency3__) {
  "use strict";
  var __exports__ = {};
  var Utils = __dependency1__;
  var Exception = __dependency2__;
  var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;
  var createFrame = __dependency3__.createFrame;

  function checkRevision(compilerInfo) {
    var compilerRevision = compilerInfo && compilerInfo[0] || 1,
        currentRevision = COMPILER_REVISION;

    if (compilerRevision !== currentRevision) {
      if (compilerRevision < currentRevision) {
        var runtimeVersions = REVISION_CHANGES[currentRevision],
            compilerVersions = REVISION_CHANGES[compilerRevision];
        throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
              "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
              "Please update your runtime to a newer version ("+compilerInfo[1]+").");
      }
    }
  }

  __exports__.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

  function template(templateSpec, env) {
    /* istanbul ignore next */
    if (!env) {
      throw new Exception("No environment passed to template");
    }
    if (!templateSpec || !templateSpec.main) {
      throw new Exception('Unknown template object: ' + typeof templateSpec);
    }

    // Note: Using env.VM references rather than local var references throughout this section to allow
    // for external users to override these as psuedo-supported APIs.
    env.VM.checkRevision(templateSpec.compiler);

    var invokePartialWrapper = function(partial, indent, name, context, hash, helpers, partials, data, depths) {
      if (hash) {
        context = Utils.extend({}, context, hash);
      }

      var result = env.VM.invokePartial.call(this, partial, name, context, helpers, partials, data, depths);

      if (result == null && env.compile) {
        var options = { helpers: helpers, partials: partials, data: data, depths: depths };
        partials[name] = env.compile(partial, { data: data !== undefined, compat: templateSpec.compat }, env);
        result = partials[name](context, options);
      }
      if (result != null) {
        if (indent) {
          var lines = result.split('\n');
          for (var i = 0, l = lines.length; i < l; i++) {
            if (!lines[i] && i + 1 === l) {
              break;
            }

            lines[i] = indent + lines[i];
          }
          result = lines.join('\n');
        }
        return result;
      } else {
        throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
      }
    };

    // Just add water
    var container = {
      lookup: function(depths, name) {
        var len = depths.length;
        for (var i = 0; i < len; i++) {
          if (depths[i] && depths[i][name] != null) {
            return depths[i][name];
          }
        }
      },
      lambda: function(current, context) {
        return typeof current === 'function' ? current.call(context) : current;
      },

      escapeExpression: Utils.escapeExpression,
      invokePartial: invokePartialWrapper,

      fn: function(i) {
        return templateSpec[i];
      },

      programs: [],
      program: function(i, data, depths) {
        var programWrapper = this.programs[i],
            fn = this.fn(i);
        if (data || depths) {
          programWrapper = program(this, i, fn, data, depths);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = program(this, i, fn);
        }
        return programWrapper;
      },

      data: function(data, depth) {
        while (data && depth--) {
          data = data._parent;
        }
        return data;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common && (param !== common)) {
          ret = Utils.extend({}, common, param);
        }

        return ret;
      },

      noop: env.VM.noop,
      compilerInfo: templateSpec.compiler
    };

    var ret = function(context, options) {
      options = options || {};
      var data = options.data;

      ret._setup(options);
      if (!options.partial && templateSpec.useData) {
        data = initData(context, data);
      }
      var depths;
      if (templateSpec.useDepths) {
        depths = options.depths ? [context].concat(options.depths) : [context];
      }

      return templateSpec.main.call(container, context, container.helpers, container.partials, data, depths);
    };
    ret.isTop = true;

    ret._setup = function(options) {
      if (!options.partial) {
        container.helpers = container.merge(options.helpers, env.helpers);

        if (templateSpec.usePartial) {
          container.partials = container.merge(options.partials, env.partials);
        }
      } else {
        container.helpers = options.helpers;
        container.partials = options.partials;
      }
    };

    ret._child = function(i, data, depths) {
      if (templateSpec.useDepths && !depths) {
        throw new Exception('must pass parent depths');
      }

      return program(container, i, templateSpec[i], data, depths);
    };
    return ret;
  }

  __exports__.template = template;function program(container, i, fn, data, depths) {
    var prog = function(context, options) {
      options = options || {};

      return fn.call(container, context, container.helpers, container.partials, options.data || data, depths && [context].concat(depths));
    };
    prog.program = i;
    prog.depth = depths ? depths.length : 0;
    return prog;
  }

  __exports__.program = program;function invokePartial(partial, name, context, helpers, partials, data, depths) {
    var options = { partial: true, helpers: helpers, partials: partials, data: data, depths: depths };

    if(partial === undefined) {
      throw new Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    }
  }

  __exports__.invokePartial = invokePartial;function noop() { return ""; }

  __exports__.noop = noop;function initData(context, data) {
    if (!data || !('root' in data)) {
      data = data ? createFrame(data) : {};
      data.root = context;
    }
    return data;
  }
  return __exports__;
})(__module3__, __module5__, __module2__);

// handlebars.runtime.js
var __module1__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  /*globals Handlebars: true */
  var base = __dependency1__;

  // Each of these augment the Handlebars object. No need to setup here.
  // (This is done to easily share code between commonjs and browse envs)
  var SafeString = __dependency2__;
  var Exception = __dependency3__;
  var Utils = __dependency4__;
  var runtime = __dependency5__;

  // For compatibility and usage outside of module systems, make the Handlebars object a namespace
  var create = function() {
    var hb = new base.HandlebarsEnvironment();

    Utils.extend(hb, base);
    hb.SafeString = SafeString;
    hb.Exception = Exception;
    hb.Utils = Utils;
    hb.escapeExpression = Utils.escapeExpression;

    hb.VM = runtime;
    hb.template = function(spec) {
      return runtime.template(spec, hb);
    };

    return hb;
  };

  var Handlebars = create();
  Handlebars.create = create;

  Handlebars['default'] = Handlebars;

  __exports__ = Handlebars;
  return __exports__;
})(__module2__, __module4__, __module5__, __module3__, __module6__);

// handlebars/compiler/ast.js
var __module7__ = (function(__dependency1__) {
  "use strict";
  var __exports__;
  var Exception = __dependency1__;

  function LocationInfo(locInfo) {
    locInfo = locInfo || {};
    this.firstLine   = locInfo.first_line;
    this.firstColumn = locInfo.first_column;
    this.lastColumn  = locInfo.last_column;
    this.lastLine    = locInfo.last_line;
  }

  var AST = {
    ProgramNode: function(statements, strip, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "program";
      this.statements = statements;
      this.strip = strip;
    },

    MustacheNode: function(rawParams, hash, open, strip, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "mustache";
      this.strip = strip;

      // Open may be a string parsed from the parser or a passed boolean flag
      if (open != null && open.charAt) {
        // Must use charAt to support IE pre-10
        var escapeFlag = open.charAt(3) || open.charAt(2);
        this.escaped = escapeFlag !== '{' && escapeFlag !== '&';
      } else {
        this.escaped = !!open;
      }

      if (rawParams instanceof AST.SexprNode) {
        this.sexpr = rawParams;
      } else {
        // Support old AST API
        this.sexpr = new AST.SexprNode(rawParams, hash);
      }

      // Support old AST API that stored this info in MustacheNode
      this.id = this.sexpr.id;
      this.params = this.sexpr.params;
      this.hash = this.sexpr.hash;
      this.eligibleHelper = this.sexpr.eligibleHelper;
      this.isHelper = this.sexpr.isHelper;
    },

    SexprNode: function(rawParams, hash, locInfo) {
      LocationInfo.call(this, locInfo);

      this.type = "sexpr";
      this.hash = hash;

      var id = this.id = rawParams[0];
      var params = this.params = rawParams.slice(1);

      // a mustache is definitely a helper if:
      // * it is an eligible helper, and
      // * it has at least one parameter or hash segment
      this.isHelper = !!(params.length || hash);

      // a mustache is an eligible helper if:
      // * its id is simple (a single part, not `this` or `..`)
      this.eligibleHelper = this.isHelper || id.isSimple;

      // if a mustache is an eligible helper but not a definite
      // helper, it is ambiguous, and will be resolved in a later
      // pass or at runtime.
    },

    PartialNode: function(partialName, context, hash, strip, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type         = "partial";
      this.partialName  = partialName;
      this.context      = context;
      this.hash = hash;
      this.strip = strip;

      this.strip.inlineStandalone = true;
    },

    BlockNode: function(mustache, program, inverse, strip, locInfo) {
      LocationInfo.call(this, locInfo);

      this.type = 'block';
      this.mustache = mustache;
      this.program  = program;
      this.inverse  = inverse;
      this.strip = strip;

      if (inverse && !program) {
        this.isInverse = true;
      }
    },

    RawBlockNode: function(mustache, content, close, locInfo) {
      LocationInfo.call(this, locInfo);

      if (mustache.sexpr.id.original !== close) {
        throw new Exception(mustache.sexpr.id.original + " doesn't match " + close, this);
      }

      content = new AST.ContentNode(content, locInfo);

      this.type = 'block';
      this.mustache = mustache;
      this.program = new AST.ProgramNode([content], {}, locInfo);
    },

    ContentNode: function(string, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "content";
      this.original = this.string = string;
    },

    HashNode: function(pairs, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "hash";
      this.pairs = pairs;
    },

    IdNode: function(parts, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "ID";

      var original = "",
          dig = [],
          depth = 0,
          depthString = '';

      for(var i=0,l=parts.length; i<l; i++) {
        var part = parts[i].part;
        original += (parts[i].separator || '') + part;

        if (part === ".." || part === "." || part === "this") {
          if (dig.length > 0) {
            throw new Exception("Invalid path: " + original, this);
          } else if (part === "..") {
            depth++;
            depthString += '../';
          } else {
            this.isScoped = true;
          }
        } else {
          dig.push(part);
        }
      }

      this.original = original;
      this.parts    = dig;
      this.string   = dig.join('.');
      this.depth    = depth;
      this.idName   = depthString + this.string;

      // an ID is simple if it only has one part, and that part is not
      // `..` or `this`.
      this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

      this.stringModeValue = this.string;
    },

    PartialNameNode: function(name, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "PARTIAL_NAME";
      this.name = name.original;
    },

    DataNode: function(id, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "DATA";
      this.id = id;
      this.stringModeValue = id.stringModeValue;
      this.idName = '@' + id.stringModeValue;
    },

    StringNode: function(string, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "STRING";
      this.original =
        this.string =
        this.stringModeValue = string;
    },

    NumberNode: function(number, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "NUMBER";
      this.original =
        this.number = number;
      this.stringModeValue = Number(number);
    },

    BooleanNode: function(bool, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "BOOLEAN";
      this.bool = bool;
      this.stringModeValue = bool === "true";
    },

    CommentNode: function(comment, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "comment";
      this.comment = comment;

      this.strip = {
        inlineStandalone: true
      };
    }
  };


  // Must be exported as an object rather than the root of the module as the jison lexer
  // most modify the object to operate properly.
  __exports__ = AST;
  return __exports__;
})(__module5__);

// handlebars/compiler/parser.js
var __module9__ = (function() {
  "use strict";
  var __exports__;
  /* jshint ignore:start */
  /* istanbul ignore next */
  /* Jison generated parser */
  var handlebars = (function(){
  var parser = {trace: function trace() { },
  yy: {},
  symbols_: {"error":2,"root":3,"program":4,"EOF":5,"program_repetition0":6,"statement":7,"mustache":8,"block":9,"rawBlock":10,"partial":11,"CONTENT":12,"COMMENT":13,"openRawBlock":14,"END_RAW_BLOCK":15,"OPEN_RAW_BLOCK":16,"sexpr":17,"CLOSE_RAW_BLOCK":18,"openBlock":19,"block_option0":20,"closeBlock":21,"openInverse":22,"block_option1":23,"OPEN_BLOCK":24,"CLOSE":25,"OPEN_INVERSE":26,"inverseAndProgram":27,"INVERSE":28,"OPEN_ENDBLOCK":29,"path":30,"OPEN":31,"OPEN_UNESCAPED":32,"CLOSE_UNESCAPED":33,"OPEN_PARTIAL":34,"partialName":35,"param":36,"partial_option0":37,"partial_option1":38,"sexpr_repetition0":39,"sexpr_option0":40,"dataName":41,"STRING":42,"NUMBER":43,"BOOLEAN":44,"OPEN_SEXPR":45,"CLOSE_SEXPR":46,"hash":47,"hash_repetition_plus0":48,"hashSegment":49,"ID":50,"EQUALS":51,"DATA":52,"pathSegments":53,"SEP":54,"$accept":0,"$end":1},
  terminals_: {2:"error",5:"EOF",12:"CONTENT",13:"COMMENT",15:"END_RAW_BLOCK",16:"OPEN_RAW_BLOCK",18:"CLOSE_RAW_BLOCK",24:"OPEN_BLOCK",25:"CLOSE",26:"OPEN_INVERSE",28:"INVERSE",29:"OPEN_ENDBLOCK",31:"OPEN",32:"OPEN_UNESCAPED",33:"CLOSE_UNESCAPED",34:"OPEN_PARTIAL",42:"STRING",43:"NUMBER",44:"BOOLEAN",45:"OPEN_SEXPR",46:"CLOSE_SEXPR",50:"ID",51:"EQUALS",52:"DATA",54:"SEP"},
  productions_: [0,[3,2],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[10,3],[14,3],[9,4],[9,4],[19,3],[22,3],[27,2],[21,3],[8,3],[8,3],[11,5],[11,4],[17,3],[17,1],[36,1],[36,1],[36,1],[36,1],[36,1],[36,3],[47,1],[49,3],[35,1],[35,1],[35,1],[41,2],[30,1],[53,3],[53,1],[6,0],[6,2],[20,0],[20,1],[23,0],[23,1],[37,0],[37,1],[38,0],[38,1],[39,0],[39,2],[40,0],[40,1],[48,1],[48,2]],
  performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

  var $0 = $$.length - 1;
  switch (yystate) {
  case 1: yy.prepareProgram($$[$0-1].statements, true); return $$[$0-1]; 
  break;
  case 2:this.$ = new yy.ProgramNode(yy.prepareProgram($$[$0]), {}, this._$);
  break;
  case 3:this.$ = $$[$0];
  break;
  case 4:this.$ = $$[$0];
  break;
  case 5:this.$ = $$[$0];
  break;
  case 6:this.$ = $$[$0];
  break;
  case 7:this.$ = new yy.ContentNode($$[$0], this._$);
  break;
  case 8:this.$ = new yy.CommentNode($$[$0], this._$);
  break;
  case 9:this.$ = new yy.RawBlockNode($$[$0-2], $$[$0-1], $$[$0], this._$);
  break;
  case 10:this.$ = new yy.MustacheNode($$[$0-1], null, '', '', this._$);
  break;
  case 11:this.$ = yy.prepareBlock($$[$0-3], $$[$0-2], $$[$0-1], $$[$0], false, this._$);
  break;
  case 12:this.$ = yy.prepareBlock($$[$0-3], $$[$0-2], $$[$0-1], $$[$0], true, this._$);
  break;
  case 13:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], yy.stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 14:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], yy.stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 15:this.$ = { strip: yy.stripFlags($$[$0-1], $$[$0-1]), program: $$[$0] };
  break;
  case 16:this.$ = {path: $$[$0-1], strip: yy.stripFlags($$[$0-2], $$[$0])};
  break;
  case 17:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], yy.stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 18:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], yy.stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 19:this.$ = new yy.PartialNode($$[$0-3], $$[$0-2], $$[$0-1], yy.stripFlags($$[$0-4], $$[$0]), this._$);
  break;
  case 20:this.$ = new yy.PartialNode($$[$0-2], undefined, $$[$0-1], yy.stripFlags($$[$0-3], $$[$0]), this._$);
  break;
  case 21:this.$ = new yy.SexprNode([$$[$0-2]].concat($$[$0-1]), $$[$0], this._$);
  break;
  case 22:this.$ = new yy.SexprNode([$$[$0]], null, this._$);
  break;
  case 23:this.$ = $$[$0];
  break;
  case 24:this.$ = new yy.StringNode($$[$0], this._$);
  break;
  case 25:this.$ = new yy.NumberNode($$[$0], this._$);
  break;
  case 26:this.$ = new yy.BooleanNode($$[$0], this._$);
  break;
  case 27:this.$ = $$[$0];
  break;
  case 28:$$[$0-1].isHelper = true; this.$ = $$[$0-1];
  break;
  case 29:this.$ = new yy.HashNode($$[$0], this._$);
  break;
  case 30:this.$ = [$$[$0-2], $$[$0]];
  break;
  case 31:this.$ = new yy.PartialNameNode($$[$0], this._$);
  break;
  case 32:this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0], this._$), this._$);
  break;
  case 33:this.$ = new yy.PartialNameNode(new yy.NumberNode($$[$0], this._$));
  break;
  case 34:this.$ = new yy.DataNode($$[$0], this._$);
  break;
  case 35:this.$ = new yy.IdNode($$[$0], this._$);
  break;
  case 36: $$[$0-2].push({part: $$[$0], separator: $$[$0-1]}); this.$ = $$[$0-2]; 
  break;
  case 37:this.$ = [{part: $$[$0]}];
  break;
  case 38:this.$ = [];
  break;
  case 39:$$[$0-1].push($$[$0]);
  break;
  case 48:this.$ = [];
  break;
  case 49:$$[$0-1].push($$[$0]);
  break;
  case 52:this.$ = [$$[$0]];
  break;
  case 53:$$[$0-1].push($$[$0]);
  break;
  }
  },
  table: [{3:1,4:2,5:[2,38],6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],31:[2,38],32:[2,38],34:[2,38]},{1:[3]},{5:[1,4]},{5:[2,2],7:5,8:6,9:7,10:8,11:9,12:[1,10],13:[1,11],14:16,16:[1,20],19:14,22:15,24:[1,18],26:[1,19],28:[2,2],29:[2,2],31:[1,12],32:[1,13],34:[1,17]},{1:[2,1]},{5:[2,39],12:[2,39],13:[2,39],16:[2,39],24:[2,39],26:[2,39],28:[2,39],29:[2,39],31:[2,39],32:[2,39],34:[2,39]},{5:[2,3],12:[2,3],13:[2,3],16:[2,3],24:[2,3],26:[2,3],28:[2,3],29:[2,3],31:[2,3],32:[2,3],34:[2,3]},{5:[2,4],12:[2,4],13:[2,4],16:[2,4],24:[2,4],26:[2,4],28:[2,4],29:[2,4],31:[2,4],32:[2,4],34:[2,4]},{5:[2,5],12:[2,5],13:[2,5],16:[2,5],24:[2,5],26:[2,5],28:[2,5],29:[2,5],31:[2,5],32:[2,5],34:[2,5]},{5:[2,6],12:[2,6],13:[2,6],16:[2,6],24:[2,6],26:[2,6],28:[2,6],29:[2,6],31:[2,6],32:[2,6],34:[2,6]},{5:[2,7],12:[2,7],13:[2,7],16:[2,7],24:[2,7],26:[2,7],28:[2,7],29:[2,7],31:[2,7],32:[2,7],34:[2,7]},{5:[2,8],12:[2,8],13:[2,8],16:[2,8],24:[2,8],26:[2,8],28:[2,8],29:[2,8],31:[2,8],32:[2,8],34:[2,8]},{17:21,30:22,41:23,50:[1,26],52:[1,25],53:24},{17:27,30:22,41:23,50:[1,26],52:[1,25],53:24},{4:28,6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],28:[2,38],29:[2,38],31:[2,38],32:[2,38],34:[2,38]},{4:29,6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],28:[2,38],29:[2,38],31:[2,38],32:[2,38],34:[2,38]},{12:[1,30]},{30:32,35:31,42:[1,33],43:[1,34],50:[1,26],53:24},{17:35,30:22,41:23,50:[1,26],52:[1,25],53:24},{17:36,30:22,41:23,50:[1,26],52:[1,25],53:24},{17:37,30:22,41:23,50:[1,26],52:[1,25],53:24},{25:[1,38]},{18:[2,48],25:[2,48],33:[2,48],39:39,42:[2,48],43:[2,48],44:[2,48],45:[2,48],46:[2,48],50:[2,48],52:[2,48]},{18:[2,22],25:[2,22],33:[2,22],46:[2,22]},{18:[2,35],25:[2,35],33:[2,35],42:[2,35],43:[2,35],44:[2,35],45:[2,35],46:[2,35],50:[2,35],52:[2,35],54:[1,40]},{30:41,50:[1,26],53:24},{18:[2,37],25:[2,37],33:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[2,37],46:[2,37],50:[2,37],52:[2,37],54:[2,37]},{33:[1,42]},{20:43,27:44,28:[1,45],29:[2,40]},{23:46,27:47,28:[1,45],29:[2,42]},{15:[1,48]},{25:[2,46],30:51,36:49,38:50,41:55,42:[1,52],43:[1,53],44:[1,54],45:[1,56],47:57,48:58,49:60,50:[1,59],52:[1,25],53:24},{25:[2,31],42:[2,31],43:[2,31],44:[2,31],45:[2,31],50:[2,31],52:[2,31]},{25:[2,32],42:[2,32],43:[2,32],44:[2,32],45:[2,32],50:[2,32],52:[2,32]},{25:[2,33],42:[2,33],43:[2,33],44:[2,33],45:[2,33],50:[2,33],52:[2,33]},{25:[1,61]},{25:[1,62]},{18:[1,63]},{5:[2,17],12:[2,17],13:[2,17],16:[2,17],24:[2,17],26:[2,17],28:[2,17],29:[2,17],31:[2,17],32:[2,17],34:[2,17]},{18:[2,50],25:[2,50],30:51,33:[2,50],36:65,40:64,41:55,42:[1,52],43:[1,53],44:[1,54],45:[1,56],46:[2,50],47:66,48:58,49:60,50:[1,59],52:[1,25],53:24},{50:[1,67]},{18:[2,34],25:[2,34],33:[2,34],42:[2,34],43:[2,34],44:[2,34],45:[2,34],46:[2,34],50:[2,34],52:[2,34]},{5:[2,18],12:[2,18],13:[2,18],16:[2,18],24:[2,18],26:[2,18],28:[2,18],29:[2,18],31:[2,18],32:[2,18],34:[2,18]},{21:68,29:[1,69]},{29:[2,41]},{4:70,6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],29:[2,38],31:[2,38],32:[2,38],34:[2,38]},{21:71,29:[1,69]},{29:[2,43]},{5:[2,9],12:[2,9],13:[2,9],16:[2,9],24:[2,9],26:[2,9],28:[2,9],29:[2,9],31:[2,9],32:[2,9],34:[2,9]},{25:[2,44],37:72,47:73,48:58,49:60,50:[1,74]},{25:[1,75]},{18:[2,23],25:[2,23],33:[2,23],42:[2,23],43:[2,23],44:[2,23],45:[2,23],46:[2,23],50:[2,23],52:[2,23]},{18:[2,24],25:[2,24],33:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[2,24],46:[2,24],50:[2,24],52:[2,24]},{18:[2,25],25:[2,25],33:[2,25],42:[2,25],43:[2,25],44:[2,25],45:[2,25],46:[2,25],50:[2,25],52:[2,25]},{18:[2,26],25:[2,26],33:[2,26],42:[2,26],43:[2,26],44:[2,26],45:[2,26],46:[2,26],50:[2,26],52:[2,26]},{18:[2,27],25:[2,27],33:[2,27],42:[2,27],43:[2,27],44:[2,27],45:[2,27],46:[2,27],50:[2,27],52:[2,27]},{17:76,30:22,41:23,50:[1,26],52:[1,25],53:24},{25:[2,47]},{18:[2,29],25:[2,29],33:[2,29],46:[2,29],49:77,50:[1,74]},{18:[2,37],25:[2,37],33:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[2,37],46:[2,37],50:[2,37],51:[1,78],52:[2,37],54:[2,37]},{18:[2,52],25:[2,52],33:[2,52],46:[2,52],50:[2,52]},{12:[2,13],13:[2,13],16:[2,13],24:[2,13],26:[2,13],28:[2,13],29:[2,13],31:[2,13],32:[2,13],34:[2,13]},{12:[2,14],13:[2,14],16:[2,14],24:[2,14],26:[2,14],28:[2,14],29:[2,14],31:[2,14],32:[2,14],34:[2,14]},{12:[2,10]},{18:[2,21],25:[2,21],33:[2,21],46:[2,21]},{18:[2,49],25:[2,49],33:[2,49],42:[2,49],43:[2,49],44:[2,49],45:[2,49],46:[2,49],50:[2,49],52:[2,49]},{18:[2,51],25:[2,51],33:[2,51],46:[2,51]},{18:[2,36],25:[2,36],33:[2,36],42:[2,36],43:[2,36],44:[2,36],45:[2,36],46:[2,36],50:[2,36],52:[2,36],54:[2,36]},{5:[2,11],12:[2,11],13:[2,11],16:[2,11],24:[2,11],26:[2,11],28:[2,11],29:[2,11],31:[2,11],32:[2,11],34:[2,11]},{30:79,50:[1,26],53:24},{29:[2,15]},{5:[2,12],12:[2,12],13:[2,12],16:[2,12],24:[2,12],26:[2,12],28:[2,12],29:[2,12],31:[2,12],32:[2,12],34:[2,12]},{25:[1,80]},{25:[2,45]},{51:[1,78]},{5:[2,20],12:[2,20],13:[2,20],16:[2,20],24:[2,20],26:[2,20],28:[2,20],29:[2,20],31:[2,20],32:[2,20],34:[2,20]},{46:[1,81]},{18:[2,53],25:[2,53],33:[2,53],46:[2,53],50:[2,53]},{30:51,36:82,41:55,42:[1,52],43:[1,53],44:[1,54],45:[1,56],50:[1,26],52:[1,25],53:24},{25:[1,83]},{5:[2,19],12:[2,19],13:[2,19],16:[2,19],24:[2,19],26:[2,19],28:[2,19],29:[2,19],31:[2,19],32:[2,19],34:[2,19]},{18:[2,28],25:[2,28],33:[2,28],42:[2,28],43:[2,28],44:[2,28],45:[2,28],46:[2,28],50:[2,28],52:[2,28]},{18:[2,30],25:[2,30],33:[2,30],46:[2,30],50:[2,30]},{5:[2,16],12:[2,16],13:[2,16],16:[2,16],24:[2,16],26:[2,16],28:[2,16],29:[2,16],31:[2,16],32:[2,16],34:[2,16]}],
  defaultActions: {4:[2,1],44:[2,41],47:[2,43],57:[2,47],63:[2,10],70:[2,15],73:[2,45]},
  parseError: function parseError(str, hash) {
      throw new Error(str);
  },
  parse: function parse(input) {
      var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
      this.lexer.setInput(input);
      this.lexer.yy = this.yy;
      this.yy.lexer = this.lexer;
      this.yy.parser = this;
      if (typeof this.lexer.yylloc == "undefined")
          this.lexer.yylloc = {};
      var yyloc = this.lexer.yylloc;
      lstack.push(yyloc);
      var ranges = this.lexer.options && this.lexer.options.ranges;
      if (typeof this.yy.parseError === "function")
          this.parseError = this.yy.parseError;
      function popStack(n) {
          stack.length = stack.length - 2 * n;
          vstack.length = vstack.length - n;
          lstack.length = lstack.length - n;
      }
      function lex() {
          var token;
          token = self.lexer.lex() || 1;
          if (typeof token !== "number") {
              token = self.symbols_[token] || token;
          }
          return token;
      }
      var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
      while (true) {
          state = stack[stack.length - 1];
          if (this.defaultActions[state]) {
              action = this.defaultActions[state];
          } else {
              if (symbol === null || typeof symbol == "undefined") {
                  symbol = lex();
              }
              action = table[state] && table[state][symbol];
          }
          if (typeof action === "undefined" || !action.length || !action[0]) {
              var errStr = "";
              if (!recovering) {
                  expected = [];
                  for (p in table[state])
                      if (this.terminals_[p] && p > 2) {
                          expected.push("'" + this.terminals_[p] + "'");
                      }
                  if (this.lexer.showPosition) {
                      errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                  } else {
                      errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                  }
                  this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
              }
          }
          if (action[0] instanceof Array && action.length > 1) {
              throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
          }
          switch (action[0]) {
          case 1:
              stack.push(symbol);
              vstack.push(this.lexer.yytext);
              lstack.push(this.lexer.yylloc);
              stack.push(action[1]);
              symbol = null;
              if (!preErrorSymbol) {
                  yyleng = this.lexer.yyleng;
                  yytext = this.lexer.yytext;
                  yylineno = this.lexer.yylineno;
                  yyloc = this.lexer.yylloc;
                  if (recovering > 0)
                      recovering--;
              } else {
                  symbol = preErrorSymbol;
                  preErrorSymbol = null;
              }
              break;
          case 2:
              len = this.productions_[action[1]][1];
              yyval.$ = vstack[vstack.length - len];
              yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
              if (ranges) {
                  yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
              }
              r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
              if (typeof r !== "undefined") {
                  return r;
              }
              if (len) {
                  stack = stack.slice(0, -1 * len * 2);
                  vstack = vstack.slice(0, -1 * len);
                  lstack = lstack.slice(0, -1 * len);
              }
              stack.push(this.productions_[action[1]][0]);
              vstack.push(yyval.$);
              lstack.push(yyval._$);
              newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
              stack.push(newState);
              break;
          case 3:
              return true;
          }
      }
      return true;
  }
  };
  /* Jison generated lexer */
  var lexer = (function(){
  var lexer = ({EOF:1,
  parseError:function parseError(str, hash) {
          if (this.yy.parser) {
              this.yy.parser.parseError(str, hash);
          } else {
              throw new Error(str);
          }
      },
  setInput:function (input) {
          this._input = input;
          this._more = this._less = this.done = false;
          this.yylineno = this.yyleng = 0;
          this.yytext = this.matched = this.match = '';
          this.conditionStack = ['INITIAL'];
          this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
          if (this.options.ranges) this.yylloc.range = [0,0];
          this.offset = 0;
          return this;
      },
  input:function () {
          var ch = this._input[0];
          this.yytext += ch;
          this.yyleng++;
          this.offset++;
          this.match += ch;
          this.matched += ch;
          var lines = ch.match(/(?:\r\n?|\n).*/g);
          if (lines) {
              this.yylineno++;
              this.yylloc.last_line++;
          } else {
              this.yylloc.last_column++;
          }
          if (this.options.ranges) this.yylloc.range[1]++;

          this._input = this._input.slice(1);
          return ch;
      },
  unput:function (ch) {
          var len = ch.length;
          var lines = ch.split(/(?:\r\n?|\n)/g);

          this._input = ch + this._input;
          this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
          //this.yyleng -= len;
          this.offset -= len;
          var oldLines = this.match.split(/(?:\r\n?|\n)/g);
          this.match = this.match.substr(0, this.match.length-1);
          this.matched = this.matched.substr(0, this.matched.length-1);

          if (lines.length-1) this.yylineno -= lines.length-1;
          var r = this.yylloc.range;

          this.yylloc = {first_line: this.yylloc.first_line,
            last_line: this.yylineno+1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
                this.yylloc.first_column - len
            };

          if (this.options.ranges) {
              this.yylloc.range = [r[0], r[0] + this.yyleng - len];
          }
          return this;
      },
  more:function () {
          this._more = true;
          return this;
      },
  less:function (n) {
          this.unput(this.match.slice(n));
      },
  pastInput:function () {
          var past = this.matched.substr(0, this.matched.length - this.match.length);
          return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
      },
  upcomingInput:function () {
          var next = this.match;
          if (next.length < 20) {
              next += this._input.substr(0, 20-next.length);
          }
          return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
      },
  showPosition:function () {
          var pre = this.pastInput();
          var c = new Array(pre.length + 1).join("-");
          return pre + this.upcomingInput() + "\n" + c+"^";
      },
  next:function () {
          if (this.done) {
              return this.EOF;
          }
          if (!this._input) this.done = true;

          var token,
              match,
              tempMatch,
              index,
              col,
              lines;
          if (!this._more) {
              this.yytext = '';
              this.match = '';
          }
          var rules = this._currentRules();
          for (var i=0;i < rules.length; i++) {
              tempMatch = this._input.match(this.rules[rules[i]]);
              if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                  match = tempMatch;
                  index = i;
                  if (!this.options.flex) break;
              }
          }
          if (match) {
              lines = match[0].match(/(?:\r\n?|\n).*/g);
              if (lines) this.yylineno += lines.length;
              this.yylloc = {first_line: this.yylloc.last_line,
                             last_line: this.yylineno+1,
                             first_column: this.yylloc.last_column,
                             last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
              this.yytext += match[0];
              this.match += match[0];
              this.matches = match;
              this.yyleng = this.yytext.length;
              if (this.options.ranges) {
                  this.yylloc.range = [this.offset, this.offset += this.yyleng];
              }
              this._more = false;
              this._input = this._input.slice(match[0].length);
              this.matched += match[0];
              token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
              if (this.done && this._input) this.done = false;
              if (token) return token;
              else return;
          }
          if (this._input === "") {
              return this.EOF;
          } else {
              return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                      {text: "", token: null, line: this.yylineno});
          }
      },
  lex:function lex() {
          var r = this.next();
          if (typeof r !== 'undefined') {
              return r;
          } else {
              return this.lex();
          }
      },
  begin:function begin(condition) {
          this.conditionStack.push(condition);
      },
  popState:function popState() {
          return this.conditionStack.pop();
      },
  _currentRules:function _currentRules() {
          return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
      },
  topState:function () {
          return this.conditionStack[this.conditionStack.length-2];
      },
  pushState:function begin(condition) {
          this.begin(condition);
      }});
  lexer.options = {};
  lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {


  function strip(start, end) {
    return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng-end);
  }


  var YYSTATE=YY_START
  switch($avoiding_name_collisions) {
  case 0:
                                     if(yy_.yytext.slice(-2) === "\\\\") {
                                       strip(0,1);
                                       this.begin("mu");
                                     } else if(yy_.yytext.slice(-1) === "\\") {
                                       strip(0,1);
                                       this.begin("emu");
                                     } else {
                                       this.begin("mu");
                                     }
                                     if(yy_.yytext) return 12;
                                   
  break;
  case 1:return 12;
  break;
  case 2:
                                     this.popState();
                                     return 12;
                                   
  break;
  case 3:
                                    yy_.yytext = yy_.yytext.substr(5, yy_.yyleng-9);
                                    this.popState();
                                    return 15;
                                   
  break;
  case 4: return 12; 
  break;
  case 5:strip(0,4); this.popState(); return 13;
  break;
  case 6:return 45;
  break;
  case 7:return 46;
  break;
  case 8: return 16; 
  break;
  case 9:
                                    this.popState();
                                    this.begin('raw');
                                    return 18;
                                   
  break;
  case 10:return 34;
  break;
  case 11:return 24;
  break;
  case 12:return 29;
  break;
  case 13:this.popState(); return 28;
  break;
  case 14:this.popState(); return 28;
  break;
  case 15:return 26;
  break;
  case 16:return 26;
  break;
  case 17:return 32;
  break;
  case 18:return 31;
  break;
  case 19:this.popState(); this.begin('com');
  break;
  case 20:strip(3,5); this.popState(); return 13;
  break;
  case 21:return 31;
  break;
  case 22:return 51;
  break;
  case 23:return 50;
  break;
  case 24:return 50;
  break;
  case 25:return 54;
  break;
  case 26:// ignore whitespace
  break;
  case 27:this.popState(); return 33;
  break;
  case 28:this.popState(); return 25;
  break;
  case 29:yy_.yytext = strip(1,2).replace(/\\"/g,'"'); return 42;
  break;
  case 30:yy_.yytext = strip(1,2).replace(/\\'/g,"'"); return 42;
  break;
  case 31:return 52;
  break;
  case 32:return 44;
  break;
  case 33:return 44;
  break;
  case 34:return 43;
  break;
  case 35:return 50;
  break;
  case 36:yy_.yytext = strip(1,2); return 50;
  break;
  case 37:return 'INVALID';
  break;
  case 38:return 5;
  break;
  }
  };
  lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,/^(?:[^\x00]*?(?=(\{\{\{\{\/)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{\{\{)/,/^(?:\}\}\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^\s*(~)?\}\})/,/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/];
  lexer.conditions = {"mu":{"rules":[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[5],"inclusive":false},"raw":{"rules":[3,4],"inclusive":false},"INITIAL":{"rules":[0,1,38],"inclusive":true}};
  return lexer;})()
  parser.lexer = lexer;
  function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
  return new Parser;
  })();__exports__ = handlebars;
  /* jshint ignore:end */
  return __exports__;
})();

// handlebars/compiler/helpers.js
var __module10__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  var Exception = __dependency1__;

  function stripFlags(open, close) {
    return {
      left: open.charAt(2) === '~',
      right: close.charAt(close.length-3) === '~'
    };
  }

  __exports__.stripFlags = stripFlags;
  function prepareBlock(mustache, program, inverseAndProgram, close, inverted, locInfo) {
    /*jshint -W040 */
    if (mustache.sexpr.id.original !== close.path.original) {
      throw new Exception(mustache.sexpr.id.original + ' doesn\'t match ' + close.path.original, mustache);
    }

    var inverse = inverseAndProgram && inverseAndProgram.program;

    var strip = {
      left: mustache.strip.left,
      right: close.strip.right,

      // Determine the standalone candiacy. Basically flag our content as being possibly standalone
      // so our parent can determine if we actually are standalone
      openStandalone: isNextWhitespace(program.statements),
      closeStandalone: isPrevWhitespace((inverse || program).statements)
    };

    if (mustache.strip.right) {
      omitRight(program.statements, null, true);
    }

    if (inverse) {
      var inverseStrip = inverseAndProgram.strip;

      if (inverseStrip.left) {
        omitLeft(program.statements, null, true);
      }
      if (inverseStrip.right) {
        omitRight(inverse.statements, null, true);
      }
      if (close.strip.left) {
        omitLeft(inverse.statements, null, true);
      }

      // Find standalone else statments
      if (isPrevWhitespace(program.statements)
          && isNextWhitespace(inverse.statements)) {

        omitLeft(program.statements);
        omitRight(inverse.statements);
      }
    } else {
      if (close.strip.left) {
        omitLeft(program.statements, null, true);
      }
    }

    if (inverted) {
      return new this.BlockNode(mustache, inverse, program, strip, locInfo);
    } else {
      return new this.BlockNode(mustache, program, inverse, strip, locInfo);
    }
  }

  __exports__.prepareBlock = prepareBlock;
  function prepareProgram(statements, isRoot) {
    for (var i = 0, l = statements.length; i < l; i++) {
      var current = statements[i],
          strip = current.strip;

      if (!strip) {
        continue;
      }

      var _isPrevWhitespace = isPrevWhitespace(statements, i, isRoot, current.type === 'partial'),
          _isNextWhitespace = isNextWhitespace(statements, i, isRoot),

          openStandalone = strip.openStandalone && _isPrevWhitespace,
          closeStandalone = strip.closeStandalone && _isNextWhitespace,
          inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

      if (strip.right) {
        omitRight(statements, i, true);
      }
      if (strip.left) {
        omitLeft(statements, i, true);
      }

      if (inlineStandalone) {
        omitRight(statements, i);

        if (omitLeft(statements, i)) {
          // If we are on a standalone node, save the indent info for partials
          if (current.type === 'partial') {
            current.indent = (/([ \t]+$)/).exec(statements[i-1].original) ? RegExp.$1 : '';
          }
        }
      }
      if (openStandalone) {
        omitRight((current.program || current.inverse).statements);

        // Strip out the previous content node if it's whitespace only
        omitLeft(statements, i);
      }
      if (closeStandalone) {
        // Always strip the next node
        omitRight(statements, i);

        omitLeft((current.inverse || current.program).statements);
      }
    }

    return statements;
  }

  __exports__.prepareProgram = prepareProgram;function isPrevWhitespace(statements, i, isRoot) {
    if (i === undefined) {
      i = statements.length;
    }

    // Nodes that end with newlines are considered whitespace (but are special
    // cased for strip operations)
    var prev = statements[i-1],
        sibling = statements[i-2];
    if (!prev) {
      return isRoot;
    }

    if (prev.type === 'content') {
      return (sibling || !isRoot ? (/\r?\n\s*?$/) : (/(^|\r?\n)\s*?$/)).test(prev.original);
    }
  }
  function isNextWhitespace(statements, i, isRoot) {
    if (i === undefined) {
      i = -1;
    }

    var next = statements[i+1],
        sibling = statements[i+2];
    if (!next) {
      return isRoot;
    }

    if (next.type === 'content') {
      return (sibling || !isRoot ? (/^\s*?\r?\n/) : (/^\s*?(\r?\n|$)/)).test(next.original);
    }
  }

  // Marks the node to the right of the position as omitted.
  // I.e. {{foo}}' ' will mark the ' ' node as omitted.
  //
  // If i is undefined, then the first child will be marked as such.
  //
  // If mulitple is truthy then all whitespace will be stripped out until non-whitespace
  // content is met.
  function omitRight(statements, i, multiple) {
    var current = statements[i == null ? 0 : i + 1];
    if (!current || current.type !== 'content' || (!multiple && current.rightStripped)) {
      return;
    }

    var original = current.string;
    current.string = current.string.replace(multiple ? (/^\s+/) : (/^[ \t]*\r?\n?/), '');
    current.rightStripped = current.string !== original;
  }

  // Marks the node to the left of the position as omitted.
  // I.e. ' '{{foo}} will mark the ' ' node as omitted.
  //
  // If i is undefined then the last child will be marked as such.
  //
  // If mulitple is truthy then all whitespace will be stripped out until non-whitespace
  // content is met.
  function omitLeft(statements, i, multiple) {
    var current = statements[i == null ? statements.length - 1 : i - 1];
    if (!current || current.type !== 'content' || (!multiple && current.leftStripped)) {
      return;
    }

    // We omit the last node if it's whitespace only and not preceeded by a non-content node.
    var original = current.string;
    current.string = current.string.replace(multiple ? (/\s+$/) : (/[ \t]+$/), '');
    current.leftStripped = current.string !== original;
    return current.leftStripped;
  }
  return __exports__;
})(__module5__);

// handlebars/compiler/base.js
var __module8__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__) {
  "use strict";
  var __exports__ = {};
  var parser = __dependency1__;
  var AST = __dependency2__;
  var Helpers = __dependency3__;
  var extend = __dependency4__.extend;

  __exports__.parser = parser;

  var yy = {};
  extend(yy, Helpers, AST);

  function parse(input) {
    // Just return if an already-compile AST was passed in.
    if (input.constructor === AST.ProgramNode) { return input; }

    parser.yy = yy;

    return parser.parse(input);
  }

  __exports__.parse = parse;
  return __exports__;
})(__module9__, __module7__, __module10__, __module3__);

// handlebars/compiler/compiler.js
var __module11__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  var Exception = __dependency1__;
  var isArray = __dependency2__.isArray;

  var slice = [].slice;

  function Compiler() {}

  __exports__.Compiler = Compiler;// the foundHelper register will disambiguate helper lookup from finding a
  // function in a context. This is necessary for mustache compatibility, which
  // requires that context functions in blocks are evaluated by blockHelperMissing,
  // and then proceed as if the resulting value was provided to blockHelperMissing.

  Compiler.prototype = {
    compiler: Compiler,

    equals: function(other) {
      var len = this.opcodes.length;
      if (other.opcodes.length !== len) {
        return false;
      }

      for (var i = 0; i < len; i++) {
        var opcode = this.opcodes[i],
            otherOpcode = other.opcodes[i];
        if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
          return false;
        }
      }

      // We know that length is the same between the two arrays because they are directly tied
      // to the opcode behavior above.
      len = this.children.length;
      for (i = 0; i < len; i++) {
        if (!this.children[i].equals(other.children[i])) {
          return false;
        }
      }

      return true;
    },

    guid: 0,

    compile: function(program, options) {
      this.opcodes = [];
      this.children = [];
      this.depths = {list: []};
      this.options = options;
      this.stringParams = options.stringParams;
      this.trackIds = options.trackIds;

      // These changes will propagate to the other compiler components
      var knownHelpers = this.options.knownHelpers;
      this.options.knownHelpers = {
        'helperMissing': true,
        'blockHelperMissing': true,
        'each': true,
        'if': true,
        'unless': true,
        'with': true,
        'log': true,
        'lookup': true
      };
      if (knownHelpers) {
        for (var name in knownHelpers) {
          this.options.knownHelpers[name] = knownHelpers[name];
        }
      }

      return this.accept(program);
    },

    accept: function(node) {
      return this[node.type](node);
    },

    program: function(program) {
      var statements = program.statements;

      for(var i=0, l=statements.length; i<l; i++) {
        this.accept(statements[i]);
      }
      this.isSimple = l === 1;

      this.depths.list = this.depths.list.sort(function(a, b) {
        return a - b;
      });

      return this;
    },

    compileProgram: function(program) {
      var result = new this.compiler().compile(program, this.options);
      var guid = this.guid++, depth;

      this.usePartial = this.usePartial || result.usePartial;

      this.children[guid] = result;

      for(var i=0, l=result.depths.list.length; i<l; i++) {
        depth = result.depths.list[i];

        if(depth < 2) { continue; }
        else { this.addDepth(depth - 1); }
      }

      return guid;
    },

    block: function(block) {
      var mustache = block.mustache,
          program = block.program,
          inverse = block.inverse;

      if (program) {
        program = this.compileProgram(program);
      }

      if (inverse) {
        inverse = this.compileProgram(inverse);
      }

      var sexpr = mustache.sexpr;
      var type = this.classifySexpr(sexpr);

      if (type === "helper") {
        this.helperSexpr(sexpr, program, inverse);
      } else if (type === "simple") {
        this.simpleSexpr(sexpr);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('emptyHash');
        this.opcode('blockValue', sexpr.id.original);
      } else {
        this.ambiguousSexpr(sexpr, program, inverse);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('emptyHash');
        this.opcode('ambiguousBlockValue');
      }

      this.opcode('append');
    },

    hash: function(hash) {
      var pairs = hash.pairs, i, l;

      this.opcode('pushHash');

      for(i=0, l=pairs.length; i<l; i++) {
        this.pushParam(pairs[i][1]);
      }
      while(i--) {
        this.opcode('assignToHash', pairs[i][0]);
      }
      this.opcode('popHash');
    },

    partial: function(partial) {
      var partialName = partial.partialName;
      this.usePartial = true;

      if (partial.hash) {
        this.accept(partial.hash);
      } else {
        this.opcode('push', 'undefined');
      }

      if (partial.context) {
        this.accept(partial.context);
      } else {
        this.opcode('getContext', 0);
        this.opcode('pushContext');
      }

      this.opcode('invokePartial', partialName.name, partial.indent || '');
      this.opcode('append');
    },

    content: function(content) {
      if (content.string) {
        this.opcode('appendContent', content.string);
      }
    },

    mustache: function(mustache) {
      this.sexpr(mustache.sexpr);

      if(mustache.escaped && !this.options.noEscape) {
        this.opcode('appendEscaped');
      } else {
        this.opcode('append');
      }
    },

    ambiguousSexpr: function(sexpr, program, inverse) {
      var id = sexpr.id,
          name = id.parts[0],
          isBlock = program != null || inverse != null;

      this.opcode('getContext', id.depth);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      this.ID(id);

      this.opcode('invokeAmbiguous', name, isBlock);
    },

    simpleSexpr: function(sexpr) {
      var id = sexpr.id;

      if (id.type === 'DATA') {
        this.DATA(id);
      } else if (id.parts.length) {
        this.ID(id);
      } else {
        // Simplified ID for `this`
        this.addDepth(id.depth);
        this.opcode('getContext', id.depth);
        this.opcode('pushContext');
      }

      this.opcode('resolvePossibleLambda');
    },

    helperSexpr: function(sexpr, program, inverse) {
      var params = this.setupFullMustacheParams(sexpr, program, inverse),
          id = sexpr.id,
          name = id.parts[0];

      if (this.options.knownHelpers[name]) {
        this.opcode('invokeKnownHelper', params.length, name);
      } else if (this.options.knownHelpersOnly) {
        throw new Exception("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
      } else {
        id.falsy = true;

        this.ID(id);
        this.opcode('invokeHelper', params.length, id.original, id.isSimple);
      }
    },

    sexpr: function(sexpr) {
      var type = this.classifySexpr(sexpr);

      if (type === "simple") {
        this.simpleSexpr(sexpr);
      } else if (type === "helper") {
        this.helperSexpr(sexpr);
      } else {
        this.ambiguousSexpr(sexpr);
      }
    },

    ID: function(id) {
      this.addDepth(id.depth);
      this.opcode('getContext', id.depth);

      var name = id.parts[0];
      if (!name) {
        // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
        this.opcode('pushContext');
      } else {
        this.opcode('lookupOnContext', id.parts, id.falsy, id.isScoped);
      }
    },

    DATA: function(data) {
      this.options.data = true;
      this.opcode('lookupData', data.id.depth, data.id.parts);
    },

    STRING: function(string) {
      this.opcode('pushString', string.string);
    },

    NUMBER: function(number) {
      this.opcode('pushLiteral', number.number);
    },

    BOOLEAN: function(bool) {
      this.opcode('pushLiteral', bool.bool);
    },

    comment: function() {},

    // HELPERS
    opcode: function(name) {
      this.opcodes.push({ opcode: name, args: slice.call(arguments, 1) });
    },

    addDepth: function(depth) {
      if(depth === 0) { return; }

      if(!this.depths[depth]) {
        this.depths[depth] = true;
        this.depths.list.push(depth);
      }
    },

    classifySexpr: function(sexpr) {
      var isHelper   = sexpr.isHelper;
      var isEligible = sexpr.eligibleHelper;
      var options    = this.options;

      // if ambiguous, we can possibly resolve the ambiguity now
      // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
      if (isEligible && !isHelper) {
        var name = sexpr.id.parts[0];

        if (options.knownHelpers[name]) {
          isHelper = true;
        } else if (options.knownHelpersOnly) {
          isEligible = false;
        }
      }

      if (isHelper) { return "helper"; }
      else if (isEligible) { return "ambiguous"; }
      else { return "simple"; }
    },

    pushParams: function(params) {
      for(var i=0, l=params.length; i<l; i++) {
        this.pushParam(params[i]);
      }
    },

    pushParam: function(val) {
      if (this.stringParams) {
        if(val.depth) {
          this.addDepth(val.depth);
        }
        this.opcode('getContext', val.depth || 0);
        this.opcode('pushStringParam', val.stringModeValue, val.type);

        if (val.type === 'sexpr') {
          // Subexpressions get evaluated and passed in
          // in string params mode.
          this.sexpr(val);
        }
      } else {
        if (this.trackIds) {
          this.opcode('pushId', val.type, val.idName || val.stringModeValue);
        }
        this.accept(val);
      }
    },

    setupFullMustacheParams: function(sexpr, program, inverse) {
      var params = sexpr.params;
      this.pushParams(params);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      if (sexpr.hash) {
        this.hash(sexpr.hash);
      } else {
        this.opcode('emptyHash');
      }

      return params;
    }
  };

  function precompile(input, options, env) {
    if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
      throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
    }

    options = options || {};
    if (!('data' in options)) {
      options.data = true;
    }
    if (options.compat) {
      options.useDepths = true;
    }

    var ast = env.parse(input);
    var environment = new env.Compiler().compile(ast, options);
    return new env.JavaScriptCompiler().compile(environment, options);
  }

  __exports__.precompile = precompile;function compile(input, options, env) {
    if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
      throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
    }

    options = options || {};

    if (!('data' in options)) {
      options.data = true;
    }
    if (options.compat) {
      options.useDepths = true;
    }

    var compiled;

    function compileInput() {
      var ast = env.parse(input);
      var environment = new env.Compiler().compile(ast, options);
      var templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
      return env.template(templateSpec);
    }

    // Template is only compiled on first use and cached after that point.
    var ret = function(context, options) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled.call(this, context, options);
    };
    ret._setup = function(options) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled._setup(options);
    };
    ret._child = function(i, data, depths) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled._child(i, data, depths);
    };
    return ret;
  }

  __exports__.compile = compile;function argEquals(a, b) {
    if (a === b) {
      return true;
    }

    if (isArray(a) && isArray(b) && a.length === b.length) {
      for (var i = 0; i < a.length; i++) {
        if (!argEquals(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
  }
  return __exports__;
})(__module5__, __module3__);

// handlebars/compiler/javascript-compiler.js
var __module12__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__;
  var COMPILER_REVISION = __dependency1__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency1__.REVISION_CHANGES;
  var Exception = __dependency2__;

  function Literal(value) {
    this.value = value;
  }

  function JavaScriptCompiler() {}

  JavaScriptCompiler.prototype = {
    // PUBLIC API: You can override these methods in a subclass to provide
    // alternative compiled forms for name lookup and buffering semantics
    nameLookup: function(parent, name /* , type*/) {
      if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
        return parent + "." + name;
      } else {
        return parent + "['" + name + "']";
      }
    },
    depthedLookup: function(name) {
      this.aliases.lookup = 'this.lookup';

      return 'lookup(depths, "' + name + '")';
    },

    compilerInfo: function() {
      var revision = COMPILER_REVISION,
          versions = REVISION_CHANGES[revision];
      return [revision, versions];
    },

    appendToBuffer: function(string) {
      if (this.environment.isSimple) {
        return "return " + string + ";";
      } else {
        return {
          appendToBuffer: true,
          content: string,
          toString: function() { return "buffer += " + string + ";"; }
        };
      }
    },

    initializeBuffer: function() {
      return this.quotedString("");
    },

    namespace: "Handlebars",
    // END PUBLIC API

    compile: function(environment, options, context, asObject) {
      this.environment = environment;
      this.options = options;
      this.stringParams = this.options.stringParams;
      this.trackIds = this.options.trackIds;
      this.precompile = !asObject;

      this.name = this.environment.name;
      this.isChild = !!context;
      this.context = context || {
        programs: [],
        environments: []
      };

      this.preamble();

      this.stackSlot = 0;
      this.stackVars = [];
      this.aliases = {};
      this.registers = { list: [] };
      this.hashes = [];
      this.compileStack = [];
      this.inlineStack = [];

      this.compileChildren(environment, options);

      this.useDepths = this.useDepths || environment.depths.list.length || this.options.compat;

      var opcodes = environment.opcodes,
          opcode,
          i,
          l;

      for (i = 0, l = opcodes.length; i < l; i++) {
        opcode = opcodes[i];

        this[opcode.opcode].apply(this, opcode.args);
      }

      // Flush any trailing content that might be pending.
      this.pushSource('');

      /* istanbul ignore next */
      if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
        throw new Exception('Compile completed with content left on stack');
      }

      var fn = this.createFunctionContext(asObject);
      if (!this.isChild) {
        var ret = {
          compiler: this.compilerInfo(),
          main: fn
        };
        var programs = this.context.programs;
        for (i = 0, l = programs.length; i < l; i++) {
          if (programs[i]) {
            ret[i] = programs[i];
          }
        }

        if (this.environment.usePartial) {
          ret.usePartial = true;
        }
        if (this.options.data) {
          ret.useData = true;
        }
        if (this.useDepths) {
          ret.useDepths = true;
        }
        if (this.options.compat) {
          ret.compat = true;
        }

        if (!asObject) {
          ret.compiler = JSON.stringify(ret.compiler);
          ret = this.objectLiteral(ret);
        }

        return ret;
      } else {
        return fn;
      }
    },

    preamble: function() {
      // track the last context pushed into place to allow skipping the
      // getContext opcode when it would be a noop
      this.lastContext = 0;
      this.source = [];
    },

    createFunctionContext: function(asObject) {
      var varDeclarations = '';

      var locals = this.stackVars.concat(this.registers.list);
      if(locals.length > 0) {
        varDeclarations += ", " + locals.join(", ");
      }

      // Generate minimizer alias mappings
      for (var alias in this.aliases) {
        if (this.aliases.hasOwnProperty(alias)) {
          varDeclarations += ', ' + alias + '=' + this.aliases[alias];
        }
      }

      var params = ["depth0", "helpers", "partials", "data"];

      if (this.useDepths) {
        params.push('depths');
      }

      // Perform a second pass over the output to merge content when possible
      var source = this.mergeSource(varDeclarations);

      if (asObject) {
        params.push(source);

        return Function.apply(this, params);
      } else {
        return 'function(' + params.join(',') + ') {\n  ' + source + '}';
      }
    },
    mergeSource: function(varDeclarations) {
      var source = '',
          buffer,
          appendOnly = !this.forceBuffer,
          appendFirst;

      for (var i = 0, len = this.source.length; i < len; i++) {
        var line = this.source[i];
        if (line.appendToBuffer) {
          if (buffer) {
            buffer = buffer + '\n    + ' + line.content;
          } else {
            buffer = line.content;
          }
        } else {
          if (buffer) {
            if (!source) {
              appendFirst = true;
              source = buffer + ';\n  ';
            } else {
              source += 'buffer += ' + buffer + ';\n  ';
            }
            buffer = undefined;
          }
          source += line + '\n  ';

          if (!this.environment.isSimple) {
            appendOnly = false;
          }
        }
      }

      if (appendOnly) {
        if (buffer || !source) {
          source += 'return ' + (buffer || '""') + ';\n';
        }
      } else {
        varDeclarations += ", buffer = " + (appendFirst ? '' : this.initializeBuffer());
        if (buffer) {
          source += 'return buffer + ' + buffer + ';\n';
        } else {
          source += 'return buffer;\n';
        }
      }

      if (varDeclarations) {
        source = 'var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n  ') + source;
      }

      return source;
    },

    // [blockValue]
    //
    // On stack, before: hash, inverse, program, value
    // On stack, after: return value of blockHelperMissing
    //
    // The purpose of this opcode is to take a block of the form
    // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
    // replace it on the stack with the result of properly
    // invoking blockHelperMissing.
    blockValue: function(name) {
      this.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      var params = [this.contextName(0)];
      this.setupParams(name, 0, params);

      var blockName = this.popStack();
      params.splice(1, 0, blockName);

      this.push('blockHelperMissing.call(' + params.join(', ') + ')');
    },

    // [ambiguousBlockValue]
    //
    // On stack, before: hash, inverse, program, value
    // Compiler value, before: lastHelper=value of last found helper, if any
    // On stack, after, if no lastHelper: same as [blockValue]
    // On stack, after, if lastHelper: value
    ambiguousBlockValue: function() {
      this.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      // We're being a bit cheeky and reusing the options value from the prior exec
      var params = [this.contextName(0)];
      this.setupParams('', 0, params, true);

      this.flushInline();

      var current = this.topStack();
      params.splice(1, 0, current);

      this.pushSource("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
    },

    // [appendContent]
    //
    // On stack, before: ...
    // On stack, after: ...
    //
    // Appends the string value of `content` to the current buffer
    appendContent: function(content) {
      if (this.pendingContent) {
        content = this.pendingContent + content;
      }

      this.pendingContent = content;
    },

    // [append]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Coerces `value` to a String and appends it to the current buffer.
    //
    // If `value` is truthy, or 0, it is coerced into a string and appended
    // Otherwise, the empty string is appended
    append: function() {
      // Force anything that is inlined onto the stack so we don't have duplication
      // when we examine local
      this.flushInline();
      var local = this.popStack();
      this.pushSource('if (' + local + ' != null) { ' + this.appendToBuffer(local) + ' }');
      if (this.environment.isSimple) {
        this.pushSource("else { " + this.appendToBuffer("''") + " }");
      }
    },

    // [appendEscaped]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Escape `value` and append it to the buffer
    appendEscaped: function() {
      this.aliases.escapeExpression = 'this.escapeExpression';

      this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
    },

    // [getContext]
    //
    // On stack, before: ...
    // On stack, after: ...
    // Compiler value, after: lastContext=depth
    //
    // Set the value of the `lastContext` compiler value to the depth
    getContext: function(depth) {
      this.lastContext = depth;
    },

    // [pushContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext, ...
    //
    // Pushes the value of the current context onto the stack.
    pushContext: function() {
      this.pushStackLiteral(this.contextName(this.lastContext));
    },

    // [lookupOnContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext[name], ...
    //
    // Looks up the value of `name` on the current context and pushes
    // it onto the stack.
    lookupOnContext: function(parts, falsy, scoped) {
      /*jshint -W083 */
      var i = 0,
          len = parts.length;

      if (!scoped && this.options.compat && !this.lastContext) {
        // The depthed query is expected to handle the undefined logic for the root level that
        // is implemented below, so we evaluate that directly in compat mode
        this.push(this.depthedLookup(parts[i++]));
      } else {
        this.pushContext();
      }

      for (; i < len; i++) {
        this.replaceStack(function(current) {
          var lookup = this.nameLookup(current, parts[i], 'context');
          // We want to ensure that zero and false are handled properly if the context (falsy flag)
          // needs to have the special handling for these values.
          if (!falsy) {
            return ' != null ? ' + lookup + ' : ' + current;
          } else {
            // Otherwise we can use generic falsy handling
            return ' && ' + lookup;
          }
        });
      }
    },

    // [lookupData]
    //
    // On stack, before: ...
    // On stack, after: data, ...
    //
    // Push the data lookup operator
    lookupData: function(depth, parts) {
      /*jshint -W083 */
      if (!depth) {
        this.pushStackLiteral('data');
      } else {
        this.pushStackLiteral('this.data(data, ' + depth + ')');
      }

      var len = parts.length;
      for (var i = 0; i < len; i++) {
        this.replaceStack(function(current) {
          return ' && ' + this.nameLookup(current, parts[i], 'data');
        });
      }
    },

    // [resolvePossibleLambda]
    //
    // On stack, before: value, ...
    // On stack, after: resolved value, ...
    //
    // If the `value` is a lambda, replace it on the stack by
    // the return value of the lambda
    resolvePossibleLambda: function() {
      this.aliases.lambda = 'this.lambda';

      this.push('lambda(' + this.popStack() + ', ' + this.contextName(0) + ')');
    },

    // [pushStringParam]
    //
    // On stack, before: ...
    // On stack, after: string, currentContext, ...
    //
    // This opcode is designed for use in string mode, which
    // provides the string value of a parameter along with its
    // depth rather than resolving it immediately.
    pushStringParam: function(string, type) {
      this.pushContext();
      this.pushString(type);

      // If it's a subexpression, the string result
      // will be pushed after this opcode.
      if (type !== 'sexpr') {
        if (typeof string === 'string') {
          this.pushString(string);
        } else {
          this.pushStackLiteral(string);
        }
      }
    },

    emptyHash: function() {
      this.pushStackLiteral('{}');

      if (this.trackIds) {
        this.push('{}'); // hashIds
      }
      if (this.stringParams) {
        this.push('{}'); // hashContexts
        this.push('{}'); // hashTypes
      }
    },
    pushHash: function() {
      if (this.hash) {
        this.hashes.push(this.hash);
      }
      this.hash = {values: [], types: [], contexts: [], ids: []};
    },
    popHash: function() {
      var hash = this.hash;
      this.hash = this.hashes.pop();

      if (this.trackIds) {
        this.push('{' + hash.ids.join(',') + '}');
      }
      if (this.stringParams) {
        this.push('{' + hash.contexts.join(',') + '}');
        this.push('{' + hash.types.join(',') + '}');
      }

      this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
    },

    // [pushString]
    //
    // On stack, before: ...
    // On stack, after: quotedString(string), ...
    //
    // Push a quoted version of `string` onto the stack
    pushString: function(string) {
      this.pushStackLiteral(this.quotedString(string));
    },

    // [push]
    //
    // On stack, before: ...
    // On stack, after: expr, ...
    //
    // Push an expression onto the stack
    push: function(expr) {
      this.inlineStack.push(expr);
      return expr;
    },

    // [pushLiteral]
    //
    // On stack, before: ...
    // On stack, after: value, ...
    //
    // Pushes a value onto the stack. This operation prevents
    // the compiler from creating a temporary variable to hold
    // it.
    pushLiteral: function(value) {
      this.pushStackLiteral(value);
    },

    // [pushProgram]
    //
    // On stack, before: ...
    // On stack, after: program(guid), ...
    //
    // Push a program expression onto the stack. This takes
    // a compile-time guid and converts it into a runtime-accessible
    // expression.
    pushProgram: function(guid) {
      if (guid != null) {
        this.pushStackLiteral(this.programExpression(guid));
      } else {
        this.pushStackLiteral(null);
      }
    },

    // [invokeHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // Pops off the helper's parameters, invokes the helper,
    // and pushes the helper's return value onto the stack.
    //
    // If the helper is not found, `helperMissing` is called.
    invokeHelper: function(paramSize, name, isSimple) {
      this.aliases.helperMissing = 'helpers.helperMissing';

      var nonHelper = this.popStack();
      var helper = this.setupHelper(paramSize, name);

      var lookup = (isSimple ? helper.name + ' || ' : '') + nonHelper + ' || helperMissing';
      this.push('((' + lookup + ').call(' + helper.callParams + '))');
    },

    // [invokeKnownHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // This operation is used when the helper is known to exist,
    // so a `helperMissing` fallback is not required.
    invokeKnownHelper: function(paramSize, name) {
      var helper = this.setupHelper(paramSize, name);
      this.push(helper.name + ".call(" + helper.callParams + ")");
    },

    // [invokeAmbiguous]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of disambiguation
    //
    // This operation is used when an expression like `{{foo}}`
    // is provided, but we don't know at compile-time whether it
    // is a helper or a path.
    //
    // This operation emits more code than the other options,
    // and can be avoided by passing the `knownHelpers` and
    // `knownHelpersOnly` flags at compile-time.
    invokeAmbiguous: function(name, helperCall) {
      this.aliases.functionType = '"function"';
      this.aliases.helperMissing = 'helpers.helperMissing';
      this.useRegister('helper');

      var nonHelper = this.popStack();

      this.emptyHash();
      var helper = this.setupHelper(0, name, helperCall);

      var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

      this.push(
        '((helper = (helper = ' + helperName + ' || ' + nonHelper + ') != null ? helper : helperMissing'
          + (helper.paramsInit ? '),(' + helper.paramsInit : '') + '),'
        + '(typeof helper === functionType ? helper.call(' + helper.callParams + ') : helper))');
    },

    // [invokePartial]
    //
    // On stack, before: context, ...
    // On stack after: result of partial invocation
    //
    // This operation pops off a context, invokes a partial with that context,
    // and pushes the result of the invocation back.
    invokePartial: function(name, indent) {
      var params = [this.nameLookup('partials', name, 'partial'), "'" + indent + "'", "'" + name + "'", this.popStack(), this.popStack(), "helpers", "partials"];

      if (this.options.data) {
        params.push("data");
      } else if (this.options.compat) {
        params.push('undefined');
      }
      if (this.options.compat) {
        params.push('depths');
      }

      this.push("this.invokePartial(" + params.join(", ") + ")");
    },

    // [assignToHash]
    //
    // On stack, before: value, ..., hash, ...
    // On stack, after: ..., hash, ...
    //
    // Pops a value off the stack and assigns it to the current hash
    assignToHash: function(key) {
      var value = this.popStack(),
          context,
          type,
          id;

      if (this.trackIds) {
        id = this.popStack();
      }
      if (this.stringParams) {
        type = this.popStack();
        context = this.popStack();
      }

      var hash = this.hash;
      if (context) {
        hash.contexts.push("'" + key + "': " + context);
      }
      if (type) {
        hash.types.push("'" + key + "': " + type);
      }
      if (id) {
        hash.ids.push("'" + key + "': " + id);
      }
      hash.values.push("'" + key + "': (" + value + ")");
    },

    pushId: function(type, name) {
      if (type === 'ID' || type === 'DATA') {
        this.pushString(name);
      } else if (type === 'sexpr') {
        this.pushStackLiteral('true');
      } else {
        this.pushStackLiteral('null');
      }
    },

    // HELPERS

    compiler: JavaScriptCompiler,

    compileChildren: function(environment, options) {
      var children = environment.children, child, compiler;

      for(var i=0, l=children.length; i<l; i++) {
        child = children[i];
        compiler = new this.compiler();

        var index = this.matchExistingProgram(child);

        if (index == null) {
          this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
          index = this.context.programs.length;
          child.index = index;
          child.name = 'program' + index;
          this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
          this.context.environments[index] = child;

          this.useDepths = this.useDepths || compiler.useDepths;
        } else {
          child.index = index;
          child.name = 'program' + index;
        }
      }
    },
    matchExistingProgram: function(child) {
      for (var i = 0, len = this.context.environments.length; i < len; i++) {
        var environment = this.context.environments[i];
        if (environment && environment.equals(child)) {
          return i;
        }
      }
    },

    programExpression: function(guid) {
      var child = this.environment.children[guid],
          depths = child.depths.list,
          useDepths = this.useDepths,
          depth;

      var programParams = [child.index, 'data'];

      if (useDepths) {
        programParams.push('depths');
      }

      return 'this.program(' + programParams.join(', ') + ')';
    },

    useRegister: function(name) {
      if(!this.registers[name]) {
        this.registers[name] = true;
        this.registers.list.push(name);
      }
    },

    pushStackLiteral: function(item) {
      return this.push(new Literal(item));
    },

    pushSource: function(source) {
      if (this.pendingContent) {
        this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent)));
        this.pendingContent = undefined;
      }

      if (source) {
        this.source.push(source);
      }
    },

    pushStack: function(item) {
      this.flushInline();

      var stack = this.incrStack();
      this.pushSource(stack + " = " + item + ";");
      this.compileStack.push(stack);
      return stack;
    },

    replaceStack: function(callback) {
      var prefix = '',
          inline = this.isInline(),
          stack,
          createdStack,
          usedLiteral;

      /* istanbul ignore next */
      if (!this.isInline()) {
        throw new Exception('replaceStack on non-inline');
      }

      // We want to merge the inline statement into the replacement statement via ','
      var top = this.popStack(true);

      if (top instanceof Literal) {
        // Literals do not need to be inlined
        prefix = stack = top.value;
        usedLiteral = true;
      } else {
        // Get or create the current stack name for use by the inline
        createdStack = !this.stackSlot;
        var name = !createdStack ? this.topStackName() : this.incrStack();

        prefix = '(' + this.push(name) + ' = ' + top + ')';
        stack = this.topStack();
      }

      var item = callback.call(this, stack);

      if (!usedLiteral) {
        this.popStack();
      }
      if (createdStack) {
        this.stackSlot--;
      }
      this.push('(' + prefix + item + ')');
    },

    incrStack: function() {
      this.stackSlot++;
      if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
      return this.topStackName();
    },
    topStackName: function() {
      return "stack" + this.stackSlot;
    },
    flushInline: function() {
      var inlineStack = this.inlineStack;
      if (inlineStack.length) {
        this.inlineStack = [];
        for (var i = 0, len = inlineStack.length; i < len; i++) {
          var entry = inlineStack[i];
          if (entry instanceof Literal) {
            this.compileStack.push(entry);
          } else {
            this.pushStack(entry);
          }
        }
      }
    },
    isInline: function() {
      return this.inlineStack.length;
    },

    popStack: function(wrapped) {
      var inline = this.isInline(),
          item = (inline ? this.inlineStack : this.compileStack).pop();

      if (!wrapped && (item instanceof Literal)) {
        return item.value;
      } else {
        if (!inline) {
          /* istanbul ignore next */
          if (!this.stackSlot) {
            throw new Exception('Invalid stack pop');
          }
          this.stackSlot--;
        }
        return item;
      }
    },

    topStack: function() {
      var stack = (this.isInline() ? this.inlineStack : this.compileStack),
          item = stack[stack.length - 1];

      if (item instanceof Literal) {
        return item.value;
      } else {
        return item;
      }
    },

    contextName: function(context) {
      if (this.useDepths && context) {
        return 'depths[' + context + ']';
      } else {
        return 'depth' + context;
      }
    },

    quotedString: function(str) {
      return '"' + str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\u2028/g, '\\u2028')   // Per Ecma-262 7.3 + 7.8.4
        .replace(/\u2029/g, '\\u2029') + '"';
    },

    objectLiteral: function(obj) {
      var pairs = [];

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          pairs.push(this.quotedString(key) + ':' + obj[key]);
        }
      }

      return '{' + pairs.join(',') + '}';
    },

    setupHelper: function(paramSize, name, blockHelper) {
      var params = [],
          paramsInit = this.setupParams(name, paramSize, params, blockHelper);
      var foundHelper = this.nameLookup('helpers', name, 'helper');

      return {
        params: params,
        paramsInit: paramsInit,
        name: foundHelper,
        callParams: [this.contextName(0)].concat(params).join(", ")
      };
    },

    setupOptions: function(helper, paramSize, params) {
      var options = {}, contexts = [], types = [], ids = [], param, inverse, program;

      options.name = this.quotedString(helper);
      options.hash = this.popStack();

      if (this.trackIds) {
        options.hashIds = this.popStack();
      }
      if (this.stringParams) {
        options.hashTypes = this.popStack();
        options.hashContexts = this.popStack();
      }

      inverse = this.popStack();
      program = this.popStack();

      // Avoid setting fn and inverse if neither are set. This allows
      // helpers to do a check for `if (options.fn)`
      if (program || inverse) {
        if (!program) {
          program = 'this.noop';
        }

        if (!inverse) {
          inverse = 'this.noop';
        }

        options.fn = program;
        options.inverse = inverse;
      }

      // The parameters go on to the stack in order (making sure that they are evaluated in order)
      // so we need to pop them off the stack in reverse order
      var i = paramSize;
      while (i--) {
        param = this.popStack();
        params[i] = param;

        if (this.trackIds) {
          ids[i] = this.popStack();
        }
        if (this.stringParams) {
          types[i] = this.popStack();
          contexts[i] = this.popStack();
        }
      }

      if (this.trackIds) {
        options.ids = "[" + ids.join(",") + "]";
      }
      if (this.stringParams) {
        options.types = "[" + types.join(",") + "]";
        options.contexts = "[" + contexts.join(",") + "]";
      }

      if (this.options.data) {
        options.data = "data";
      }

      return options;
    },

    // the params and contexts arguments are passed in arrays
    // to fill in
    setupParams: function(helperName, paramSize, params, useRegister) {
      var options = this.objectLiteral(this.setupOptions(helperName, paramSize, params));

      if (useRegister) {
        this.useRegister('options');
        params.push('options');
        return 'options=' + options;
      } else {
        params.push(options);
        return '';
      }
    }
  };

  var reservedWords = (
    "break else new var" +
    " case finally return void" +
    " catch for switch while" +
    " continue function this with" +
    " default if throw" +
    " delete in try" +
    " do instanceof typeof" +
    " abstract enum int short" +
    " boolean export interface static" +
    " byte extends long super" +
    " char final native synchronized" +
    " class float package throws" +
    " const goto private transient" +
    " debugger implements protected volatile" +
    " double import public let yield"
  ).split(" ");

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for(var i=0, l=reservedWords.length; i<l; i++) {
    compilerWords[reservedWords[i]] = true;
  }

  JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
    return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
  };

  __exports__ = JavaScriptCompiler;
  return __exports__;
})(__module2__, __module5__);

// handlebars.js
var __module0__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  /*globals Handlebars: true */
  var Handlebars = __dependency1__;

  // Compiler imports
  var AST = __dependency2__;
  var Parser = __dependency3__.parser;
  var parse = __dependency3__.parse;
  var Compiler = __dependency4__.Compiler;
  var compile = __dependency4__.compile;
  var precompile = __dependency4__.precompile;
  var JavaScriptCompiler = __dependency5__;

  var _create = Handlebars.create;
  var create = function() {
    var hb = _create();

    hb.compile = function(input, options) {
      return compile(input, options, hb);
    };
    hb.precompile = function (input, options) {
      return precompile(input, options, hb);
    };

    hb.AST = AST;
    hb.Compiler = Compiler;
    hb.JavaScriptCompiler = JavaScriptCompiler;
    hb.Parser = Parser;
    hb.parse = parse;

    return hb;
  };

  Handlebars = create();
  Handlebars.create = create;

  Handlebars['default'] = Handlebars;

  __exports__ = Handlebars;
  return __exports__;
})(__module1__, __module7__, __module8__, __module11__, __module12__);

  return __module0__;
}));


/**
  * Klass.js - copyright @dedfat
  * version 1.0
  * https://github.com/ded/klass
  * Follow our software http://twitter.com/dedfat :)
  * MIT License
  */
!function(a,b){function j(a,b){function c(){}c[e]=this[e];var d=this,g=new c,h=f(a),j=h?a:this,k=h?{}:a,l=function(){this.initialize?this.initialize.apply(this,arguments):(b||h&&d.apply(this,arguments),j.apply(this,arguments))};l.methods=function(a){i(g,a,d),l[e]=g;return this},l.methods.call(l,k).prototype.constructor=l,l.extend=arguments.callee,l[e].implement=l.statics=function(a,b){a=typeof a=="string"?function(){var c={};c[a]=b;return c}():a,i(this,a,d);return this};return l}function i(a,b,d){for(var g in b)b.hasOwnProperty(g)&&(a[g]=f(b[g])&&f(d[e][g])&&c.test(b[g])?h(g,b[g],d):b[g])}function h(a,b,c){return function(){var d=this.supr;this.supr=c[e][a];var f=b.apply(this,arguments);this.supr=d;return f}}function g(a){return j.call(f(a)?a:d,a,1)}var c=/xyz/.test(function(){xyz})?/\bsupr\b/:/.*/,d=function(){},e="prototype",f=function(a){return typeof a===b};if(typeof module!="undefined"&&module.exports)module.exports=g;else{var k=a.klass;g.noConflict=function(){a.klass=k;return this},a.klass=g}}(this,"function")


// PhotoSwipe - http://www.photoswipe.com/
// Copyright (c) 2012 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 3.0.5
(function(e){if(!Function.prototype.bind)Function.prototype.bind=function(d){var a=[].slice,b=a.call(arguments,1),c=this,g=function(){},f=function(){return c.apply(this instanceof g?this:d||{},b.concat(a.call(arguments)))};g.prototype=c.prototype;f.prototype=new g;return f};if(typeof e.Code==="undefined")e.Code={};e.Code.Util={registerNamespace:function(){var d=arguments,a=null,b,c,g,f,i;b=0;for(f=d.length;b<f;b++){g=d[b];g=g.split(".");a=g[0];typeof e[a]==="undefined"&&(e[a]={});a=e[a];c=1;for(i=
g.length;c<i;++c)a[g[c]]=a[g[c]]||{},a=a[g[c]]}},coalesce:function(){var d,a;d=0;for(a=arguments.length;d<a;d++)if(!this.isNothing(arguments[d]))return arguments[d];return null},extend:function(d,a,b){var c;this.isNothing(b)&&(b=!0);if(d&&a&&this.isObject(a))for(c in a)this.objectHasProperty(a,c)&&(b?d[c]=a[c]:typeof d[c]==="undefined"&&(d[c]=a[c]))},clone:function(d){var a={};this.extend(a,d);return a},isObject:function(d){return d instanceof Object},isFunction:function(d){return{}.toString.call(d)===
"[object Function]"},isArray:function(d){return d instanceof Array},isLikeArray:function(d){return typeof d.length==="number"},isNumber:function(d){return typeof d==="number"},isString:function(d){return typeof d==="string"},isNothing:function(d){if(typeof d==="undefined"||d===null)return!0;return!1},swapArrayElements:function(d,a,b){var c=d[a];d[a]=d[b];d[b]=c},trim:function(d){return d.replace(/^\s\s*/,"").replace(/\s\s*$/,"")},toCamelCase:function(d){return d.replace(/(\-[a-z])/g,function(a){return a.toUpperCase().replace("-",
"")})},toDashedCase:function(d){return d.replace(/([A-Z])/g,function(a){return"-"+a.toLowerCase()})},arrayIndexOf:function(d,a,b){var c,g,f,e;f=-1;c=0;for(g=a.length;c<g;c++)if(e=a[c],this.isNothing(b)){if(e===d){f=c;break}}else if(this.objectHasProperty(e,b)&&e[b]===d){f=c;break}return f},objectHasProperty:function(d,a){return d.hasOwnProperty?d.hasOwnProperty(a):"undefined"!==typeof d[a]}}})(window);
(function(e,d){d.Browser={ua:null,version:null,safari:null,webkit:null,opera:null,msie:null,chrome:null,mozilla:null,android:null,blackberry:null,iPad:null,iPhone:null,iPod:null,iOS:null,is3dSupported:null,isCSSTransformSupported:null,isTouchSupported:null,isGestureSupported:null,_detect:function(){this.ua=e.navigator.userAgent;this.version=this.ua.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)||[];this.safari=/Safari/gi.test(e.navigator.appVersion);this.webkit=/webkit/i.test(this.ua);this.opera=/opera/i.test(this.ua);
this.msie=/msie/i.test(this.ua)&&!this.opera;this.chrome=/Chrome/i.test(this.ua);this.firefox=/Firefox/i.test(this.ua);this.fennec=/Fennec/i.test(this.ua);this.mozilla=/mozilla/i.test(this.ua)&&!/(compatible|webkit)/.test(this.ua);this.android=/android/i.test(this.ua);this.blackberry=/blackberry/i.test(this.ua);this.iOS=/iphone|ipod|ipad/gi.test(e.navigator.platform);this.iPad=/ipad/gi.test(e.navigator.platform);this.iPhone=/iphone/gi.test(e.navigator.platform);this.iPod=/ipod/gi.test(e.navigator.platform);
var a=document.createElement("div");this.is3dSupported=!d.isNothing(a.style.WebkitPerspective);this.isCSSTransformSupported=!d.isNothing(a.style.WebkitTransform)||!d.isNothing(a.style.MozTransform)||!d.isNothing(a.style.transformProperty);this.isTouchSupported=this.isEventSupported("touchstart");this.isGestureSupported=this.isEventSupported("gesturestart")},_eventTagNames:{select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"},isEventSupported:function(a){var b=
document.createElement(this._eventTagNames[a]||"div"),c,a="on"+a;c=d.objectHasProperty(b,a);c||(b.setAttribute(a,"return;"),c=typeof b[a]==="function");return c},isLandscape:function(){return d.DOM.windowWidth()>d.DOM.windowHeight()}};d.Browser._detect()})(window,window.Code.Util);
(function(e,d,a){a.extend(a,{Events:{add:function(a,c,g){d(a).bind(c,g)},remove:function(a,c,g){d(a).unbind(c,g)},fire:function(a,c){var g,f=Array.prototype.slice.call(arguments).splice(2);g=typeof c==="string"?{type:c}:c;d(a).trigger(d.Event(g.type,g),f)},getMousePosition:function(a){return{x:a.pageX,y:a.pageY}},getTouchEvent:function(a){return a.originalEvent},getWheelDelta:function(b){var c=0;a.isNothing(b.wheelDelta)?a.isNothing(b.detail)||(c=-b.detail/3):c=b.wheelDelta/120;return c},domReady:function(a){d(document).ready(a)}}})})(window,
window.jQuery,window.Code.Util);
(function(e,d,a){a.extend(a,{DOM:{setData:function(b,c,g){if(a.isLikeArray(b)){var f,d;f=0;for(d=b.length;f<d;f++)a.DOM._setData(b[f],c,g)}else a.DOM._setData(b,c,g)},_setData:function(b,c,g){a.DOM.setAttribute(b,"data-"+c,g)},getData:function(b,c,g){return a.DOM.getAttribute(b,"data-"+c,g)},removeData:function(b,c){if(a.isLikeArray(b)){var g,f;g=0;for(f=b.length;g<f;g++)a.DOM._removeData(b[g],c)}else a.DOM._removeData(b,c)},_removeData:function(b,c){a.DOM.removeAttribute(b,"data-"+c)},isChildOf:function(a,
c){if(c===a)return!1;for(;a&&a!==c;)a=a.parentNode;return a===c},find:function(b,c){if(a.isNothing(c))c=e.document;var g=d(b,c),f=[],i,j;i=0;for(j=g.length;i<j;i++)f.push(g[i]);return f},createElement:function(a,c,g){a=d("<"+a+"></"+a+">");a.attr(c);a.append(g);return a[0]},appendChild:function(a,c){d(c).append(a)},insertBefore:function(a,c){d(a).insertBefore(c)},appendText:function(a,c){d(c).text(a)},appendToBody:function(a){d("body").append(a)},removeChild:function(a){d(a).empty().remove()},removeChildren:function(a){d(a).empty()},
hasAttribute:function(b,c){return!a.isNothing(d(b).attr(c))},getAttribute:function(b,c,g){b=d(b).attr(c);a.isNothing(b)&&!a.isNothing(g)&&(b=g);return b},setAttribute:function(b,c,g){if(a.isLikeArray(b)){var f,d;f=0;for(d=b.length;f<d;f++)a.DOM._setAttribute(b[f],c,g)}else a.DOM._setAttribute(b,c,g)},_setAttribute:function(a,c,g){d(a).attr(c,g)},removeAttribute:function(b,c){if(a.isLikeArray(b)){var g,f;g=0;for(f=b.length;g<f;g++)a.DOM._removeAttribute(b[g],c)}else a.DOM._removeAttribute(b,c)},_removeAttribute:function(a,
c){d(a).removeAttr(c)},addClass:function(b,c){if(a.isLikeArray(b)){var g,f;g=0;for(f=b.length;g<f;g++)a.DOM._addClass(b[g],c)}else a.DOM._addClass(b,c)},_addClass:function(a,c){d(a).addClass(c)},removeClass:function(b,c){if(a.isLikeArray(b)){var g,f;g=0;for(f=b.length;g<f;g++)a.DOM._removeClass(b[g],c)}else a.DOM._removeClass(b,c)},_removeClass:function(a,c){d(a).removeClass(c)},hasClass:function(a,c){d(a).hasClass(c)},setStyle:function(b,c,g){if(a.isLikeArray(b)){var f,d;f=0;for(d=b.length;f<d;f++)a.DOM._setStyle(b[f],
c,g)}else a.DOM._setStyle(b,c,g)},_setStyle:function(b,c,g){var f;if(a.isObject(c))for(f in c)a.objectHasProperty(c,f)&&(f==="width"?a.DOM.width(b,c[f]):f==="height"?a.DOM.height(b,c[f]):d(b).css(f,c[f]));else d(b).css(c,g)},getStyle:function(a,c){return d(a).css(c)},hide:function(b){if(a.isLikeArray(b)){var c,g;c=0;for(g=b.length;c<g;c++)a.DOM._hide(b[c])}else a.DOM._hide(b)},_hide:function(a){d(a).hide()},show:function(b){if(a.isLikeArray(b)){var c,g;c=0;for(g=b.length;c<g;c++)a.DOM._show(b[c])}else a.DOM._show(b)},
_show:function(a){d(a).show()},width:function(b,c){a.isNothing(c)||d(b).width(c);return d(b).width()},outerWidth:function(a){return d(a).outerWidth()},height:function(b,c){a.isNothing(c)||d(b).height(c);return d(b).height()},outerHeight:function(a){return d(a).outerHeight()},documentWidth:function(){return d(document.documentElement).width()},documentHeight:function(){return d(document.documentElement).height()},documentOuterWidth:function(){return a.DOM.width(document.documentElement)},documentOuterHeight:function(){return a.DOM.outerHeight(document.documentElement)},
bodyWidth:function(){return d(document.body).width()},bodyHeight:function(){return d(document.body).height()},bodyOuterWidth:function(){return a.DOM.outerWidth(document.body)},bodyOuterHeight:function(){return a.DOM.outerHeight(document.body)},windowWidth:function(){if(!e.innerWidth)return d(e).width();return e.innerWidth},windowHeight:function(){if(!e.innerHeight)return d(e).height();return e.innerHeight},windowScrollLeft:function(){if(!e.pageXOffset)return d(e).scrollLeft();return e.pageXOffset},
windowScrollTop:function(){if(!e.pageYOffset)return d(e).scrollTop();return e.pageYOffset}}})})(window,window.jQuery,window.Code.Util);
(function(e,d){d.extend(d,{Animation:{_applyTransitionDelay:50,_transitionEndLabel:e.document.documentElement.style.webkitTransition!==void 0?"webkitTransitionEnd":"transitionend",_transitionEndHandler:null,_transitionPrefix:e.document.documentElement.style.webkitTransition!==void 0?"webkitTransition":e.document.documentElement.style.MozTransition!==void 0?"MozTransition":"transition",_transformLabel:e.document.documentElement.style.webkitTransform!==void 0?"webkitTransform":e.document.documentElement.style.MozTransition!==
void 0?"MozTransform":"transform",_getTransitionEndHandler:function(){if(d.isNothing(this._transitionEndHandler))this._transitionEndHandler=this._onTransitionEnd.bind(this);return this._transitionEndHandler},stop:function(a){if(d.Browser.isCSSTransformSupported){var b={};d.Events.remove(a,this._transitionEndLabel,this._getTransitionEndHandler());d.isNothing(a.callbackLabel)&&delete a.callbackLabel;b[this._transitionPrefix+"Property"]="";b[this._transitionPrefix+"Duration"]="";b[this._transitionPrefix+
"TimingFunction"]="";b[this._transitionPrefix+"Delay"]="";b[this._transformLabel]="";d.DOM.setStyle(a,b)}else d.isNothing(e.jQuery)||e.jQuery(a).stop(!0,!0)},fadeIn:function(a,b,c,g,f){f=d.coalesce(f,1);f<=0&&(f=1);if(b<=0&&(d.DOM.setStyle(a,"opacity",f),!d.isNothing(c))){c(a);return}d.DOM.getStyle(a,"opacity")>=1&&d.DOM.setStyle(a,"opacity",0);d.Browser.isCSSTransformSupported?this._applyTransition(a,"opacity",f,b,c,g):d.isNothing(e.jQuery)||e.jQuery(a).fadeTo(b,f,c)},fadeTo:function(a,b,c,g,f){this.fadeIn(a,
c,g,f,b)},fadeOut:function(a,b,c,g){if(b<=0&&(d.DOM.setStyle(a,"opacity",0),!d.isNothing(c))){c(a);return}d.Browser.isCSSTransformSupported?this._applyTransition(a,"opacity",0,b,c,g):e.jQuery(a).fadeTo(b,0,c)},slideBy:function(a,b,c,g,f,i){var j={},b=d.coalesce(b,0),c=d.coalesce(c,0),i=d.coalesce(i,"ease-out");j[this._transitionPrefix+"Property"]="all";j[this._transitionPrefix+"Delay"]="0";g===0?(j[this._transitionPrefix+"Duration"]="",j[this._transitionPrefix+"TimingFunction"]=""):(j[this._transitionPrefix+
"Duration"]=g+"ms",j[this._transitionPrefix+"TimingFunction"]=d.coalesce(i,"ease-out"),d.Events.add(a,this._transitionEndLabel,this._getTransitionEndHandler()));j[this._transformLabel]=d.Browser.is3dSupported?"translate3d("+b+"px, "+c+"px, 0px)":"translate("+b+"px, "+c+"px)";if(!d.isNothing(f))a.cclallcallback=f;d.DOM.setStyle(a,j);g===0&&e.setTimeout(function(){this._leaveTransforms(a)}.bind(this),this._applyTransitionDelay)},resetTranslate:function(a){var b={};b[this._transformLabel]=b[this._transformLabel]=
d.Browser.is3dSupported?"translate3d(0px, 0px, 0px)":"translate(0px, 0px)";d.DOM.setStyle(a,b)},_applyTransition:function(a,b,c,g,f,i){var j={},i=d.coalesce(i,"ease-in");j[this._transitionPrefix+"Property"]=b;j[this._transitionPrefix+"Duration"]=g+"ms";j[this._transitionPrefix+"TimingFunction"]=i;j[this._transitionPrefix+"Delay"]="0";d.Events.add(a,this._transitionEndLabel,this._getTransitionEndHandler());d.DOM.setStyle(a,j);d.isNothing(f)||(a["ccl"+b+"callback"]=f);e.setTimeout(function(){d.DOM.setStyle(a,
b,c)},this._applyTransitionDelay)},_onTransitionEnd:function(a){d.Events.remove(a.currentTarget,this._transitionEndLabel,this._getTransitionEndHandler());this._leaveTransforms(a.currentTarget)},_leaveTransforms:function(a){var b=a.style[this._transitionPrefix+"Property"],c=b!==""?"ccl"+b+"callback":"cclallcallback",g,b=d.coalesce(a.style.webkitTransform,a.style.MozTransform,a.style.transform),f,i=e.parseInt(d.DOM.getStyle(a,"left"),0),j=e.parseInt(d.DOM.getStyle(a,"top"),0),h,l,k={};b!==""&&(b=d.Browser.is3dSupported?
b.match(/translate3d\((.*?)\)/):b.match(/translate\((.*?)\)/),d.isNothing(b)||(f=b[1].split(", "),h=e.parseInt(f[0],0),l=e.parseInt(f[1],0)));k[this._transitionPrefix+"Property"]="";k[this._transitionPrefix+"Duration"]="";k[this._transitionPrefix+"TimingFunction"]="";k[this._transitionPrefix+"Delay"]="";d.DOM.setStyle(a,k);e.setTimeout(function(){if(!d.isNothing(f))k={},k[this._transformLabel]="",k.left=i+h+"px",k.top=j+l+"px",d.DOM.setStyle(a,k);d.isNothing(a[c])||(g=a[c],delete a[c],g(a))}.bind(this),
this._applyTransitionDelay)}}})})(window,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.Util.TouchElement");a.TouchElement.EventTypes={onTouch:"CodeUtilTouchElementOnTouch"};a.TouchElement.ActionTypes={touchStart:"touchStart",touchMove:"touchMove",touchEnd:"touchEnd",touchMoveEnd:"touchMoveEnd",tap:"tap",doubleTap:"doubleTap",swipeLeft:"swipeLeft",swipeRight:"swipeRight",swipeUp:"swipeUp",swipeDown:"swipeDown",gestureStart:"gestureStart",gestureChange:"gestureChange",gestureEnd:"gestureEnd"}})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.Util.TouchElement");a.TouchElement.TouchElementClass=d({el:null,captureSettings:null,touchStartPoint:null,touchEndPoint:null,touchStartTime:null,doubleTapTimeout:null,touchStartHandler:null,touchMoveHandler:null,touchEndHandler:null,mouseDownHandler:null,mouseMoveHandler:null,mouseUpHandler:null,mouseOutHandler:null,gestureStartHandler:null,gestureChangeHandler:null,gestureEndHandler:null,swipeThreshold:null,swipeTimeThreshold:null,doubleTapSpeed:null,dispose:function(){var b;
this.removeEventHandlers();for(b in this)a.objectHasProperty(this,b)&&(this[b]=null)},initialize:function(b,c){this.el=b;this.captureSettings={swipe:!1,move:!1,gesture:!1,doubleTap:!1,preventDefaultTouchEvents:!0};a.extend(this.captureSettings,c);this.swipeThreshold=50;this.doubleTapSpeed=this.swipeTimeThreshold=250;this.touchStartPoint={x:0,y:0};this.touchEndPoint={x:0,y:0}},addEventHandlers:function(){if(a.isNothing(this.touchStartHandler))this.touchStartHandler=this.onTouchStart.bind(this),this.touchMoveHandler=
this.onTouchMove.bind(this),this.touchEndHandler=this.onTouchEnd.bind(this),this.mouseDownHandler=this.onMouseDown.bind(this),this.mouseMoveHandler=this.onMouseMove.bind(this),this.mouseUpHandler=this.onMouseUp.bind(this),this.mouseOutHandler=this.onMouseOut.bind(this),this.gestureStartHandler=this.onGestureStart.bind(this),this.gestureChangeHandler=this.onGestureChange.bind(this),this.gestureEndHandler=this.onGestureEnd.bind(this);a.Events.add(this.el,"touchstart",this.touchStartHandler);this.captureSettings.move&&
a.Events.add(this.el,"touchmove",this.touchMoveHandler);a.Events.add(this.el,"touchend",this.touchEndHandler);a.Events.add(this.el,"mousedown",this.mouseDownHandler);a.Browser.isGestureSupported&&this.captureSettings.gesture&&(a.Events.add(this.el,"gesturestart",this.gestureStartHandler),a.Events.add(this.el,"gesturechange",this.gestureChangeHandler),a.Events.add(this.el,"gestureend",this.gestureEndHandler))},removeEventHandlers:function(){a.Events.remove(this.el,"touchstart",this.touchStartHandler);
this.captureSettings.move&&a.Events.remove(this.el,"touchmove",this.touchMoveHandler);a.Events.remove(this.el,"touchend",this.touchEndHandler);a.Events.remove(this.el,"mousedown",this.mouseDownHandler);a.Browser.isGestureSupported&&this.captureSettings.gesture&&(a.Events.remove(this.el,"gesturestart",this.gestureStartHandler),a.Events.remove(this.el,"gesturechange",this.gestureChangeHandler),a.Events.remove(this.el,"gestureend",this.gestureEndHandler))},getTouchPoint:function(a){return{x:a[0].pageX,
y:a[0].pageY}},fireTouchEvent:function(b){var c=0,g=0,f=0,d,c=this.touchEndPoint.x-this.touchStartPoint.x,g=this.touchEndPoint.y-this.touchStartPoint.y,f=Math.sqrt(c*c+g*g);if(this.captureSettings.swipe&&(d=new Date,d-=this.touchStartTime,d<=this.swipeTimeThreshold)){if(e.Math.abs(c)>=this.swipeThreshold){a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,point:this.touchEndPoint,action:c<0?a.TouchElement.ActionTypes.swipeLeft:a.TouchElement.ActionTypes.swipeRight,targetEl:b.target,
currentTargetEl:b.currentTarget});return}if(e.Math.abs(g)>=this.swipeThreshold){a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,point:this.touchEndPoint,action:g<0?a.TouchElement.ActionTypes.swipeUp:a.TouchElement.ActionTypes.swipeDown,targetEl:b.target,currentTargetEl:b.currentTarget});return}}f>1?a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,action:a.TouchElement.ActionTypes.touchMoveEnd,point:this.touchEndPoint,targetEl:b.target,currentTargetEl:b.currentTarget}):
this.captureSettings.doubleTap?a.isNothing(this.doubleTapTimeout)?this.doubleTapTimeout=e.setTimeout(function(){this.doubleTapTimeout=null;a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,point:this.touchEndPoint,action:a.TouchElement.ActionTypes.tap,targetEl:b.target,currentTargetEl:b.currentTarget})}.bind(this),this.doubleTapSpeed):(e.clearTimeout(this.doubleTapTimeout),this.doubleTapTimeout=null,a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,point:this.touchEndPoint,
action:a.TouchElement.ActionTypes.doubleTap,targetEl:b.target,currentTargetEl:b.currentTarget})):a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,point:this.touchEndPoint,action:a.TouchElement.ActionTypes.tap,targetEl:b.target,currentTargetEl:b.currentTarget})},onTouchStart:function(b){this.captureSettings.preventDefaultTouchEvents&&b.preventDefault();a.Events.remove(this.el,"mousedown",this.mouseDownHandler);var c=a.Events.getTouchEvent(b).touches;c.length>1&&this.captureSettings.gesture?
this.isGesture=!0:(this.touchStartTime=new Date,this.isGesture=!1,this.touchStartPoint=this.getTouchPoint(c),a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,action:a.TouchElement.ActionTypes.touchStart,point:this.touchStartPoint,targetEl:b.target,currentTargetEl:b.currentTarget}))},onTouchMove:function(b){this.captureSettings.preventDefaultTouchEvents&&b.preventDefault();if(!this.isGesture||!this.captureSettings.gesture){var c=a.Events.getTouchEvent(b).touches;a.Events.fire(this,
{type:a.TouchElement.EventTypes.onTouch,target:this,action:a.TouchElement.ActionTypes.touchMove,point:this.getTouchPoint(c),targetEl:b.target,currentTargetEl:b.currentTarget})}},onTouchEnd:function(b){if(!this.isGesture||!this.captureSettings.gesture){this.captureSettings.preventDefaultTouchEvents&&b.preventDefault();var c=a.Events.getTouchEvent(b);this.touchEndPoint=this.getTouchPoint(!a.isNothing(c.changedTouches)?c.changedTouches:c.touches);a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,
target:this,action:a.TouchElement.ActionTypes.touchEnd,point:this.touchEndPoint,targetEl:b.target,currentTargetEl:b.currentTarget});this.fireTouchEvent(b)}},onMouseDown:function(b){b.preventDefault();a.Events.remove(this.el,"touchstart",this.mouseDownHandler);a.Events.remove(this.el,"touchmove",this.touchMoveHandler);a.Events.remove(this.el,"touchend",this.touchEndHandler);this.captureSettings.move&&a.Events.add(this.el,"mousemove",this.mouseMoveHandler);a.Events.add(this.el,"mouseup",this.mouseUpHandler);
a.Events.add(this.el,"mouseout",this.mouseOutHandler);this.touchStartTime=new Date;this.isGesture=!1;this.touchStartPoint=a.Events.getMousePosition(b);a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,action:a.TouchElement.ActionTypes.touchStart,point:this.touchStartPoint,targetEl:b.target,currentTargetEl:b.currentTarget})},onMouseMove:function(b){b.preventDefault();a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,action:a.TouchElement.ActionTypes.touchMove,
point:a.Events.getMousePosition(b),targetEl:b.target,currentTargetEl:b.currentTarget})},onMouseUp:function(b){b.preventDefault();this.captureSettings.move&&a.Events.remove(this.el,"mousemove",this.mouseMoveHandler);a.Events.remove(this.el,"mouseup",this.mouseUpHandler);a.Events.remove(this.el,"mouseout",this.mouseOutHandler);this.touchEndPoint=a.Events.getMousePosition(b);a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,action:a.TouchElement.ActionTypes.touchEnd,point:this.touchEndPoint,
targetEl:b.target,currentTargetEl:b.currentTarget});this.fireTouchEvent(b)},onMouseOut:function(b){var c=b.relatedTarget;if(!(this.el===c||a.DOM.isChildOf(c,this.el)))b.preventDefault(),this.captureSettings.move&&a.Events.remove(this.el,"mousemove",this.mouseMoveHandler),a.Events.remove(this.el,"mouseup",this.mouseUpHandler),a.Events.remove(this.el,"mouseout",this.mouseOutHandler),this.touchEndPoint=a.Events.getMousePosition(b),a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,
action:a.TouchElement.ActionTypes.touchEnd,point:this.touchEndPoint,targetEl:b.target,currentTargetEl:b.currentTarget}),this.fireTouchEvent(b)},onGestureStart:function(b){b.preventDefault();var c=a.Events.getTouchEvent(b);a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,action:a.TouchElement.ActionTypes.gestureStart,scale:c.scale,rotation:c.rotation,targetEl:b.target,currentTargetEl:b.currentTarget})},onGestureChange:function(b){b.preventDefault();var c=a.Events.getTouchEvent(b);
a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,action:a.TouchElement.ActionTypes.gestureChange,scale:c.scale,rotation:c.rotation,targetEl:b.target,currentTargetEl:b.currentTarget})},onGestureEnd:function(b){b.preventDefault();var c=a.Events.getTouchEvent(b);a.Events.fire(this,{type:a.TouchElement.EventTypes.onTouch,target:this,action:a.TouchElement.ActionTypes.gestureEnd,scale:c.scale,rotation:c.rotation,targetEl:b.target,currentTargetEl:b.currentTarget})}})})(window,window.klass,
window.Code.Util);(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.Image");e.Code.PhotoSwipe.Image.EventTypes={onLoad:"onLoad",onError:"onError"}})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.Image");var b=e.Code.PhotoSwipe;b.Image.ImageClass=d({refObj:null,imageEl:null,src:null,caption:null,metaData:null,imageLoadHandler:null,imageErrorHandler:null,dispose:function(){var c;this.shrinkImage();for(c in this)a.objectHasProperty(this,c)&&(this[c]=null)},initialize:function(a,b,f,d){this.refObj=a;this.src=this.originalSrc=b;this.caption=f;this.metaData=d;this.imageEl=new e.Image;this.imageLoadHandler=this.onImageLoad.bind(this);this.imageErrorHandler=
this.onImageError.bind(this)},load:function(){this.imageEl.originalSrc=a.coalesce(this.imageEl.originalSrc,"");this.imageEl.originalSrc===this.src?this.imageEl.isError?a.Events.fire(this,{type:b.Image.EventTypes.onError,target:this}):a.Events.fire(this,{type:b.Image.EventTypes.onLoad,target:this}):(this.imageEl.isError=!1,this.imageEl.isLoading=!0,this.imageEl.naturalWidth=null,this.imageEl.naturalHeight=null,this.imageEl.isLandscape=!1,this.imageEl.onload=this.imageLoadHandler,this.imageEl.onerror=
this.imageErrorHandler,this.imageEl.onabort=this.imageErrorHandler,this.imageEl.originalSrc=this.src,this.imageEl.src=this.src)},shrinkImage:function(){if(!a.isNothing(this.imageEl)&&this.imageEl.src.indexOf(this.src)>-1)this.imageEl.src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",a.isNothing(this.imageEl.parentNode)||a.DOM.removeChild(this.imageEl,this.imageEl.parentNode)},onImageLoad:function(){this.imageEl.onload=null;this.imageEl.naturalWidth=a.coalesce(this.imageEl.naturalWidth,
this.imageEl.width);this.imageEl.naturalHeight=a.coalesce(this.imageEl.naturalHeight,this.imageEl.height);this.imageEl.isLandscape=this.imageEl.naturalWidth>this.imageEl.naturalHeight;this.imageEl.isLoading=!1;a.Events.fire(this,{type:b.Image.EventTypes.onLoad,target:this})},onImageError:function(){this.imageEl.onload=null;this.imageEl.onerror=null;this.imageEl.onabort=null;this.imageEl.isLoading=!1;this.imageEl.isError=!0;a.Events.fire(this,{type:b.Image.EventTypes.onError,target:this})}})})(window,
window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.Cache");e=e.Code.PhotoSwipe;e.Cache.Mode={normal:"normal",aggressive:"aggressive"};e.Cache.Functions={getImageSource:function(a){return a.href},getImageCaption:function(b){if(b.nodeName==="IMG")return a.DOM.getAttribute(b,"alt");var c,g,f;c=0;for(g=b.childNodes.length;c<g;c++)if(f=b.childNodes[c],b.childNodes[c].nodeName==="IMG")return a.DOM.getAttribute(f,"alt")},getImageMetaData:function(){return{}}}})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.Cache");var b=e.Code.PhotoSwipe;b.Cache.CacheClass=d({images:null,settings:null,dispose:function(){var c,b,f;if(!a.isNothing(this.images)){b=0;for(f=this.images.length;b<f;b++)this.images[b].dispose();this.images.length=0}for(c in this)a.objectHasProperty(this,c)&&(this[c]=null)},initialize:function(a,g){var f,d,e,h,l,k;this.settings=g;this.images=[];f=0;for(d=a.length;f<d;f++)e=a[f],h=this.settings.getImageSource(e),l=this.settings.getImageCaption(e),
k=this.settings.getImageMetaData(e),this.images.push(new b.Image.ImageClass(e,h,l,k))},getImages:function(c){var g,f,d=[],e;g=0;for(f=c.length;g<f;g++){e=this.images[c[g]];if(this.settings.cacheMode===b.Cache.Mode.aggressive)e.cacheDoNotShrink=!0;d.push(e)}if(this.settings.cacheMode===b.Cache.Mode.aggressive){g=0;for(f=this.images.length;g<f;g++)e=this.images[g],a.objectHasProperty(e,"cacheDoNotShrink")?delete e.cacheDoNotShrink:e.shrinkImage()}return d}})})(window,window.klass,window.Code.Util,window.Code.PhotoSwipe.Image);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.DocumentOverlay");e.Code.PhotoSwipe.DocumentOverlay.CssClasses={documentOverlay:"ps-document-overlay"}})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.DocumentOverlay");var b=e.Code.PhotoSwipe;b.DocumentOverlay.DocumentOverlayClass=d({el:null,settings:null,initialBodyHeight:null,dispose:function(){var c;a.Animation.stop(this.el);a.DOM.removeChild(this.el,this.el.parentNode);for(c in this)a.objectHasProperty(this,c)&&(this[c]=null)},initialize:function(c){this.settings=c;this.el=a.DOM.createElement("div",{"class":b.DocumentOverlay.CssClasses.documentOverlay},"");a.DOM.setStyle(this.el,{display:"block",
position:"absolute",left:0,top:0,zIndex:this.settings.zIndex});a.DOM.hide(this.el);this.settings.target===e?a.DOM.appendToBody(this.el):a.DOM.appendChild(this.el,this.settings.target);a.Animation.resetTranslate(this.el);this.initialBodyHeight=a.DOM.bodyOuterHeight()},resetPosition:function(){var c,b,f;if(this.settings.target===e){c=a.DOM.windowWidth();b=a.DOM.bodyOuterHeight()*2;f=this.settings.jQueryMobile?a.DOM.windowScrollTop()+"px":"0px";if(b<1)b=this.initialBodyHeight;a.DOM.windowHeight()>b&&
(b=a.DOM.windowHeight())}else c=a.DOM.width(this.settings.target),b=a.DOM.height(this.settings.target),f="0px";a.DOM.setStyle(this.el,{width:c,height:b,top:f})},fadeIn:function(c,b){this.resetPosition();a.DOM.setStyle(this.el,"opacity",0);a.DOM.show(this.el);a.Animation.fadeIn(this.el,c,b)}})})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.Carousel");e=e.Code.PhotoSwipe;e.Carousel.EventTypes={onSlideByEnd:"PhotoSwipeCarouselOnSlideByEnd",onSlideshowStart:"PhotoSwipeCarouselOnSlideshowStart",onSlideshowStop:"PhotoSwipeCarouselOnSlideshowStop"};e.Carousel.CssClasses={carousel:"ps-carousel",content:"ps-carousel-content",item:"ps-carousel-item",itemLoading:"ps-carousel-item-loading",itemError:"ps-carousel-item-error"};e.Carousel.SlideByAction={previous:"previous",current:"current",next:"next"}})(window,
window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.Carousel");var b=e.Code.PhotoSwipe;b.Carousel.CarouselClass=d({el:null,contentEl:null,settings:null,cache:null,slideByEndHandler:null,currentCacheIndex:null,isSliding:null,isSlideshowActive:null,lastSlideByAction:null,touchStartPoint:null,touchStartPosition:null,imageLoadHandler:null,imageErrorHandler:null,slideshowTimeout:null,dispose:function(){var c,g,f;g=0;for(f=this.cache.images.length;g<f;g++)a.Events.remove(this.cache.images[g],b.Image.EventTypes.onLoad,
this.imageLoadHandler),a.Events.remove(this.cache.images[g],b.Image.EventTypes.onError,this.imageErrorHandler);this.stopSlideshow();a.Animation.stop(this.el);a.DOM.removeChild(this.el,this.el.parentNode);for(c in this)a.objectHasProperty(this,c)&&(this[c]=null)},initialize:function(c,g){var f,d,j;this.cache=c;this.settings=g;this.slideByEndHandler=this.onSlideByEnd.bind(this);this.imageLoadHandler=this.onImageLoad.bind(this);this.imageErrorHandler=this.onImageError.bind(this);this.currentCacheIndex=
0;this.isSlideshowActive=this.isSliding=!1;if(this.cache.images.length<3)this.settings.loop=!1;this.el=a.DOM.createElement("div",{"class":b.Carousel.CssClasses.carousel},"");a.DOM.setStyle(this.el,{display:"block",position:"absolute",left:0,top:0,overflow:"hidden",zIndex:this.settings.zIndex});a.DOM.hide(this.el);this.contentEl=a.DOM.createElement("div",{"class":b.Carousel.CssClasses.content},"");a.DOM.setStyle(this.contentEl,{display:"block",position:"absolute",left:0,top:0});a.DOM.appendChild(this.contentEl,
this.el);d=c.images.length<3?c.images.length:3;for(f=0;f<d;f++)j=a.DOM.createElement("div",{"class":b.Carousel.CssClasses.item+" "+b.Carousel.CssClasses.item+"-"+f},""),a.DOM.setAttribute(j,"style","float: left;"),a.DOM.setStyle(j,{display:"block",position:"relative",left:0,top:0,overflow:"hidden"}),this.settings.margin>0&&a.DOM.setStyle(j,{marginRight:this.settings.margin+"px"}),a.DOM.appendChild(j,this.contentEl);this.settings.target===e?a.DOM.appendToBody(this.el):a.DOM.appendChild(this.el,this.settings.target)},
resetPosition:function(){var c,g,f,d,j,h;this.settings.target===e?(c=a.DOM.windowWidth(),g=a.DOM.windowHeight(),f=a.DOM.windowScrollTop()+"px"):(c=a.DOM.width(this.settings.target),g=a.DOM.height(this.settings.target),f="0px");d=this.settings.margin>0?c+this.settings.margin:c;j=a.DOM.find("."+b.Carousel.CssClasses.item,this.contentEl);d*=j.length;a.DOM.setStyle(this.el,{top:f,width:c,height:g});a.DOM.setStyle(this.contentEl,{width:d,height:g});f=0;for(d=j.length;f<d;f++)h=j[f],a.DOM.setStyle(h,{width:c,
height:g}),h=a.DOM.find("img",h)[0],a.isNothing(h)||this.resetImagePosition(h);this.setContentLeftPosition()},resetImagePosition:function(c){if(!a.isNothing(c)){a.DOM.getAttribute(c,"src");var b,f,d,e=a.DOM.width(this.el),h=a.DOM.height(this.el);this.settings.imageScaleMethod==="fitNoUpscale"?(f=c.naturalWidth,d=c.naturalHeight,f>e&&(b=e/f,f=Math.round(f*b),d=Math.round(d*b)),d>h&&(b=h/d,d=Math.round(d*b),f=Math.round(f*b))):(b=c.isLandscape?e/c.naturalWidth:h/c.naturalHeight,f=Math.round(c.naturalWidth*
b),d=Math.round(c.naturalHeight*b),this.settings.imageScaleMethod==="zoom"?(b=1,d<h?b=h/d:f<e&&(b=e/f),b!==1&&(f=Math.round(f*b),d=Math.round(d*b))):this.settings.imageScaleMethod==="fit"&&(b=1,f>e?b=e/f:d>h&&(b=h/d),b!==1&&(f=Math.round(f*b),d=Math.round(d*b))));a.DOM.setStyle(c,{position:"absolute",width:f,height:d,top:Math.round((h-d)/2)+"px",left:Math.round((e-f)/2)+"px",display:"block"})}},setContentLeftPosition:function(){var c,b,d;c=this.settings.target===e?a.DOM.windowWidth():a.DOM.width(this.settings.target);
b=this.getItemEls();d=0;this.settings.loop?d=(c+this.settings.margin)*-1:this.currentCacheIndex===this.cache.images.length-1?d=(b.length-1)*(c+this.settings.margin)*-1:this.currentCacheIndex>0&&(d=(c+this.settings.margin)*-1);a.DOM.setStyle(this.contentEl,{left:d+"px"})},show:function(c){this.currentCacheIndex=c;this.resetPosition();this.setImages(!1);a.DOM.show(this.el);a.Animation.resetTranslate(this.contentEl);var c=this.getItemEls(),d,f;d=0;for(f=c.length;d<f;d++)a.Animation.resetTranslate(c[d]);
a.Events.fire(this,{type:b.Carousel.EventTypes.onSlideByEnd,target:this,action:b.Carousel.SlideByAction.current,cacheIndex:this.currentCacheIndex})},setImages:function(a){var b,d=this.getItemEls();b=this.currentCacheIndex+1;var e=this.currentCacheIndex-1;this.settings.loop?(b>this.cache.images.length-1&&(b=0),e<0&&(e=this.cache.images.length-1),b=this.cache.getImages([e,this.currentCacheIndex,b]),a||this.addCacheImageToItemEl(b[1],d[1]),this.addCacheImageToItemEl(b[2],d[2]),this.addCacheImageToItemEl(b[0],
d[0])):d.length===1?a||(b=this.cache.getImages([this.currentCacheIndex]),this.addCacheImageToItemEl(b[0],d[0])):d.length===2?this.currentCacheIndex===0?(b=this.cache.getImages([this.currentCacheIndex,this.currentCacheIndex+1]),a||this.addCacheImageToItemEl(b[0],d[0]),this.addCacheImageToItemEl(b[1],d[1])):(b=this.cache.getImages([this.currentCacheIndex-1,this.currentCacheIndex]),a||this.addCacheImageToItemEl(b[1],d[1]),this.addCacheImageToItemEl(b[0],d[0])):this.currentCacheIndex===0?(b=this.cache.getImages([this.currentCacheIndex,
this.currentCacheIndex+1,this.currentCacheIndex+2]),a||this.addCacheImageToItemEl(b[0],d[0]),this.addCacheImageToItemEl(b[1],d[1]),this.addCacheImageToItemEl(b[2],d[2])):(this.currentCacheIndex===this.cache.images.length-1?(b=this.cache.getImages([this.currentCacheIndex-2,this.currentCacheIndex-1,this.currentCacheIndex]),a||this.addCacheImageToItemEl(b[2],d[2]),this.addCacheImageToItemEl(b[1],d[1])):(b=this.cache.getImages([this.currentCacheIndex-1,this.currentCacheIndex,this.currentCacheIndex+1]),
a||this.addCacheImageToItemEl(b[1],d[1]),this.addCacheImageToItemEl(b[2],d[2])),this.addCacheImageToItemEl(b[0],d[0]))},addCacheImageToItemEl:function(c,d){a.DOM.removeClass(d,b.Carousel.CssClasses.itemError);a.DOM.addClass(d,b.Carousel.CssClasses.itemLoading);a.DOM.removeChildren(d);a.DOM.setStyle(c.imageEl,{display:"none"});a.DOM.appendChild(c.imageEl,d);a.Animation.resetTranslate(c.imageEl);a.Events.add(c,b.Image.EventTypes.onLoad,this.imageLoadHandler);a.Events.add(c,b.Image.EventTypes.onError,
this.imageErrorHandler);c.load()},slideCarousel:function(c,d,f){if(!this.isSliding){var i,j;i=this.settings.target===e?a.DOM.windowWidth()+this.settings.margin:a.DOM.width(this.settings.target)+this.settings.margin;f=a.coalesce(f,this.settings.slideSpeed);if(!(e.Math.abs(j)<1)){switch(d){case a.TouchElement.ActionTypes.swipeLeft:c=i*-1;break;case a.TouchElement.ActionTypes.swipeRight:c=i;break;default:j=c.x-this.touchStartPoint.x,c=e.Math.abs(j)>i/2?j>0?i:i*-1:0}this.lastSlideByAction=c<0?b.Carousel.SlideByAction.next:
c>0?b.Carousel.SlideByAction.previous:b.Carousel.SlideByAction.current;if(!this.settings.loop&&(this.lastSlideByAction===b.Carousel.SlideByAction.previous&&this.currentCacheIndex===0||this.lastSlideByAction===b.Carousel.SlideByAction.next&&this.currentCacheIndex===this.cache.images.length-1))c=0,this.lastSlideByAction=b.Carousel.SlideByAction.current;this.isSliding=!0;this.doSlideCarousel(c,f)}}},moveCarousel:function(a){this.isSliding||this.settings.enableDrag&&this.doMoveCarousel(a.x-this.touchStartPoint.x)},
getItemEls:function(){return a.DOM.find("."+b.Carousel.CssClasses.item,this.contentEl)},previous:function(){this.stopSlideshow();this.slideCarousel({x:0,y:0},a.TouchElement.ActionTypes.swipeRight,this.settings.nextPreviousSlideSpeed)},next:function(){this.stopSlideshow();this.slideCarousel({x:0,y:0},a.TouchElement.ActionTypes.swipeLeft,this.settings.nextPreviousSlideSpeed)},slideshowNext:function(){this.slideCarousel({x:0,y:0},a.TouchElement.ActionTypes.swipeLeft)},startSlideshow:function(){this.stopSlideshow();
this.isSlideshowActive=!0;this.slideshowTimeout=e.setTimeout(this.slideshowNext.bind(this),this.settings.slideshowDelay);a.Events.fire(this,{type:b.Carousel.EventTypes.onSlideshowStart,target:this})},stopSlideshow:function(){if(!a.isNothing(this.slideshowTimeout))e.clearTimeout(this.slideshowTimeout),this.slideshowTimeout=null,this.isSlideshowActive=!1,a.Events.fire(this,{type:b.Carousel.EventTypes.onSlideshowStop,target:this})},onSlideByEnd:function(){if(!a.isNothing(this.isSliding)){var c=this.getItemEls();
this.isSliding=!1;this.lastSlideByAction===b.Carousel.SlideByAction.next?this.currentCacheIndex+=1:this.lastSlideByAction===b.Carousel.SlideByAction.previous&&(this.currentCacheIndex-=1);if(this.settings.loop)if(this.lastSlideByAction===b.Carousel.SlideByAction.next?a.DOM.appendChild(c[0],this.contentEl):this.lastSlideByAction===b.Carousel.SlideByAction.previous&&a.DOM.insertBefore(c[c.length-1],c[0],this.contentEl),this.currentCacheIndex<0)this.currentCacheIndex=this.cache.images.length-1;else{if(this.currentCacheIndex===
this.cache.images.length)this.currentCacheIndex=0}else this.cache.images.length>3&&(this.currentCacheIndex>1&&this.currentCacheIndex<this.cache.images.length-2?this.lastSlideByAction===b.Carousel.SlideByAction.next?a.DOM.appendChild(c[0],this.contentEl):this.lastSlideByAction===b.Carousel.SlideByAction.previous&&a.DOM.insertBefore(c[c.length-1],c[0],this.contentEl):this.currentCacheIndex===1?this.lastSlideByAction===b.Carousel.SlideByAction.previous&&a.DOM.insertBefore(c[c.length-1],c[0],this.contentEl):
this.currentCacheIndex===this.cache.images.length-2&&this.lastSlideByAction===b.Carousel.SlideByAction.next&&a.DOM.appendChild(c[0],this.contentEl));this.lastSlideByAction!==b.Carousel.SlideByAction.current&&(this.setContentLeftPosition(),this.setImages(!0));a.Events.fire(this,{type:b.Carousel.EventTypes.onSlideByEnd,target:this,action:this.lastSlideByAction,cacheIndex:this.currentCacheIndex});this.isSlideshowActive&&(this.lastSlideByAction!==b.Carousel.SlideByAction.current?this.startSlideshow():
this.stopSlideshow())}},onTouch:function(b,d){this.stopSlideshow();switch(b){case a.TouchElement.ActionTypes.touchStart:this.touchStartPoint=d;this.touchStartPosition={x:e.parseInt(a.DOM.getStyle(this.contentEl,"left"),0),y:e.parseInt(a.DOM.getStyle(this.contentEl,"top"),0)};break;case a.TouchElement.ActionTypes.touchMove:this.moveCarousel(d);break;case a.TouchElement.ActionTypes.touchMoveEnd:case a.TouchElement.ActionTypes.swipeLeft:case a.TouchElement.ActionTypes.swipeRight:this.slideCarousel(d,
b)}},onImageLoad:function(c){c=c.target;a.isNothing(c.imageEl.parentNode)||(a.DOM.removeClass(c.imageEl.parentNode,b.Carousel.CssClasses.itemLoading),this.resetImagePosition(c.imageEl));a.Events.remove(c,b.Image.EventTypes.onLoad,this.imageLoadHandler);a.Events.remove(c,b.Image.EventTypes.onError,this.imageErrorHandler)},onImageError:function(c){c=c.target;a.isNothing(c.imageEl.parentNode)||(a.DOM.removeClass(c.imageEl.parentNode,b.Carousel.CssClasses.itemLoading),a.DOM.addClass(c.imageEl.parentNode,
b.Carousel.CssClasses.itemError));a.Events.remove(c,b.Image.EventTypes.onLoad,this.imageLoadHandler);a.Events.remove(c,b.Image.EventTypes.onError,this.imageErrorHandler)}})})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.Carousel");d=e.Code.PhotoSwipe;d.Carousel.CarouselClass=d.Carousel.CarouselClass.extend({getStartingPos:function(){var b=this.touchStartPosition;a.isNothing(b)&&(b={x:e.parseInt(a.DOM.getStyle(this.contentEl,"left"),0),y:e.parseInt(a.DOM.getStyle(this.contentEl,"top"),0)});return b},doMoveCarousel:function(b){var c;a.Browser.isCSSTransformSupported?(c={},c[a.Animation._transitionPrefix+"Property"]="all",c[a.Animation._transitionPrefix+"Duration"]=
"",c[a.Animation._transitionPrefix+"TimingFunction"]="",c[a.Animation._transitionPrefix+"Delay"]="0",c[a.Animation._transformLabel]=a.Browser.is3dSupported?"translate3d("+b+"px, 0px, 0px)":"translate("+b+"px, 0px)",a.DOM.setStyle(this.contentEl,c)):a.isNothing(e.jQuery)||e.jQuery(this.contentEl).stop().css("left",this.getStartingPos().x+b+"px")},doSlideCarousel:function(b,c){var d;if(c<=0)this.slideByEndHandler();else if(a.Browser.isCSSTransformSupported)d=a.coalesce(this.contentEl.style.webkitTransform,
this.contentEl.style.MozTransform,this.contentEl.style.transform,""),d.indexOf("translate3d("+b)===0?this.slideByEndHandler():d.indexOf("translate("+b)===0?this.slideByEndHandler():a.Animation.slideBy(this.contentEl,b,0,c,this.slideByEndHandler,this.settings.slideTimingFunction);else if(!a.isNothing(e.jQuery)){d={left:this.getStartingPos().x+b+"px"};if(this.settings.animationTimingFunction==="ease-out")this.settings.animationTimingFunction="easeOutQuad";if(a.isNothing(e.jQuery.easing[this.settings.animationTimingFunction]))this.settings.animationTimingFunction=
"linear";e.jQuery(this.contentEl).animate(d,this.settings.slideSpeed,this.settings.animationTimingFunction,this.slideByEndHandler)}}})})(window,window.klass,window.Code.Util,window.Code.PhotoSwipe.TouchElement);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.Toolbar");var b=e.Code.PhotoSwipe;b.Toolbar.CssClasses={toolbar:"ps-toolbar",toolbarContent:"ps-toolbar-content",toolbarTop:"ps-toolbar-top",caption:"ps-caption",captionBottom:"ps-caption-bottom",captionContent:"ps-caption-content",close:"ps-toolbar-close",play:"ps-toolbar-play",previous:"ps-toolbar-previous",previousDisabled:"ps-toolbar-previous-disabled",next:"ps-toolbar-next",nextDisabled:"ps-toolbar-next-disabled"};b.Toolbar.ToolbarAction=
{close:"close",play:"play",next:"next",previous:"previous",none:"none"};b.Toolbar.EventTypes={onTap:"PhotoSwipeToolbarOnClick",onBeforeShow:"PhotoSwipeToolbarOnBeforeShow",onShow:"PhotoSwipeToolbarOnShow",onBeforeHide:"PhotoSwipeToolbarOnBeforeHide",onHide:"PhotoSwipeToolbarOnHide"};b.Toolbar.getToolbar=function(){return'<div class="'+b.Toolbar.CssClasses.close+'"><div class="'+b.Toolbar.CssClasses.toolbarContent+'"></div></div><div class="'+b.Toolbar.CssClasses.play+'"><div class="'+b.Toolbar.CssClasses.toolbarContent+
'"></div></div><div class="'+b.Toolbar.CssClasses.previous+'"><div class="'+b.Toolbar.CssClasses.toolbarContent+'"></div></div><div class="'+b.Toolbar.CssClasses.next+'"><div class="'+b.Toolbar.CssClasses.toolbarContent+'"></div></div>'}})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.Toolbar");var b=e.Code.PhotoSwipe;b.Toolbar.ToolbarClass=d({toolbarEl:null,closeEl:null,playEl:null,previousEl:null,nextEl:null,captionEl:null,captionContentEl:null,currentCaption:null,settings:null,cache:null,timeout:null,isVisible:null,fadeOutHandler:null,touchStartHandler:null,touchMoveHandler:null,clickHandler:null,dispose:function(){var b;this.clearTimeout();this.removeEventHandlers();a.Animation.stop(this.toolbarEl);a.Animation.stop(this.captionEl);
a.DOM.removeChild(this.toolbarEl,this.toolbarEl.parentNode);a.DOM.removeChild(this.captionEl,this.captionEl.parentNode);for(b in this)a.objectHasProperty(this,b)&&(this[b]=null)},initialize:function(c,d){var f;this.settings=d;this.cache=c;this.isVisible=!1;this.fadeOutHandler=this.onFadeOut.bind(this);this.touchStartHandler=this.onTouchStart.bind(this);this.touchMoveHandler=this.onTouchMove.bind(this);this.clickHandler=this.onClick.bind(this);f=b.Toolbar.CssClasses.toolbar;this.settings.captionAndToolbarFlipPosition&&
(f=f+" "+b.Toolbar.CssClasses.toolbarTop);this.toolbarEl=a.DOM.createElement("div",{"class":f},this.settings.getToolbar());a.DOM.setStyle(this.toolbarEl,{left:0,position:"absolute",overflow:"hidden",zIndex:this.settings.zIndex});this.settings.target===e?a.DOM.appendToBody(this.toolbarEl):a.DOM.appendChild(this.toolbarEl,this.settings.target);a.DOM.hide(this.toolbarEl);this.closeEl=a.DOM.find("."+b.Toolbar.CssClasses.close,this.toolbarEl)[0];this.settings.preventHide&&!a.isNothing(this.closeEl)&&a.DOM.hide(this.closeEl);
this.playEl=a.DOM.find("."+b.Toolbar.CssClasses.play,this.toolbarEl)[0];this.settings.preventSlideshow&&!a.isNothing(this.playEl)&&a.DOM.hide(this.playEl);this.nextEl=a.DOM.find("."+b.Toolbar.CssClasses.next,this.toolbarEl)[0];this.previousEl=a.DOM.find("."+b.Toolbar.CssClasses.previous,this.toolbarEl)[0];f=b.Toolbar.CssClasses.caption;this.settings.captionAndToolbarFlipPosition&&(f=f+" "+b.Toolbar.CssClasses.captionBottom);this.captionEl=a.DOM.createElement("div",{"class":f},"");a.DOM.setStyle(this.captionEl,
{left:0,position:"absolute",overflow:"hidden",zIndex:this.settings.zIndex});this.settings.target===e?a.DOM.appendToBody(this.captionEl):a.DOM.appendChild(this.captionEl,this.settings.target);a.DOM.hide(this.captionEl);this.captionContentEl=a.DOM.createElement("div",{"class":b.Toolbar.CssClasses.captionContent},"");a.DOM.appendChild(this.captionContentEl,this.captionEl);this.addEventHandlers()},resetPosition:function(){var b,d,f;this.settings.target===e?(this.settings.captionAndToolbarFlipPosition?
(d=a.DOM.windowScrollTop(),f=a.DOM.windowScrollTop()+a.DOM.windowHeight()-a.DOM.height(this.captionEl)):(d=a.DOM.windowScrollTop()+a.DOM.windowHeight()-a.DOM.height(this.toolbarEl),f=a.DOM.windowScrollTop()),b=a.DOM.windowWidth()):(this.settings.captionAndToolbarFlipPosition?(d="0",f=a.DOM.height(this.settings.target)-a.DOM.height(this.captionEl)):(d=a.DOM.height(this.settings.target)-a.DOM.height(this.toolbarEl),f=0),b=a.DOM.width(this.settings.target));a.DOM.setStyle(this.toolbarEl,{top:d+"px",
width:b});a.DOM.setStyle(this.captionEl,{top:f+"px",width:b})},toggleVisibility:function(a){this.isVisible?this.fadeOut():this.show(a)},show:function(c){a.Animation.stop(this.toolbarEl);a.Animation.stop(this.captionEl);this.resetPosition();this.setToolbarStatus(c);a.Events.fire(this,{type:b.Toolbar.EventTypes.onBeforeShow,target:this});this.showToolbar();this.setCaption(c);this.showCaption();this.isVisible=!0;this.setTimeout();a.Events.fire(this,{type:b.Toolbar.EventTypes.onShow,target:this})},setTimeout:function(){if(this.settings.captionAndToolbarAutoHideDelay>
0)this.clearTimeout(),this.timeout=e.setTimeout(this.fadeOut.bind(this),this.settings.captionAndToolbarAutoHideDelay)},clearTimeout:function(){if(!a.isNothing(this.timeout))e.clearTimeout(this.timeout),this.timeout=null},fadeOut:function(){this.clearTimeout();a.Events.fire(this,{type:b.Toolbar.EventTypes.onBeforeHide,target:this});a.Animation.fadeOut(this.toolbarEl,this.settings.fadeOutSpeed);a.Animation.fadeOut(this.captionEl,this.settings.fadeOutSpeed,this.fadeOutHandler);this.isVisible=!1},addEventHandlers:function(){a.Browser.isTouchSupported&&
(a.Browser.blackberry||a.Events.add(this.toolbarEl,"touchstart",this.touchStartHandler),a.Events.add(this.toolbarEl,"touchmove",this.touchMoveHandler),a.Events.add(this.captionEl,"touchmove",this.touchMoveHandler));a.Events.add(this.toolbarEl,"click",this.clickHandler)},removeEventHandlers:function(){a.Browser.isTouchSupported&&(a.Browser.blackberry||a.Events.remove(this.toolbarEl,"touchstart",this.touchStartHandler),a.Events.remove(this.toolbarEl,"touchmove",this.touchMoveHandler),a.Events.remove(this.captionEl,
"touchmove",this.touchMoveHandler));a.Events.remove(this.toolbarEl,"click",this.clickHandler)},handleTap:function(c){this.clearTimeout();var d;if(c.target===this.nextEl||a.DOM.isChildOf(c.target,this.nextEl))d=b.Toolbar.ToolbarAction.next;else if(c.target===this.previousEl||a.DOM.isChildOf(c.target,this.previousEl))d=b.Toolbar.ToolbarAction.previous;else if(c.target===this.closeEl||a.DOM.isChildOf(c.target,this.closeEl))d=b.Toolbar.ToolbarAction.close;else if(c.target===this.playEl||a.DOM.isChildOf(c.target,
this.playEl))d=b.Toolbar.ToolbarAction.play;this.setTimeout();if(a.isNothing(d))d=b.Toolbar.ToolbarAction.none;a.Events.fire(this,{type:b.Toolbar.EventTypes.onTap,target:this,action:d,tapTarget:c.target})},setCaption:function(b){a.DOM.removeChildren(this.captionContentEl);this.currentCaption=a.coalesce(this.cache.images[b].caption,"\u00a0");if(a.isObject(this.currentCaption))a.DOM.appendChild(this.currentCaption,this.captionContentEl);else{if(this.currentCaption==="")this.currentCaption="\u00a0";
a.DOM.appendText(this.currentCaption,this.captionContentEl)}this.currentCaption=this.currentCaption==="\u00a0"?"":this.currentCaption;this.resetPosition()},showToolbar:function(){a.DOM.setStyle(this.toolbarEl,{opacity:this.settings.captionAndToolbarOpacity});a.DOM.show(this.toolbarEl)},showCaption:function(){(this.currentCaption===""||this.captionContentEl.childNodes.length<1)&&!this.settings.captionAndToolbarShowEmptyCaptions?a.DOM.hide(this.captionEl):(a.DOM.setStyle(this.captionEl,{opacity:this.settings.captionAndToolbarOpacity}),
a.DOM.show(this.captionEl))},setToolbarStatus:function(c){this.settings.loop||(a.DOM.removeClass(this.previousEl,b.Toolbar.CssClasses.previousDisabled),a.DOM.removeClass(this.nextEl,b.Toolbar.CssClasses.nextDisabled),c>0&&c<this.cache.images.length-1||(c===0&&(a.isNothing(this.previousEl)||a.DOM.addClass(this.previousEl,b.Toolbar.CssClasses.previousDisabled)),c===this.cache.images.length-1&&(a.isNothing(this.nextEl)||a.DOM.addClass(this.nextEl,b.Toolbar.CssClasses.nextDisabled))))},onFadeOut:function(){a.DOM.hide(this.toolbarEl);
a.DOM.hide(this.captionEl);a.Events.fire(this,{type:b.Toolbar.EventTypes.onHide,target:this})},onTouchStart:function(b){b.preventDefault();a.Events.remove(this.toolbarEl,"click",this.clickHandler);this.handleTap(b)},onTouchMove:function(a){a.preventDefault()},onClick:function(a){a.preventDefault();this.handleTap(a)}})})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.UILayer");e.Code.PhotoSwipe.UILayer.CssClasses={uiLayer:"ps-uilayer"}})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.UILayer");var b=e.Code.PhotoSwipe;b.UILayer.UILayerClass=a.TouchElement.TouchElementClass.extend({el:null,settings:null,dispose:function(){var b;this.removeEventHandlers();a.DOM.removeChild(this.el,this.el.parentNode);for(b in this)a.objectHasProperty(this,b)&&(this[b]=null)},initialize:function(c){this.settings=c;this.el=a.DOM.createElement("div",{"class":b.UILayer.CssClasses.uiLayer},"");a.DOM.setStyle(this.el,{display:"block",position:"absolute",
left:0,top:0,overflow:"hidden",zIndex:this.settings.zIndex,opacity:0});a.DOM.hide(this.el);this.settings.target===e?a.DOM.appendToBody(this.el):a.DOM.appendChild(this.el,this.settings.target);this.supr(this.el,{swipe:!0,move:!0,gesture:a.Browser.iOS,doubleTap:!0,preventDefaultTouchEvents:this.settings.preventDefaultTouchEvents})},resetPosition:function(){this.settings.target===e?a.DOM.setStyle(this.el,{top:a.DOM.windowScrollTop()+"px",width:a.DOM.windowWidth(),height:a.DOM.windowHeight()}):a.DOM.setStyle(this.el,
{top:"0px",width:a.DOM.width(this.settings.target),height:a.DOM.height(this.settings.target)})},show:function(){this.resetPosition();a.DOM.show(this.el);this.addEventHandlers()},addEventHandlers:function(){this.supr()},removeEventHandlers:function(){this.supr()}})})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.ZoomPanRotate");e=e.Code.PhotoSwipe;e.ZoomPanRotate.CssClasses={zoomPanRotate:"ps-zoom-pan-rotate"};e.ZoomPanRotate.EventTypes={onTransform:"PhotoSwipeZoomPanRotateOnTransform"}})(window,window.klass,window.Code.Util);
(function(e,d,a){a.registerNamespace("Code.PhotoSwipe.ZoomPanRotate");var b=e.Code.PhotoSwipe;b.ZoomPanRotate.ZoomPanRotateClass=d({el:null,settings:null,containerEl:null,imageEl:null,transformSettings:null,panStartingPoint:null,transformEl:null,dispose:function(){var b;a.DOM.removeChild(this.el,this.el.parentNode);for(b in this)a.objectHasProperty(this,b)&&(this[b]=null)},initialize:function(c,d,f){var i,j,h;this.settings=c;this.settings.target===e?(c=document.body,i=a.DOM.windowWidth(),j=a.DOM.windowHeight(),
h=a.DOM.windowScrollTop()+"px"):(c=this.settings.target,i=a.DOM.width(c),j=a.DOM.height(c),h="0px");this.imageEl=d.imageEl.cloneNode(!1);a.DOM.setStyle(this.imageEl,{zIndex:1});this.transformSettings={startingScale:1,scale:1,startingRotation:0,rotation:0,startingTranslateX:0,startingTranslateY:0,translateX:0,translateY:0};this.el=a.DOM.createElement("div",{"class":b.ZoomPanRotate.CssClasses.zoomPanRotate},"");a.DOM.setStyle(this.el,{left:0,top:h,position:"absolute",width:i,height:j,zIndex:this.settings.zIndex,
display:"block"});a.DOM.insertBefore(this.el,f.el,c);a.Browser.iOS?(this.containerEl=a.DOM.createElement("div","",""),a.DOM.setStyle(this.containerEl,{left:0,top:0,width:i,height:j,position:"absolute",zIndex:1}),a.DOM.appendChild(this.imageEl,this.containerEl),a.DOM.appendChild(this.containerEl,this.el),a.Animation.resetTranslate(this.containerEl),a.Animation.resetTranslate(this.imageEl),this.transformEl=this.containerEl):(a.DOM.appendChild(this.imageEl,this.el),this.transformEl=this.imageEl)},setStartingTranslateFromCurrentTransform:function(){var b=
a.coalesce(this.transformEl.style.webkitTransform,this.transformEl.style.MozTransform,this.transformEl.style.transform);if(!a.isNothing(b)&&(b=b.match(/translate\((.*?)\)/),!a.isNothing(b)))b=b[1].split(", "),this.transformSettings.startingTranslateX=e.parseInt(b[0],10),this.transformSettings.startingTranslateY=e.parseInt(b[1],10)},getScale:function(a){a*=this.transformSettings.startingScale;if(this.settings.minUserZoom!==0&&a<this.settings.minUserZoom)a=this.settings.minUserZoom;else if(this.settings.maxUserZoom!==
0&&a>this.settings.maxUserZoom)a=this.settings.maxUserZoom;return a},setStartingScaleAndRotation:function(a,b){this.transformSettings.startingScale=this.getScale(a);this.transformSettings.startingRotation=(this.transformSettings.startingRotation+b)%360},zoomRotate:function(a,b){this.transformSettings.scale=this.getScale(a);this.transformSettings.rotation=this.transformSettings.startingRotation+b;this.applyTransform()},panStart:function(a){this.setStartingTranslateFromCurrentTransform();this.panStartingPoint=
{x:a.x,y:a.y}},pan:function(a){var b=(a.y-this.panStartingPoint.y)/this.transformSettings.scale;this.transformSettings.translateX=this.transformSettings.startingTranslateX+(a.x-this.panStartingPoint.x)/this.transformSettings.scale;this.transformSettings.translateY=this.transformSettings.startingTranslateY+b;this.applyTransform()},zoomAndPanToPoint:function(b,d){if(this.settings.target===e){this.panStart({x:a.DOM.windowWidth()/2,y:a.DOM.windowHeight()/2});var f=(d.y-this.panStartingPoint.y)/this.transformSettings.scale;
this.transformSettings.translateX=(this.transformSettings.startingTranslateX+(d.x-this.panStartingPoint.x)/this.transformSettings.scale)*-1;this.transformSettings.translateY=(this.transformSettings.startingTranslateY+f)*-1}this.setStartingScaleAndRotation(b,0);this.transformSettings.scale=this.transformSettings.startingScale;this.transformSettings.rotation=0;this.applyTransform()},applyTransform:function(){var c=this.transformSettings.rotation%360,d=e.parseInt(this.transformSettings.translateX,10),
f=e.parseInt(this.transformSettings.translateY,10),i="scale("+this.transformSettings.scale+") rotate("+c+"deg) translate("+d+"px, "+f+"px)";a.DOM.setStyle(this.transformEl,{webkitTransform:i,MozTransform:i,msTransform:i,transform:i});a.Events.fire(this,{target:this,type:b.ZoomPanRotate.EventTypes.onTransform,scale:this.transformSettings.scale,rotation:this.transformSettings.rotation,rotationDegs:c,translateX:d,translateY:f})}})})(window,window.klass,window.Code.Util);
(function(e,d){d.registerNamespace("Code.PhotoSwipe");var a=e.Code.PhotoSwipe;a.CssClasses={buildingBody:"ps-building",activeBody:"ps-active"};a.EventTypes={onBeforeShow:"PhotoSwipeOnBeforeShow",onShow:"PhotoSwipeOnShow",onBeforeHide:"PhotoSwipeOnBeforeHide",onHide:"PhotoSwipeOnHide",onDisplayImage:"PhotoSwipeOnDisplayImage",onResetPosition:"PhotoSwipeOnResetPosition",onSlideshowStart:"PhotoSwipeOnSlideshowStart",onSlideshowStop:"PhotoSwipeOnSlideshowStop",onTouch:"PhotoSwipeOnTouch",onBeforeCaptionAndToolbarShow:"PhotoSwipeOnBeforeCaptionAndToolbarShow",
onCaptionAndToolbarShow:"PhotoSwipeOnCaptionAndToolbarShow",onBeforeCaptionAndToolbarHide:"PhotoSwipeOnBeforeCaptionAndToolbarHide",onCaptionAndToolbarHide:"PhotoSwipeOnCaptionAndToolbarHide",onToolbarTap:"PhotoSwipeOnToolbarTap",onBeforeZoomPanRotateShow:"PhotoSwipeOnBeforeZoomPanRotateShow",onZoomPanRotateShow:"PhotoSwipeOnZoomPanRotateShow",onBeforeZoomPanRotateHide:"PhotoSwipeOnBeforeZoomPanRotateHide",onZoomPanRotateHide:"PhotoSwipeOnZoomPanRotateHide",onZoomPanRotateTransform:"PhotoSwipeOnZoomPanRotateTransform"};
a.instances=[];a.activeInstances=[];a.setActivateInstance=function(b){if(d.arrayIndexOf(b.settings.target,a.activeInstances,"target")>-1)throw"Code.PhotoSwipe.activateInstance: Unable to active instance as another instance is already active for this target";a.activeInstances.push({target:b.settings.target,instance:b})};a.unsetActivateInstance=function(b){b=d.arrayIndexOf(b,a.activeInstances,"instance");a.activeInstances.splice(b,1)};a.attach=function(b,c,e){var f,i;f=a.createInstance(b,c,e);c=0;for(e=
b.length;c<e;c++)if(i=b[c],!d.isNothing(i.nodeType)&&i.nodeType===1)i.__photoSwipeClickHandler=a.onTriggerElementClick.bind(f),d.Events.remove(i,"click",i.__photoSwipeClickHandler),d.Events.add(i,"click",i.__photoSwipeClickHandler);return f};if(e.jQuery)e.jQuery.fn.photoSwipe=function(b,c){return a.attach(this,b,c)};a.detatch=function(b){var c,e,f;c=0;for(e=b.originalImages.length;c<e;c++)f=b.originalImages[c],!d.isNothing(f.nodeType)&&f.nodeType===1&&(d.Events.remove(f,"click",f.__photoSwipeClickHandler),
delete f.__photoSwipeClickHandler);a.disposeInstance(b)};a.createInstance=function(b,c,e){var f;if(d.isNothing(b))throw"Code.PhotoSwipe.attach: No images passed.";if(!d.isLikeArray(b))throw"Code.PhotoSwipe.createInstance: Images must be an array of elements or image urls.";if(b.length<1)throw"Code.PhotoSwipe.createInstance: No images to passed.";c=d.coalesce(c,{});f=a.getInstance(e);if(d.isNothing(f))f=new a.PhotoSwipeClass(b,c,e),a.instances.push(f);else throw'Code.PhotoSwipe.createInstance: Instance with id "'+
e+' already exists."';return f};a.disposeInstance=function(b){var c=a.getInstanceIndex(b);if(c<0)throw"Code.PhotoSwipe.disposeInstance: Unable to find instance to dispose.";b.dispose();a.instances.splice(c,1)};a.onTriggerElementClick=function(a){a.preventDefault();this.show(a.currentTarget)};a.getInstance=function(b){var c,d,e;c=0;for(d=a.instances.length;c<d;c++)if(e=a.instances[c],e.id===b)return e;return null};a.getInstanceIndex=function(b){var c,d,e=-1;c=0;for(d=a.instances.length;c<d;c++)if(a.instances[c]===
b){e=c;break}return e}})(window,window.Code.Util);
(function(e,d,a,b,c,g,f,i,j){a.registerNamespace("Code.PhotoSwipe");var h=e.Code.PhotoSwipe;h.PhotoSwipeClass=d({id:null,settings:null,isBackEventSupported:null,backButtonClicked:null,currentIndex:null,originalImages:null,mouseWheelStartTime:null,windowDimensions:null,cache:null,documentOverlay:null,carousel:null,uiLayer:null,toolbar:null,zoomPanRotate:null,windowOrientationChangeHandler:null,windowScrollHandler:null,windowHashChangeHandler:null,keyDownHandler:null,windowOrientationEventName:null,
uiLayerTouchHandler:null,carouselSlideByEndHandler:null,carouselSlideshowStartHandler:null,carouselSlideshowStopHandler:null,toolbarTapHandler:null,toolbarBeforeShowHandler:null,toolbarShowHandler:null,toolbarBeforeHideHandler:null,toolbarHideHandler:null,mouseWheelHandler:null,zoomPanRotateTransformHandler:null,_isResettingPosition:null,_uiWebViewResetPositionTimeout:null,dispose:function(){var b;a.Events.remove(this,h.EventTypes.onBeforeShow);a.Events.remove(this,h.EventTypes.onShow);a.Events.remove(this,
h.EventTypes.onBeforeHide);a.Events.remove(this,h.EventTypes.onHide);a.Events.remove(this,h.EventTypes.onDisplayImage);a.Events.remove(this,h.EventTypes.onResetPosition);a.Events.remove(this,h.EventTypes.onSlideshowStart);a.Events.remove(this,h.EventTypes.onSlideshowStop);a.Events.remove(this,h.EventTypes.onTouch);a.Events.remove(this,h.EventTypes.onBeforeCaptionAndToolbarShow);a.Events.remove(this,h.EventTypes.onCaptionAndToolbarShow);a.Events.remove(this,h.EventTypes.onBeforeCaptionAndToolbarHide);
a.Events.remove(this,h.EventTypes.onCaptionAndToolbarHide);a.Events.remove(this,h.EventTypes.onZoomPanRotateTransform);this.removeEventHandlers();a.isNothing(this.documentOverlay)||this.documentOverlay.dispose();a.isNothing(this.carousel)||this.carousel.dispose();a.isNothing(this.uiLayer)||this.uiLayer.dispose();a.isNothing(this.toolbar)||this.toolbar.dispose();this.destroyZoomPanRotate();a.isNothing(this.cache)||this.cache.dispose();for(b in this)a.objectHasProperty(this,b)&&(this[b]=null)},initialize:function(c,
d,f){this.id=a.isNothing(f)?"PhotoSwipe"+(new Date).getTime().toString():f;this.originalImages=c;if(a.Browser.android&&!a.Browser.firefox&&e.navigator.userAgent.match(/Android (\d+.\d+)/).toString().replace(/^.*\,/,"")>=2.1)this.isBackEventSupported=!0;if(!this.isBackEventSupported)this.isBackEventSupported=a.objectHasProperty(e,"onhashchange");this.settings={fadeInSpeed:250,fadeOutSpeed:250,preventHide:!1,preventSlideshow:!1,zIndex:1E3,backButtonHideEnabled:!0,enableKeyboard:!0,enableMouseWheel:!0,
mouseWheelSpeed:350,autoStartSlideshow:!1,jQueryMobile:!a.isNothing(e.jQuery)&&!a.isNothing(e.jQuery.mobile),jQueryMobileDialogHash:"&ui-state=dialog",enableUIWebViewRepositionTimeout:!1,uiWebViewResetPositionDelay:500,target:e,preventDefaultTouchEvents:!0,loop:!0,slideSpeed:250,nextPreviousSlideSpeed:0,enableDrag:!0,swipeThreshold:50,swipeTimeThreshold:250,slideTimingFunction:"ease-out",slideshowDelay:3E3,doubleTapSpeed:250,margin:20,imageScaleMethod:"fit",captionAndToolbarHide:!1,captionAndToolbarFlipPosition:!1,
captionAndToolbarAutoHideDelay:5E3,captionAndToolbarOpacity:0.8,captionAndToolbarShowEmptyCaptions:!0,getToolbar:h.Toolbar.getToolbar,allowUserZoom:!0,allowRotationOnUserZoom:!1,maxUserZoom:5,minUserZoom:0.5,doubleTapZoomLevel:2.5,getImageSource:h.Cache.Functions.getImageSource,getImageCaption:h.Cache.Functions.getImageCaption,getImageMetaData:h.Cache.Functions.getImageMetaData,cacheMode:h.Cache.Mode.normal};a.extend(this.settings,d);this.settings.target!==e&&(d=a.DOM.getStyle(this.settings.target,
"position"),(d!=="relative"||d!=="absolute")&&a.DOM.setStyle(this.settings.target,"position","relative"));if(this.settings.target!==e)this.isBackEventSupported=!1,this.settings.backButtonHideEnabled=!1;else if(this.settings.preventHide)this.settings.backButtonHideEnabled=!1;this.cache=new b.CacheClass(c,this.settings)},show:function(b){var c,d;this.backButtonClicked=this._isResettingPosition=!1;if(a.isNumber(b))this.currentIndex=b;else{this.currentIndex=-1;c=0;for(d=this.originalImages.length;c<d;c++)if(this.originalImages[c]===
b){this.currentIndex=c;break}}if(this.currentIndex<0||this.currentIndex>this.originalImages.length-1)throw"Code.PhotoSwipe.PhotoSwipeClass.show: Starting index out of range";this.isAlreadyGettingPage=this.getWindowDimensions();h.setActivateInstance(this);this.windowDimensions=this.getWindowDimensions();this.settings.target===e?a.DOM.addClass(e.document.body,h.CssClasses.buildingBody):a.DOM.addClass(this.settings.target,h.CssClasses.buildingBody);this.createComponents();a.Events.fire(this,{type:h.EventTypes.onBeforeShow,
target:this});this.documentOverlay.fadeIn(this.settings.fadeInSpeed,this.onDocumentOverlayFadeIn.bind(this))},getWindowDimensions:function(){return{width:a.DOM.windowWidth(),height:a.DOM.windowHeight()}},createComponents:function(){this.documentOverlay=new c.DocumentOverlayClass(this.settings);this.carousel=new g.CarouselClass(this.cache,this.settings);this.uiLayer=new i.UILayerClass(this.settings);if(!this.settings.captionAndToolbarHide)this.toolbar=new f.ToolbarClass(this.cache,this.settings)},
resetPosition:function(){if(!this._isResettingPosition){var b=this.getWindowDimensions();if(a.isNothing(this.windowDimensions)||!(b.width===this.windowDimensions.width&&b.height===this.windowDimensions.height))this._isResettingPosition=!0,this.windowDimensions=b,this.destroyZoomPanRotate(),this.documentOverlay.resetPosition(),this.carousel.resetPosition(),a.isNothing(this.toolbar)||this.toolbar.resetPosition(),this.uiLayer.resetPosition(),this._isResettingPosition=!1,a.Events.fire(this,{type:h.EventTypes.onResetPosition,
target:this})}},addEventHandler:function(b,c){a.Events.add(this,b,c)},addEventHandlers:function(){if(a.isNothing(this.windowOrientationChangeHandler))this.windowOrientationChangeHandler=this.onWindowOrientationChange.bind(this),this.windowScrollHandler=this.onWindowScroll.bind(this),this.keyDownHandler=this.onKeyDown.bind(this),this.windowHashChangeHandler=this.onWindowHashChange.bind(this),this.uiLayerTouchHandler=this.onUILayerTouch.bind(this),this.carouselSlideByEndHandler=this.onCarouselSlideByEnd.bind(this),
this.carouselSlideshowStartHandler=this.onCarouselSlideshowStart.bind(this),this.carouselSlideshowStopHandler=this.onCarouselSlideshowStop.bind(this),this.toolbarTapHandler=this.onToolbarTap.bind(this),this.toolbarBeforeShowHandler=this.onToolbarBeforeShow.bind(this),this.toolbarShowHandler=this.onToolbarShow.bind(this),this.toolbarBeforeHideHandler=this.onToolbarBeforeHide.bind(this),this.toolbarHideHandler=this.onToolbarHide.bind(this),this.mouseWheelHandler=this.onMouseWheel.bind(this),this.zoomPanRotateTransformHandler=
this.onZoomPanRotateTransform.bind(this);a.Browser.android?this.orientationEventName="resize":a.Browser.iOS&&!a.Browser.safari?a.Events.add(e.document.body,"orientationchange",this.windowOrientationChangeHandler):this.orientationEventName=!a.isNothing(e.onorientationchange)?"orientationchange":"resize";a.isNothing(this.orientationEventName)||a.Events.add(e,this.orientationEventName,this.windowOrientationChangeHandler);this.settings.target===e&&a.Events.add(e,"scroll",this.windowScrollHandler);this.settings.enableKeyboard&&
a.Events.add(e.document,"keydown",this.keyDownHandler);if(this.isBackEventSupported&&this.settings.backButtonHideEnabled)this.windowHashChangeHandler=this.onWindowHashChange.bind(this),this.settings.jQueryMobile?e.location.hash=this.settings.jQueryMobileDialogHash:(this.currentHistoryHashValue="PhotoSwipe"+(new Date).getTime().toString(),e.location.hash=this.currentHistoryHashValue),a.Events.add(e,"hashchange",this.windowHashChangeHandler);this.settings.enableMouseWheel&&a.Events.add(e,"mousewheel",
this.mouseWheelHandler);a.Events.add(this.uiLayer,a.TouchElement.EventTypes.onTouch,this.uiLayerTouchHandler);a.Events.add(this.carousel,g.EventTypes.onSlideByEnd,this.carouselSlideByEndHandler);a.Events.add(this.carousel,g.EventTypes.onSlideshowStart,this.carouselSlideshowStartHandler);a.Events.add(this.carousel,g.EventTypes.onSlideshowStop,this.carouselSlideshowStopHandler);a.isNothing(this.toolbar)||(a.Events.add(this.toolbar,f.EventTypes.onTap,this.toolbarTapHandler),a.Events.add(this.toolbar,
f.EventTypes.onBeforeShow,this.toolbarBeforeShowHandler),a.Events.add(this.toolbar,f.EventTypes.onShow,this.toolbarShowHandler),a.Events.add(this.toolbar,f.EventTypes.onBeforeHide,this.toolbarBeforeHideHandler),a.Events.add(this.toolbar,f.EventTypes.onHide,this.toolbarHideHandler))},removeEventHandlers:function(){a.Browser.iOS&&!a.Browser.safari&&a.Events.remove(e.document.body,"orientationchange",this.windowOrientationChangeHandler);a.isNothing(this.orientationEventName)||a.Events.remove(e,this.orientationEventName,
this.windowOrientationChangeHandler);a.Events.remove(e,"scroll",this.windowScrollHandler);this.settings.enableKeyboard&&a.Events.remove(e.document,"keydown",this.keyDownHandler);this.isBackEventSupported&&this.settings.backButtonHideEnabled&&a.Events.remove(e,"hashchange",this.windowHashChangeHandler);this.settings.enableMouseWheel&&a.Events.remove(e,"mousewheel",this.mouseWheelHandler);a.isNothing(this.uiLayer)||a.Events.remove(this.uiLayer,a.TouchElement.EventTypes.onTouch,this.uiLayerTouchHandler);
a.isNothing(this.toolbar)||(a.Events.remove(this.carousel,g.EventTypes.onSlideByEnd,this.carouselSlideByEndHandler),a.Events.remove(this.carousel,g.EventTypes.onSlideshowStart,this.carouselSlideshowStartHandler),a.Events.remove(this.carousel,g.EventTypes.onSlideshowStop,this.carouselSlideshowStopHandler));a.isNothing(this.toolbar)||(a.Events.remove(this.toolbar,f.EventTypes.onTap,this.toolbarTapHandler),a.Events.remove(this.toolbar,f.EventTypes.onBeforeShow,this.toolbarBeforeShowHandler),a.Events.remove(this.toolbar,
f.EventTypes.onShow,this.toolbarShowHandler),a.Events.remove(this.toolbar,f.EventTypes.onBeforeHide,this.toolbarBeforeHideHandler),a.Events.remove(this.toolbar,f.EventTypes.onHide,this.toolbarHideHandler))},hide:function(){if(!this.settings.preventHide){if(a.isNothing(this.documentOverlay))throw"Code.PhotoSwipe.PhotoSwipeClass.hide: PhotoSwipe instance is already hidden";if(a.isNothing(this.hiding)){this.clearUIWebViewResetPositionTimeout();this.destroyZoomPanRotate();this.removeEventHandlers();a.Events.fire(this,
{type:h.EventTypes.onBeforeHide,target:this});this.uiLayer.dispose();this.uiLayer=null;if(!a.isNothing(this.toolbar))this.toolbar.dispose(),this.toolbar=null;this.carousel.dispose();this.carousel=null;a.DOM.removeClass(e.document.body,h.CssClasses.activeBody);this.documentOverlay.dispose();this.documentOverlay=null;this._isResettingPosition=!1;h.unsetActivateInstance(this);a.Events.fire(this,{type:h.EventTypes.onHide,target:this});this.goBackInHistory()}}},goBackInHistory:function(){this.isBackEventSupported&&
this.settings.backButtonHideEnabled&&(this.backButtonClicked||e.history.back())},play:function(){!this.isZoomActive()&&!this.settings.preventSlideshow&&!a.isNothing(this.carousel)&&(!a.isNothing(this.toolbar)&&this.toolbar.isVisible&&this.toolbar.fadeOut(),this.carousel.startSlideshow())},stop:function(){this.isZoomActive()||a.isNothing(this.carousel)||this.carousel.stopSlideshow()},previous:function(){this.isZoomActive()||a.isNothing(this.carousel)||this.carousel.previous()},next:function(){this.isZoomActive()||
a.isNothing(this.carousel)||this.carousel.next()},toggleToolbar:function(){this.isZoomActive()||a.isNothing(this.toolbar)||this.toolbar.toggleVisibility(this.currentIndex)},fadeOutToolbarIfVisible:function(){!a.isNothing(this.toolbar)&&this.toolbar.isVisible&&this.settings.captionAndToolbarAutoHideDelay>0&&this.toolbar.fadeOut()},createZoomPanRotate:function(){this.stop();if(this.canUserZoom()&&!this.isZoomActive())a.Events.fire(this,h.EventTypes.onBeforeZoomPanRotateShow),this.zoomPanRotate=new j.ZoomPanRotateClass(this.settings,
this.cache.images[this.currentIndex],this.uiLayer),this.uiLayer.captureSettings.preventDefaultTouchEvents=!0,a.Events.add(this.zoomPanRotate,h.ZoomPanRotate.EventTypes.onTransform,this.zoomPanRotateTransformHandler),a.Events.fire(this,h.EventTypes.onZoomPanRotateShow),!a.isNothing(this.toolbar)&&this.toolbar.isVisible&&this.toolbar.fadeOut()},destroyZoomPanRotate:function(){if(!a.isNothing(this.zoomPanRotate))a.Events.fire(this,h.EventTypes.onBeforeZoomPanRotateHide),a.Events.remove(this.zoomPanRotate,
h.ZoomPanRotate.EventTypes.onTransform,this.zoomPanRotateTransformHandler),this.zoomPanRotate.dispose(),this.zoomPanRotate=null,this.uiLayer.captureSettings.preventDefaultTouchEvents=this.settings.preventDefaultTouchEvents,a.Events.fire(this,h.EventTypes.onZoomPanRotateHide)},canUserZoom:function(){var b;if(a.Browser.msie){if(b=document.createElement("div"),a.isNothing(b.style.msTransform))return!1}else if(!a.Browser.isCSSTransformSupported)return!1;if(!this.settings.allowUserZoom)return!1;if(this.carousel.isSliding)return!1;
b=this.cache.images[this.currentIndex];if(a.isNothing(b))return!1;if(b.isLoading)return!1;return!0},isZoomActive:function(){return!a.isNothing(this.zoomPanRotate)},getCurrentImage:function(){return this.cache.images[this.currentIndex]},onDocumentOverlayFadeIn:function(){e.setTimeout(function(){var b=this.settings.target===e?e.document.body:this.settings.target;a.DOM.removeClass(b,h.CssClasses.buildingBody);a.DOM.addClass(b,h.CssClasses.activeBody);this.addEventHandlers();this.carousel.show(this.currentIndex);
this.uiLayer.show();this.settings.autoStartSlideshow?this.play():a.isNothing(this.toolbar)||this.toolbar.show(this.currentIndex);a.Events.fire(this,{type:h.EventTypes.onShow,target:this});this.setUIWebViewResetPositionTimeout()}.bind(this),250)},setUIWebViewResetPositionTimeout:function(){if(this.settings.enableUIWebViewRepositionTimeout&&a.Browser.iOS&&!a.Browser.safari)a.isNothing(this._uiWebViewResetPositionTimeout)||e.clearTimeout(this._uiWebViewResetPositionTimeout),this._uiWebViewResetPositionTimeout=
e.setTimeout(function(){this.resetPosition();this.setUIWebViewResetPositionTimeout()}.bind(this),this.settings.uiWebViewResetPositionDelay)},clearUIWebViewResetPositionTimeout:function(){a.isNothing(this._uiWebViewResetPositionTimeout)||e.clearTimeout(this._uiWebViewResetPositionTimeout)},onWindowScroll:function(){this.resetPosition()},onWindowOrientationChange:function(){this.resetPosition()},onWindowHashChange:function(){if(e.location.hash!=="#"+(this.settings.jQueryMobile?this.settings.jQueryMobileDialogHash:
this.currentHistoryHashValue))this.backButtonClicked=!0,this.hide()},onKeyDown:function(a){a.keyCode===37?(a.preventDefault(),this.previous()):a.keyCode===39?(a.preventDefault(),this.next()):a.keyCode===38||a.keyCode===40?a.preventDefault():a.keyCode===27?(a.preventDefault(),this.hide()):a.keyCode===32?(this.settings.hideToolbar?this.hide():this.toggleToolbar(),a.preventDefault()):a.keyCode===13&&(a.preventDefault(),this.play())},onUILayerTouch:function(b){if(this.isZoomActive())switch(b.action){case a.TouchElement.ActionTypes.gestureChange:this.zoomPanRotate.zoomRotate(b.scale,
this.settings.allowRotationOnUserZoom?b.rotation:0);break;case a.TouchElement.ActionTypes.gestureEnd:this.zoomPanRotate.setStartingScaleAndRotation(b.scale,this.settings.allowRotationOnUserZoom?b.rotation:0);break;case a.TouchElement.ActionTypes.touchStart:this.zoomPanRotate.panStart(b.point);break;case a.TouchElement.ActionTypes.touchMove:this.zoomPanRotate.pan(b.point);break;case a.TouchElement.ActionTypes.doubleTap:this.destroyZoomPanRotate();this.toggleToolbar();break;case a.TouchElement.ActionTypes.swipeLeft:this.destroyZoomPanRotate();
this.next();this.toggleToolbar();break;case a.TouchElement.ActionTypes.swipeRight:this.destroyZoomPanRotate(),this.previous(),this.toggleToolbar()}else switch(b.action){case a.TouchElement.ActionTypes.touchMove:case a.TouchElement.ActionTypes.swipeLeft:case a.TouchElement.ActionTypes.swipeRight:this.fadeOutToolbarIfVisible();this.carousel.onTouch(b.action,b.point);break;case a.TouchElement.ActionTypes.touchStart:case a.TouchElement.ActionTypes.touchMoveEnd:this.carousel.onTouch(b.action,b.point);
break;case a.TouchElement.ActionTypes.tap:this.toggleToolbar();break;case a.TouchElement.ActionTypes.doubleTap:this.settings.target===e&&(b.point.x-=a.DOM.windowScrollLeft(),b.point.y-=a.DOM.windowScrollTop());var c=this.cache.images[this.currentIndex].imageEl,d=e.parseInt(a.DOM.getStyle(c,"top"),10),f=e.parseInt(a.DOM.getStyle(c,"left"),10),g=f+a.DOM.width(c),c=d+a.DOM.height(c);if(b.point.x<f)b.point.x=f;else if(b.point.x>g)b.point.x=g;if(b.point.y<d)b.point.y=d;else if(b.point.y>c)b.point.y=c;
this.createZoomPanRotate();this.isZoomActive()&&this.zoomPanRotate.zoomAndPanToPoint(this.settings.doubleTapZoomLevel,b.point);break;case a.TouchElement.ActionTypes.gestureStart:this.createZoomPanRotate()}a.Events.fire(this,{type:h.EventTypes.onTouch,target:this,point:b.point,action:b.action})},onCarouselSlideByEnd:function(b){this.currentIndex=b.cacheIndex;a.isNothing(this.toolbar)||(this.toolbar.setCaption(this.currentIndex),this.toolbar.setToolbarStatus(this.currentIndex));a.Events.fire(this,{type:h.EventTypes.onDisplayImage,
target:this,action:b.action,index:b.cacheIndex})},onToolbarTap:function(b){switch(b.action){case f.ToolbarAction.next:this.next();break;case f.ToolbarAction.previous:this.previous();break;case f.ToolbarAction.close:this.hide();break;case f.ToolbarAction.play:this.play()}a.Events.fire(this,{type:h.EventTypes.onToolbarTap,target:this,toolbarAction:b.action,tapTarget:b.tapTarget})},onMouseWheel:function(b){var c=a.Events.getWheelDelta(b);if(!(b.timeStamp-(this.mouseWheelStartTime||0)<this.settings.mouseWheelSpeed))this.mouseWheelStartTime=
b.timeStamp,this.settings.invertMouseWheel&&(c*=-1),c<0?this.next():c>0&&this.previous()},onCarouselSlideshowStart:function(){a.Events.fire(this,{type:h.EventTypes.onSlideshowStart,target:this})},onCarouselSlideshowStop:function(){a.Events.fire(this,{type:h.EventTypes.onSlideshowStop,target:this})},onToolbarBeforeShow:function(){a.Events.fire(this,{type:h.EventTypes.onBeforeCaptionAndToolbarShow,target:this})},onToolbarShow:function(){a.Events.fire(this,{type:h.EventTypes.onCaptionAndToolbarShow,
target:this})},onToolbarBeforeHide:function(){a.Events.fire(this,{type:h.EventTypes.onBeforeCaptionAndToolbarHide,target:this})},onToolbarHide:function(){a.Events.fire(this,{type:h.EventTypes.onCaptionAndToolbarHide,target:this})},onZoomPanRotateTransform:function(b){a.Events.fire(this,{target:this,type:h.EventTypes.onZoomPanRotateTransform,scale:b.scale,rotation:b.rotation,rotationDegs:b.rotationDegs,translateX:b.translateX,translateY:b.translateY})}})})(window,window.klass,window.Code.Util,window.Code.PhotoSwipe.Cache,
window.Code.PhotoSwipe.DocumentOverlay,window.Code.PhotoSwipe.Carousel,window.Code.PhotoSwipe.Toolbar,window.Code.PhotoSwipe.UILayer,window.Code.PhotoSwipe.ZoomPanRotate);


/*!
 * Mobile Recording Library for biological data collection. 
 * Version: 1.0.0
 *
 * https://github.com/NERC-CEH/morel
 *
 * Author 2015 Karols Kazlauskis
 * Released under the GNU GPL v3 license.
 */
/***********************************************************************
 * APP MODULE
 *
 * Things to work on:
 *  - Decouple the modules as much as possible
 *  - Add better data management - app.data - should be strictly managed
 *  - Close as many global variables
 **********************************************************************/

app = (function (m, $) {
  m.version = '1.0.0'; //library version, generated/replaced by grunt

  //configuration should be setup in app config file
  m.CONF = {
    HOME: "",
    NAME: "", //todo: set to null to force an application name
    LOG: m.LOG_ERROR
  };

  //GLOBALS
  m.$ = $; //todo: remove if not used
  m.data = {};

  //CONSTANTS:
  m.TRUE = 1;
  m.FALSE = 0;
  m.ERROR = -1;

  //levels of app logging
  m.LOG_NONE = 0;
  m.LOG_ERROR = 1;
  m.LOG_WARNING = 2;
  m.LOG_INFO = 3;
  m.LOG_DEBUG = 4;

  /**
   * Events from.
   * http://jqmtricks.wordpress.com/2014/03/26/jquery-mobile-page-events/
   */
  m.pageEvents = [
    'pagebeforecreate',
    'pagecreate',
    'pagecontainerbeforechange ',
    'pagecontainerbeforetransition',
    'pagecontainerbeforehide',
    'pagecontainerhide',
    'pagecontainerbeforeshow',
    'pagecontainershow',
    'pagecontainertransition',
    'pagecontainerchange',
    'pagecontainerchangefailed',
    'pagecontainerbeforeload',
    'pagecontainerload',
    'pagecontainerloadfailed',
    'pagecontainerremove'
  ];

  /**
   * Init function.
   */
  m.initialise = function () {
    _log('APP: initialised.', app.LOG_INFO);

    //todo: needs tidying up
    //Bind JQM page events with page controller handlers
    $(document).on(app.pageEvents.join(' '), function (e, data) {
      var event = e.type;
      var id = null;
      switch (event) {
        case 'pagecreate':
        case 'pagecontainerbeforechange':
          id = data.prevPage != null ? data.prevPage[0].id : e.target.id;
          break;

        case 'pagebeforecreate':
          id = e.target.id;
          break;

        case 'pagecontainershow':
        case 'pagecontainerbeforetransition':
        case 'pagecontainerbeforehide':
        case 'pagecontainerbeforeshow':
        case 'pagecontainertransition':
        case 'pagecontainerhide':
        case 'pagecontainerchangefailed':
        case 'pagecontainerchange':
          id = data.toPage[0].id;
          break;

        case 'pagecontainerbeforeload':
        case 'pagecontainerload':
        case 'pagecontainerloadfailed':
        default:
          break;
      }

      //  var ihd = e.target.id || data.toPage[0].id;
      var controller = app.controller[id];

      //if page has controller and it has an event handler
      if (controller && controller[event]) {
        controller[event](e, data);
      }
    });
  };

  /**
   * Initialises the application settings.
   */
  m.initSettings = function () {
    app.storage.set('settings', {});
  };

  /**
   * Sets an app setting.
   *
   * @param item
   * @param data
   * @returns {*}
   */
  m.settings = function (item, data) {
    var settings = app.storage.get('settings');
    if (settings == null) {
      app.initSettings();
      settings = app.storage.get('settings');
    }

    if (data != null) {
      settings[item] = data;
      return app.storage.set('settings', settings);
    } else {
      return (item != undefined) ? settings[item] : settings;
    }
  };

  /**
   * Resets the app to the initial state.
   *
   * Clears localStorage.
   * Clears sessionStorage.
   * Clears databases.
   */
  m.reset = function () {
    app.storage.clear();
    app.storage.tmpClear();

    //app.db.clear();
    app.record.db.clear();
  };

  return m;
}(window.app || {}, jQuery)); //END

/**
 * Since the back button does not work in current iOS 7.1.1 while in app mode, it is
 * necessary to manually assign the back button urls.
 *
 * Set up the URL replacements so that the id of the page is matched with the new URL
 * of the back buttons it contains. The use of wild cards is possible eg.

 backButtonUrls = {
  'app-*':'home',
  'app-examples':'home',
  'tab-location':'home' 
};
 */

/**
 * Fixes back buttons for specific page
 */
function fixPageBackButtons(currentPageURL, nextPageId) {
  console.log('FIXING: back buttons ( ' + nextPageId + ')');

  var buttons = jQuery("div[id='" + nextPageId + "'] a[data-rel='back']");
  buttons.each(function (index, button) {
    jQuery(button).removeAttr('data-rel');

    //skip external pages
    if (currentPageURL != null) {
      //assign new url to the button
      jQuery(button).attr('href', currentPageURL);
    }
  });
}

/**
 * Generic function to detect the browser
 * 
 * Chrome has to have and ID of both Chrome and Safari therefore
 * Safari has to have an ID of only Safari and not Chrome
 */
function browserDetect(browser) {
  if (browser == 'Chrome' || browser == 'Safari') {
    var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
    var is_safari = navigator.userAgent.indexOf("Safari") > -1;
    var is_mobile = navigator.userAgent.indexOf("Mobile") > -1;

    if (is_safari) {
      if (browser == 'Chrome') {
        //Chrome
        return (is_chrome) ? true : false;
      } else {
        //Safari
        return (!is_chrome) ? true : false;
      }
    } else if (is_mobile) {
      //Safari homescreen Agent has only 'Mobile'
      return true;
    }
    return false;
  }
  return (navigator.userAgent.indexOf(browser) > -1);
}

/***********************************************************************
 * AUTH MODULE
 **********************************************************************/

app = app || {};
app.auth = (function (m, $) {
  //module configuration should be setup in an app config file
  m.CONF = {
    APPNAME: "",
    APPSECRET: "",
    WEBSITE_ID: 0,
    SURVEY_ID: 0
  };

  //name under which the user details are stored
  m.USER = 'user';

  /**
   * Appends user and app authentication to the passed data object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  m.append = function (data) {
    //user logins
    m.appendUser(data);
    //app logins
    m.appendApp(data);
    //warehouse data
    m.appendWarehouse(data);

    return data;
  };

  /**
   * Appends user authentication - Email and Password to
   * the passed data object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  m.appendUser = function (data) {
    var user = m.getUser();
    if (m.isUser()) {
      data.append('email', user.email);
      data.append('password', user.password)
    }

    return data;
  };

  /**
   * Appends app authentication - Appname and Appsecret to
   * the passed object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  m.appendApp = function (data) {
    data.append('appname', this.CONF.APPNAME);
    data.append('appsecret', this.CONF.APPSECRET);

    return data;
  };

  /**
   * Appends warehouse related information - website_id and survey_id to
   * the passed data object.
   * Note: object has to implement 'append' method.
   *
   * This is necessary because the data must be associated to some
   * website and survey in the warehouse.
   *
   * @param data An object to modify
   * @returns {*} An data object
   */
  m.appendWarehouse = function (data) {
    data.append('website_id', this.CONF.WEBSITE_ID);
    data.append('survey_id', this.CONF.SURVEY_ID);

    return data;
  };

  /**
   * Checks if the user has authenticated with the app.
   *
   * @returns {boolean} True if the user exists, else False
   */
  m.isUser = function () {
    var user = m.getUser();
    return !$.isEmptyObject(user);
  };

  /**
   * Brings the user details from the storage.
   *
   * @returns {Object|*}
   */
  m.getUser = function () {
    return app.settings(m.USER);
  };

  /**
   * Saves the authenticated user details to the storage.
   *
   * @param user A user object
   */
  m.setUser = function (user) {
    app.settings(m.USER, user);
  };

  /**
   * Removes the current user details from the storage.
   */
  m.removeUser = function () {
    app.settings(m.USER, {});
  };

  return m;
}(app.auth || {}, jQuery));



/***********************************************************************
 * DB MODULE
 *
 * Module responsible for large data management.
 **********************************************************************/

app = app || {};
app.db = (function (m, $) {

  //todo: move to CONF.
  m.DB_VERSION = 1;
  m.DB_MAIN = "app";
  m.STORE_MAIN = "main";

  /**
   * Opens a database.
   *
   * @param name
   * @param storeName
   * @param callback
   */
  m.open = function (name, storeName, callback) {
    var req = window.indexedDB.open(name, m.DB_VERSION);

    req.onsuccess = function (e) {
      _log("DB: opened successfully.", app.LOG_DEBUG);
      var db = e.target.result;
      var transaction = db.transaction([storeName], "readwrite");
      var store = transaction.objectStore(storeName);

      if (callback != null) {
        callback(store);
      }
    };

    req.onupgradeneeded = function (e) {
      _log("DB: upgrading.", app.LOG_INFO);
      var db = e.target.result;

      db.deleteObjectStore(app.db.STORE_MAIN);
      db.createObjectStore(app.db.STORE_MAIN);
    };

    req.onerror = function (e) {
      _log("DB: NOT opened successfully.", app.LOG_ERROR);
      // _log(e);
    };

    req.onblocked = function (e) {
      _log("DB: database blocked.", app.LOG_ERROR);
      // _log(e);
    }

  };

  /**
   * Adds a record to the database store.
   *
   * @param record
   * @param key
   * @param callback
   */
  m.add = function (record, key, callback) {
    m.open(m.DB_MAIN, m.STORE_MAIN, function (store) {
      _log("DB: adding to the store.", app.LOG_DEBUG);

      store.add(record, key);
      store.transaction.db.close();

      if (callback != null) {
        callback();
      }
    });
  };

  /**
   * Gets a specific record from the database store.
   *
   * @param key
   * @param callback
   */
  m.get = function (key, callback) {
    m.open(m.DB_MAIN, m.STORE_MAIN, function (store) {
      _log('DB: getting from the store.', app.LOG_DEBUG);

      var result = store.get(key);
      if (callback != null) {
        callback(result);
      }

    });
  };

  /**
   * Gets all the records from the database store.
   *
   * @param callback
   */
  m.getAll = function (callback) {
    m.open(m.DB_MAIN, m.STORE_MAIN, function (store) {
      _log('DB: getting all from the store.', app.LOG_DEBUG);

      // Get everything in the store
      var keyRange = IDBKeyRange.lowerBound(0);
      var req = store.openCursor(keyRange);

      var data = [];
      req.onsuccess = function (e) {
        var result = e.target.result;

        // If there's data, add it to array
        if (result) {
          data.push(result.value);
          result.continue();

          // Reach the end of the data
        } else {
          if (callback != null) {
            callback(data);
          }
        }
      };

    });
  };

  /**
   * Checks if the record exists in the database store.
   *
   * @param key
   * @param callback
   */
  m.is = function (key, callback) {
    //todo: implement
  };

  /**
   * Clears the database store.
   *
   * @param callback
   */
  m.clear = function (callback) {
    m.open(m.DB_MAIN, m.STORE_RECORDS, function (store) {
      _log('DB: clearing store', app.LOG_DEBUG);
      store.clear();

      if (callback != null) {
        callback(data);
      }
    });
  };

  return m;
}(app.db || {}, app.$ || jQuery));

/***********************************************************************
 * GEOLOC MODULE
 **********************************************************************/

app = app || {};
app.geoloc = (function (m, $) {

  //configuration should be setup in app config file
  m.CONF = {
    GPS_ACCURACY_LIMIT: 26000,
    HIGH_ACCURACY: true,
    TIMEOUT: 120000
  };

  //todo: limit the scope of the variables to this module's functions.
  m.latitude = null;
  m.longitude = null;
  m.accuracy = -1;

  m.start_time = 0;
  m.id = 0;
  m.map = null;

  /**
   * Sets the Latitude, Longitude and the Accuracy of the GPS lock.
   *
   * @param lat
   * @param lon
   * @param acc
   */
  m.set = function (lat, lon, acc) {
    this.latitude = lat;
    this.longitude = lon;
    this.accuracy = acc;
  };

  /**
   * Gets the the Latitude, Longitude and the Accuracy of the GPS lock.
   *
   * @returns {{lat: *, lon: *, acc: *}}
   */
  m.get = function () {
    return {
      'lat': this.latitude,
      'lon': this.longitude,
      'acc': this.accuracy
    }
  };

  /**
   * Clears the current GPS lock.
   */
  m.clear = function () {
    m.set(null, null, -1);
  };

  /**
   * Gets the accuracy of the current GPS lock.
   *
   * @returns {*}
   */
  m.getAccuracy = function () {
    return this.accuracy;
  };

  /**
   * Runs the GPS.
   *
   * @returns {*}
   */
  m.run = function (onUpdate, onSuccess, onError) {
    _log('GEOLOC: run.', app.LOG_INFO);

    // Early return if geolocation not supported.
    if (!navigator.geolocation) {
      _log("GEOLOC: not supported!", app.LOG_ERROR);
      if (onError != null) {
        onError({message: "Geolocation is not supported!"});
      }
      return;
    }

    //stop any other geolocation service started before
    app.geoloc.stop();
    app.geoloc.clear();

    ////check if the lock is acquired and the accuracy is good enough
    //var accuracy = app.geoloc.getAccuracy();
    //if ((accuracy > -1) && (accuracy < this.CONF.GPS_ACCURACY_LIMIT)){
    //    _log('GEOLOC: lock is good enough (acc: ' + accuracy + ' meters).');
    //    if (onSuccess != null) {
    //        onSuccess(this.get());
    //    }
    //    return;
    //}

    this.start_time = new Date().getTime();

    // Request geolocation.
    this.id = app.geoloc.watchPosition(onUpdate, onSuccess, onError);
  };

  /**
   * Stops any currently running geolocation service.
   */
  m.stop = function () {
    navigator.geolocation.clearWatch(app.geoloc.id);
  };

  /**
   * Watches the GPS position.
   *
   * @param onUpdate
   * @param onSuccess
   * @param onError
   * @returns {Number} id of running GPS
   */
  m.watchPosition = function (onUpdate, onSuccess, onError) {
    var onGeolocSuccess = function (position) {
      //timeout
      var current_time = new Date().getTime();
      if ((current_time - app.geoloc.start_time) > app.geoloc.TIMEOUT) {
        //stop everything
        app.geoloc.stop();
        _log("GEOLOC: timeout.", app.LOG_ERROR);
        if (onError != null) {
          onError({message: "Geolocation timed out!"});
        }
        return;
      }

      var location = {
        'lat': position.coords.latitude,
        'lon': position.coords.longitude,
        'acc': position.coords.accuracy
      };

      //set for the first time
      var prev_accuracy = app.geoloc.getAccuracy();
      if (prev_accuracy == -1) {
        prev_accuracy = location.acc + 1;
      }

      //only set it up if the accuracy is increased
      if (location.acc > -1 && location.acc < prev_accuracy) {
        app.geoloc.set(location.lat, location.lon, location.acc);
        if (location.acc < app.geoloc.CONF.GPS_ACCURACY_LIMIT) {
          _log("GEOLOC: finished: " + location.acc + " meters.", app.LOG_INFO);
          app.geoloc.stop();

          //save in storage
          app.settings('location', location);
          if (onSuccess != null) {
            onSuccess(location);
          }
        } else {
          _log("GEOLOC: updated acc: " + location.acc + " meters.", app.LOG_INFO);
          if (onUpdate != null) {
            onUpdate(location);
          }
        }
      }
    };

    // Callback if geolocation fails.
    var onGeolocError = function (error) {
      _log("GEOLOC: ERROR.", app.LOG_ERROR);
      if (onError != null) {
        onError({'message': error.message});
      }
    };

    // Geolocation options.
    var options = {
      enableHighAccuracy: m.CONF.HIGH_ACCURACY,
      maximumAge: 0,
      timeout: m.CONF.TIMEOUT
    };

    return navigator.geolocation.watchPosition(
      onGeolocSuccess,
      onGeolocError,
      options
    );
  };

  /**
   * Validates the current GPS lock quality.
   *
   * @returns {*}
   */
  m.valid = function () {
    var accuracy = this.getAccuracy();
    if (accuracy == -1) {
      //No GPS lock yet
      return app.ERROR;

    } else if (accuracy > this.CONF.GPS_ACCURACY_LIMIT) {
      //Geolocated with bad accuracy
      return app.FALSE;

    } else {
      //Geolocation accuracy is good enough
      return app.TRUE;
    }
  };

  return m;
})(app.geoloc || {}, app.$ || jQuery);


/***********************************************************************
 * HELPER MODULE
 *
 * Functions that were to ambiguous to be placed in one module.
 **********************************************************************/

/**
 * Gets a query parameter from the URL.
 */
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * Takes care of application execution logging.
 *
 * Uses 5 levels of logging:
 *  0: none
 *  1: errors
 *  2: warnings
 *  3: information
 *  4: debug
 *
 * Levels values defined in core app module.
 *
 * @param message
 * @param level
 * @private
 */
function _log(message, level) {

  //do nothing if logging turned off
  if (app.CONF.LOG == app.LOG_NONE) {
    return;
  }

  if (app.CONF.LOG >= level || level == null) {
    switch (level) {
      case app.LOG_ERROR:
        _logError(message);
        break;
      case app.LOG_WARNING:
        console.warn(message);
        break;
      case app.LOG_INFO:
        console.log(message);
        break;
      case app.LOG_DEBUG:
      default:
        //IE does not support console.debug
        if (console.debug == null) {
          console.log(message);
          break;
        }
        console.debug(message);
    }
  }
}

/**
 * Prints and posts an error to the mobile authentication log.
 *
 * @param error object holding a 'message', and optionally 'url' and 'line' fields.
 * @private
 */
function _logError(error) {
  //print error
  console.error(error['message'], error['url'], error['line']);

  //prepare the message
  var message = '<b style="color: red">' + error['message'] + '</b>';
  message += '</br><b> app.version = </b><i>"' + app.version + '"</i>';

  message += '</br><b> app.CONF.NAME = </b><i>"' + app.CONF.NAME + '"</i>';
  message += '</br><b> app.CONF.VERSION = </b><i>"' + app.CONF.VERSION + '"</i></br>';

  message += '</br>' + navigator.appName;
  message += '</br>' + navigator.appVersion;

  var url = error['url'] + ' (' + error['line'] + ')';

  if (navigator.onLine) {
    //send to server

    var data = {};
    data.append = function (name, value) {
      this[name] = value;
    };
    data.append('message', message);
    data.append('url', url);
    app.auth.appendApp(data);

    //removing unnecessary information
    delete data.append;

    jQuery.ajax({
      url: Drupal.settings.basePath + 'mobile/log',
      type: 'post',
      dataType: 'json',
      success: function (data) {
        console.log(data);
      },
      data: data
    });
  } else {
    //save

  }


}

/**
 * Hook into window.error function.
 *
 * @param message
 * @param url
 * @param line
 * @returns {boolean}
 * @private
 */
function _onerror(message, url, line) {
  window.onerror = null;

  var error = {
    'message': message,
    'url': url || '',
    'line': line || -1
  };

  _log(error, app.LOG_ERROR);

  window.onerror = this; // turn on error handling again
  return true; // suppress normal error reporting
}

//todo: remove if not used.
function loadScript(src) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  document.body.appendChild(script);
}

/**
 * Starts an Appcache Manifest Downloading.
 *
 * @param id
 * @param files_no
 * @param src
 * @param callback
 * @param onError
 */
function startManifestDownload(id, files_no, src, callback, onError) {
  /*todo: Add better offline handling:
   If there is a network connection, but it cannot reach any
   Internet, it will carry on loading the page, where it should stop it
   at that point.
   */
  if (navigator.onLine) {
    src = Drupal.settings.basePath + src + '?base_path=' + Drupal.settings.basePath + '&files=' + files_no;
    var frame = document.getElementById(id);
    if (frame) {
      //update
      frame.contentWindow.applicationCache.update();
    } else {
      //init
      //app.navigation.popup('<iframe id="' + id + '" src="' + src + '" width="215px" height="215px" scrolling="no" frameBorder="0"></iframe>', true);
      app.navigation.message('<iframe id="' + id + '" src="' + src + '" width="215px" height="215px" scrolling="no" frameBorder="0"></iframe>', 0);
      frame = document.getElementById(id);

      //After frame loading set up its controllers/callbacks
      frame.onload = function () {
        _log('Manifest frame loaded', app.LOG_INFO);
        if (callback != null) {
          frame.contentWindow.finished = callback;
        }

        if (onError != null) {
          frame.contentWindow.error = onError;
        }
      }
    }
  } else {
    $.mobile.loading('show', {
      text: "Looks like you are offline!",
      theme: "b",
      textVisible: true,
      textonly: true
    });
  }
}

/**
 * Initialises and returns a variable.
 *
 * @param name
 * @returns {*}
 */
function varInit(name) {
  var name_array = name.split('.');
  window[name_array[0]] = window[name_array[0]] || {};
  var variable = window[name_array[0]];

  //iterate through the namespaces
  for (var i = 1; i < name_array.length; i++) {
    if (variable[name_array[i]] !== 'object') {
      //overwrite if it is not an object
      variable[name_array[i]] = {};
    }
    variable = variable[name_array[i]];
  }
  return variable;
}

/**
 * Clones an object.
 *
 * @param obj
 * @returns {*}
 */
function objClone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = objClone(obj[attr]);
  }
  return copy;
}

/**
 * Adds Enable/Disable JQM Tab functionality
 * FROM: http://kylestechnobabble.blogspot.co.uk/2013/08/easy-way-to-enable-disable-hide-jquery.html
 * USAGE:
 * $('MyTabSelector').disableTab(0);        // Disables the first tab
 * $('MyTabSelector').disableTab(1, true);  // Disables & hides the second tab
 */
(function ($) {
  $.fn.disableTab = function (tabIndex, hide) {

    // Get the array of disabled tabs, if any
    var disabledTabs = this.tabs("option", "disabled");

    if ($.isArray(disabledTabs)) {
      var pos = $.inArray(tabIndex, disabledTabs);

      if (pos < 0) {
        disabledTabs.push(tabIndex);
      }
    }
    else {
      disabledTabs = [tabIndex];
    }

    this.tabs("option", "disabled", disabledTabs);

    if (hide === true) {
      $(this).find('li:eq(' + tabIndex + ')').addClass('ui-state-hidden');
    }

    // Enable chaining
    return this;
  };

  $.fn.enableTab = function (tabIndex) {

    // Remove the ui-state-hidden class if it exists
    $(this).find('li:eq(' + tabIndex + ')').removeClass('ui-state-hidden');

    // Use the built-in enable function
    this.tabs("enable", tabIndex);

    // Enable chaining
    return this;

  };

})(jQuery);

/***********************************************************************
 * IMAGE MODULE
 **********************************************************************/

app = app || {};
app.image = (function (m, $) {

  //todo: move to CONF.
  m.MAX_IMG_HEIGHT = 800;
  m.MAX_IMG_WIDTH = 800;

  /**
   * Returns all the images resized and stingified from an element.
   *
   * @param elem DOM element to look for files
   * @param callback function with an array parameter
   */
  m.extractAllToArray = function (elem, callback, onError) {
    var files = app.image.findAll(elem);
    if (files.length > 0) {
      app.image.toStringAll(files, callback, onError);
    } else {
      callback(files);
    }
  };

  /**
   * Transforms and resizes an image file into a string and saves it in the storage.
   *
   * @param key
   * @param file
   * @param onSaveSuccess
   * @returns {number}
   */
  m.toString = function (file, onSaveSuccess, onError) {
    if (file != null) {
      _log("IMAGE: working with " + file.name + ".", app.LOG_DEBUG);

      var reader = new FileReader();
      //#2
      reader.onload = function () {
        _log("IMAGE: resizing file.", app.LOG_DEBUG);
        var image = new Image();
        //#4
        image.onload = function (e) {
          var width = image.width;
          var height = image.height;

          //resizing
          var res;
          if (width > height) {
            res = width / app.image.MAX_IMG_WIDTH;
          } else {
            res = height / app.image.MAX_IMG_HEIGHT;
          }

          width = width / res;
          height = height / res;

          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          var imgContext = canvas.getContext('2d');
          imgContext.drawImage(image, 0, 0, width, height);

          var shrinked = canvas.toDataURL(file.type);

          _log("IMAGE: done shrinking file ("
          + (shrinked.length / 1024) + "KB).", app.LOG_DEBUG);

          onSaveSuccess(shrinked);

        };
        reader.onerror = function (e) {
          _log("IMAGE: reader " + e + ".", app.LOG_ERROR);
          e.message = e.getMessage();
          onError(e);
        };

        //#3
        image.src = reader.result;
      };
      //1#
      reader.readAsDataURL(file);
    }
  };

  /**
   * Saves all the files. Uses recursion.
   *
   * @param files An array of files to be saved
   * @param onSaveAllFilesSuccess
   */
  m.toStringAll = function (files, onSaveAllFilesSuccess, onError) {
    //recursive calling to save all the images
    saveAllFilesRecursive(files, null);
    function saveAllFilesRecursive(files, files_array) {
      files_array = files_array || [];

      //recursive files saving
      if (files.length > 0) {
        var file_info = files.pop();
        //get next file in file array
        var file = file_info['file'];
        var name = file_info['input_field_name'];

        //recursive saving of the files
        var onSaveSuccess = function (file) {
          files_array.push({
            "name": name,
            "value": file,
            "type": 'file'
          });
          saveAllFilesRecursive(files, files_array, onSaveSuccess);
        };
        app.image.toString(file, onSaveSuccess, onError);
      } else {
        onSaveAllFilesSuccess(files_array);
      }
    }
  };

  /**
   * Extracts all files from the page inputs having data-form attribute.
   */
  m.findAll = function (elem) {
    if (elem == null) {
      elem = $(document);
    }

    var files = [];
    $(elem).find('input').each(function (index, input) {
      if ($(input).attr('type') == "file" && input.files.length > 0) {
        var file = app.image.find(input);
        files.push(file);
      }
    });
    return files;
  };

  /**
   * Returns a file object with its name.
   *
   * @param inputId The file input Id
   * @returns {{file: *, input_field_name: *}}
   */
  m.find = function (input) {
    var file = {
      'file': input.files[0],
      'input_field_name': input.attributes.name.value
    };
    return file;
  };

  return m;
}(app.image || {}, jQuery));



/***********************************************************************
 * IO MODULE
 **********************************************************************/

app = app || {};
app.io = (function (m, $) {
  //configuration should be setup in app config file
  m.CONF = {
    RECORD_URL: "" //todo: set to null and throw error if undefined
  };

  /**
   * Sending all saved records.
   *
   * @returns {undefined}
   */
  m.sendAllSavedRecords = function () {
    if (navigator.onLine) {
      function onSuccess() {
        //todo
        var key = Object.keys(records)[0]; //getting the first one of the array
        if (key != null) {
          $.mobile.loading('show');
          _log("IO: sending record: " + key + ".", app.LOG_INFO);
          var onSendSavedSuccess = function (data) {
            var recordKey = this.callback_data.recordKey;
            _log("IO: record ajax (success): " + recordKey + ".", app.LOG_INFO);

            app.record.db.remove(recordKey);
            app.io.sendAllSavedRecords();
          };
          m.sendSavedRecord(key, onSendSavedSuccess);
        } else {
          $.mobile.loading('hide');
        }
      }

      app.record.db.getAll(onSuccess);
    } else {
      $.mobile.loading('show', {
        text: "Looks like you are offline!",
        theme: "b",
        textVisible: true,
        textonly: true
      });

      setTimeout(function () {
        $.mobile.loading('hide');
      }, 3000);
    }
  };

  /**
   * Sends the saved record
   */
  m.sendSavedRecord = function (recordKey, callback, onError, onSend) {
    _log("IO: creating the record.", app.LOG_DEBUG);
    function onSuccess(data) {
      var record = {
        'data': data,
        'recordKey': recordKey
      };

      function onPostError(xhr, ajaxOptions, thrownError) {
        _log("IO: ERROR record ajax (" + xhr.status + " " + thrownError + ").", app.LOG_ERROR);
        //_log(xhr.responseText);
        var err = {
          message: xhr.status + " " + thrownError + " " + xhr.responseText
        };

        onError(err);
      }

      m.postRecord(record, callback, onPostError, onSend)
    }

    app.record.db.getData(recordKey, onSuccess);

  };

  /**
   * Submits the record.
   */
  m.postRecord = function (record, onSuccess, onError, onSend) {
    _log('IO: posting a record with AJAX.', app.LOG_INFO);
    var data = {};
    if (record.data == null) {
      //extract the record data
      form = document.getElementById(record.id);
      data = new FormData(form);
    } else {
      data = record.data;
    }

    //Add authentication
    data = app.auth.append(data);

    $.ajax({
      url: m.getRecordURL(),
      type: 'POST',
      data: data,
      callback_data: record,
      cache: false,
      enctype: 'multipart/form-data',
      processData: false,
      contentType: false,
      success: onSuccess || function (data) {
        var recordKey = this.callback_data.recordKey;
        _log("IO: record ajax (success): " + recordKey + ".", app.LOG_INFO);
      },
      error: onError || function (xhr, ajaxOptions, thrownError) {
        _log("IO: record ajax (" + xhr.status + " " + thrownError + ").", app.LOG_ERROR);
        //_log(xhr.responseText);
      },
      beforeSend: onSend || function () {
        _log("IO: onSend.", app.LOG_DEBUG);
      }
    });
  };

  /**
   * Returns App main record Path.
   *
   * @returns {*}
   */
  m.getRecordURL = function () {
    return Drupal.settings.basePath + m.CONF.RECORD_URL;
  };

  return m;
}(app.io || {}, jQuery));

/***********************************************************************
 * NAVIGATION MODULE
 **********************************************************************/

app = app || {};
app.navigation = (function (m, $) {

  /**
   * Updates the dialog box appended to the page
   * todo: remove hardcoded dialog ID
   */
  m.makeDialog = function (text) {
    $('#app-dialog-content').empty().append(text);
  };

  /**
   * Created a popup.
   * todo: remove hardcoded popup ID
   *
   * @param text
   * @param addClose
   */
  m.popup = function (text, addClose) {
    this.makePopup(text, addClose);
    $('#app-popup').popup();
    $('#app-popup').popup('open').trigger('create');
  };

  /**
   * Updates the popup div appended to the page
   */
  m.makePopup = function (text, addClose) {
    var PADDING_WIDTH = 10;
    var PADDING_HEIGHT = 20;
    var CLOSE_KEY = "<a href='#' data-rel='back' data-role='button '" +
      "data-theme='b' data-icon='delete' data-iconpos='notext '" +
      "class='ui-btn-right ui-link ui-btn ui-btn-b ui-icon-delete " +
      "ui-btn-icon-notext ui-shadow ui-corner-all '" +
      "role='button'>Close</a>";

    if (addClose) {
      text = CLOSE_KEY + text;
    }

    if (PADDING_WIDTH > 0 || PADDING_HEIGHT > 0) {
      text = "<div style='padding:" + PADDING_WIDTH + "px " + PADDING_HEIGHT + "px;'>" +
      text + "<div>";
    }

    $('#app-popup').empty().append(text);
  };

  /**
   * Closes a popup.
   * todo: remove hardcoded popup ID
   */
  m.closePopup = function () {
    $('#app-popup').popup("close");
  };

  /**
   * Creates a loader
   */
  m.makeLoader = function (text, time) {
    //clear previous loader
    $.mobile.loading('hide');

    //display new one
    $.mobile.loading('show', {
      theme: "b",
      html: "<div style='padding:5px 5px;'>" + text + "</div>",
      textVisible: true,
      textonly: true
    });

    setTimeout(function () {
      $.mobile.loading('hide');
    }, time);
  };

  /**
   * Displays a self disappearing lightweight message.
   *
   * @param text
   * @param time 0 if no hiding, null gives default 3000ms delay
   */
  m.message = function (text, time) {
    if (text == null) {
      _log('NAVIGATION: no text provided to message.', app.LOG_ERROR);
      return;
    }

    var messageId = 'appLoaderMessage';

    text = '<div id="' + messageId + '">' + text + '</div>';

    $.mobile.loading('show', {
      theme: "b",
      textVisible: true,
      textonly: true,
      html: text
    });

    //trigger JQM beauty
    $('#' + messageId).trigger('create');

    if (time != 0) {
      setTimeout(function () {
        $.mobile.loading('hide');
      }, time || 3000);
    }
  };

  /**
   * Opens particular app page-path.
   *
   * @param delay
   * @param path If no path supplied goes to app.PATH
   */
  m.go = function (delay, path) {
    setTimeout(function () {
      path = (path == undefined) ? "" : path;
      window.location = Drupal.settings.basePath + app.CONF.HOME + path;
    }, delay);
  };

  /**
   * Opens the app home page.
   */
  //todo: clean setting of the timeout and hardcoded '/form'
  m.goRecord = function (delay) {
    setTimeout(function () {
      $.mobile.changePage(Drupal.settings.mobileIformStartPath + '/form');
    }, delay);
  };

  return m;
}(app.navigation || {}, app.$ || jQuery));

/***********************************************************************
 * RECORD.DB MODULE
 *
 * Takes care of the record database functionality.
 **********************************************************************/

app = app || {};
app.record = app.record || {};

app.record.db = (function (m, $) {
  //todo: move to CONF.
  m.RECORDS = "records";

  m.DB_VERSION = 5;
  m.DB_MAIN = "app";
  m.STORE_RECORDS = "records";

  /**
   * Opens a database connection and returns a records store.
   *
   * @param name
   * @param storeName
   * @param callback
   */
  m.open = function (callback, onError) {
    var req = window.indexedDB.open(m.DB_MAIN, m.DB_VERSION);

    /**
     * On Database opening success, returns the Records object store.
     *
     * @param e
     */
    req.onsuccess = function (e) {
      _log("RECORD.DB: opened successfully.", app.LOG_DEBUG);
      var db = e.target.result;
      var transaction = db.transaction([m.STORE_RECORDS], "readwrite");
      var store = transaction.objectStore(m.STORE_RECORDS);

      if (callback != null) {
        callback(store);
      }
    };

    /**
     * If the Database needs an upgrade or is initialising.
     *
     * @param e
     */
    req.onupgradeneeded = function (e) {
      _log("RECORD.DB: upgrading", app.LOG_INFO);
      var db = e.target.result;

      var store = db.createObjectStore(m.STORE_RECORDS, {'keyPath': 'id'});
      store.createIndex('id', 'id', {unique: true});
    };

    /**
     * Error of opening the database.
     *
     * @param e
     */
    req.onerror = function (e) {
      _log("RECORD.DB: not opened successfully.", app.LOG_ERROR);
      // _log(e);
      e.message = "Database NOT opened successfully.";
      if (onError != null) {
        onError(e);
      }
    };

    /**
     * Error on database being blocked.
     *
     * @param e
     */
    req.onblocked = function (e) {
      _log("RECORD.DB: database blocked.", app.LOG_ERROR);
      // _log(e);
      if (onError != null) {
        onError(e);
      }
    }

  };

  /**
   * Adds a record under a specified key to the database.
   * Note: might be a good idea to move the key assignment away from
   * the function parameters and rather auto assign one and return on callback.
   *
   * @param record
   * @param key
   * @param callback
   * @param onError
   */
  m.add = function (record, key, callback, onError) {
    m.open(function (store) {
      _log("RECORD.DB: adding to the store.", app.LOG_DEBUG);
      record['id'] = key;
      var req = store.add(record);
      req.onsuccess = function (event) {
        if (callback != null) {
          callback();
        }
      };
      store.transaction.db.close();
    }, onError);
  };

  /**
   * Gets a specific saved record from the database.
   * @param recordKey The stored record Id.
   * @returns {*}
   */
  m.get = function (key, callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: getting from the store.', app.LOG_DEBUG);

      var req = store.index('id').get(key);
      req.onsuccess = function (e) {
        var result = e.target.result;

        if (callback != null) {
          callback(result);
        }
      };

    }, onError);
  };

  /**
   * Removes a saved record from the database.
   *
   * @param recordKey
   */
  m.remove = function (key, callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: removing from the store.', app.LOG_DEBUG);

      var req = store.openCursor(IDBKeyRange.only(key));
      req.onsuccess = function () {
        var cursor = req.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          if (callback != null) {
            callback();
          }
        }
      }

    }, onError);
  };

  /**
   * Brings back all saved records from the database.
   */
  m.getAll = function (callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: getting all from the store.', app.LOG_DEBUG);

      // Get everything in the store
      var keyRange = IDBKeyRange.lowerBound(0);
      var req = store.openCursor(keyRange);

      var data = [];
      req.onsuccess = function (e) {
        var result = e.target.result;

        // If there's data, add it to array
        if (result) {
          data.push(result.value);
          result.continue();

          // Reach the end of the data
        } else {
          if (callback != null) {
            callback(data);
          }
        }
      };

    }, onError);
  };

  /**
   * Checks whether the record under a provided key exists in the database.
   *
   * @param key
   * @param callback
   * @param onError
   */
  m.is = function (key, callback, onError) {
    function onSuccess(data) {
      if ($.isPlainObject(data)) {
        if (callback != null) {
          callback(!$.isEmptyObject(data));
        }
      } else {
        if (callback != null) {
          callback(data != null);
        }
      }
    }

    this.get(key, onSuccess, onError);
  };

  /**
   * Clears all the saved records.
   */
  m.clear = function (callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: clearing store.', app.LOG_DEBUG);
      store.clear();

      if (callback != null) {
        callback(data);
      }
    }, onError);
  };

  /**
   * Returns a specific saved record in FormData format.
   *
   * @param recordKey
   * @returns {FormData}
   */
  m.getData = function (recordKey, callback, onError) {
    function onSuccess(savedRecord) {
      var data = new FormData();

      for (var k = 0; k < savedRecord.length; k++) {
        if (savedRecord[k].type == "file") {
          var file = savedRecord[k].value;
          var type = file.split(";")[0].split(":")[1];
          var extension = type.split("/")[1];
          data.append(savedRecord[k].name, dataURItoBlob(file, type), "pic." + extension);
        } else {
          var name = savedRecord[k].name;
          var value = savedRecord[k].value;
          data.append(name, value);
        }
      }
      callback(data);
    }

    //Extract data from database
    var savedRecord = this.get(recordKey, onSuccess, onError);
  };

  /**
   * Saves a record using dynamic inputs.
   */
  m.save = function (callback, onError) {
    _log("RECORD.DB: saving dynamic record.", app.LOG_INFO);
    //get new record ID
    var settings = app.record.getSettings();
    var savedRecordId = ++settings[app.record.LASTID];

    //INPUTS
    var onExtractFilesSuccess = function (files_array) {
      var record_array = app.record.extract();
      //merge files and the rest of the inputs
      record_array = record_array.concat(files_array);

      _log("RECORD.DB: saving the record into database.", app.LOG_DEBUG);
      function onSuccess() {
        //on record save success
        app.record.setSettings(settings);

        if (callback != null) {
          callback(savedRecordId);
        }
      }

      m.add(record_array, savedRecordId, onSuccess, onError);
    };

    app.image.extractAllToArray(null, onExtractFilesSuccess, onError);
    return app.TRUE;
  };

  /*
   * Saves the provided record.
   * Returns the savedRecordId of the saved record, otherwise an app.ERROR.
   */
  m.saveForm = function (formId, onSuccess) {
    _log("RECORD.DB: saving a DOM record.", app.LOG_INFO);
    var records = this.getAll();

    //get new record ID
    var settings = app.record.getSettings();
    var savedRecordId = ++settings[app.record.LASTID];

    //INPUTS
    //todo: refactor to $record
    var record = $(formId);
    var onSaveAllFilesSuccess = function (files_array) {
      //get all the inputs/selects/textboxes into array
      var record_array = app.record.extractFromRecord(record);

      //merge files and the rest of the inputs
      record_array = record_array.concat(files_array);

      _log("RECORD.DB: saving the record into database.", app.LOG_DEBUG);
      try {
        records[savedRecordId] = record_array;
        m.setAll(records);
        app.record.setSettings(settings);
      } catch (e) {
        _log("RECORD.DB: while saving the record.", app.LOG_ERROR);
        //_log(e);
        return app.ERROR;
      }

      if (onSuccess != null) {
        onSuccess(savedRecordId);
      }
    };

    app.image.getAll(onSaveAllFilesSuccess);
    return app.TRUE;
  };

  return m;
}(app.record.db || {}, app.$ || jQuery));

/***********************************************************************
 * RECORD.INPUTS MODULE
 *
 * Object responsible for record input management.
 **********************************************************************/

app = app || {};
app.record = app.record || {};

app.record.inputs = (function (m, $) {
  //todo: move KEYS to CONF.
  m.KEYS = {
    'SREF': 'sample:entered_sref',
    'SREF_SYSTEM': 'sample:entered_sref_system',
    'SREF_ACCURACY': 'smpAttr:273',
    'TAXON': 'occurrence:taxa_taxon_list_id',
    'DATE': 'sample:date'
  };

  /**
   * Sets an input in the current record.
   *
   * @param item Input name
   * @param data Input value
   */
  m.set = function (item, data) {
    var record = app.record.get();
    record[item] = data;
    app.record.set(record);
  };

  /**
   * Returns an input value from the current record.
   *
   * @param item The Input name
   * @returns {*} null if the item does not exist
   */
  m.get = function (item) {
    var record = app.record.get();
    return record[item];
  };

  /**
   * Removes an input from the current record.
   *
   * @param item Input name
   */
  m.remove = function (item) {
    var record = app.record.get();
    delete record[item];
    app.record.set(record);
  };

  /**
   * Checks if the input is setup.
   *
   * @param item Input name
   * @returns {boolean}
   */
  m.is = function (item) {
    var val = this.get(item);
    if ($.isPlainObject(val)) {
      return !$.isEmptyObject(val);
    } else {
      return val != null;
    }
  };

  return m;
}(app.record.inputs || {}, app.$ || jQuery));

/***********************************************************************
 * RECORD MODULE
 *
 * Things to work on:
 *  - Validation should be moved to the app controllers level.
 **********************************************************************/

app = app || {};
app.record = (function (m, $) {

  //CONSTANTS
  //todo: add _KEY to each constant name to distinguish all KEYS
  m.RECORD = "record"; //name under which the record is stored
  m.MULTIPLE_GROUP_KEY = "multiple_"; //to separate a grouped input
  m.COUNT = "record_count";
  m.STORAGE = "record_";
  m.PIC = "_pic_";
  m.DATA = "data";
  m.FILES = "files";
  m.SETTINGS = "recordSettings";
  m.LASTID = "lastId";

  //GLOBALS
  m.totalFiles = 0;

  /**
   * Initialises the recording environment.
   *
   * @returns {*}
   */
  m.init = function () {
    var settings = m.getSettings();
    if (settings == null) {
      settings = {};
      settings[m.LASTID] = 0;
      m.setSettings(settings);
      return settings;
    }
    return null;
  };

  /**
   * Record settings. A separate DOM storage unit for storing
   * recording specific data.
   * Note: in the future, if apart of LastFormId no other uses arises
   * should be merged with default app.settings.
   *
   * @param settings
   */
  m.setSettings = function (settings) {
    app.storage.set(m.SETTINGS, settings);
  };

  /**
   * Initializes and returns the settings.
   *
   * @returns {{}}
   */
  m.initSettings = function () {
    var settings = {};
    settings[m.LASTID] = 0;
    m.setSettings(settings);
    return settings;
  };

  /**
   * Returns the settings.
   *
   * @returns {*|{}}
   */
  m.getSettings = function () {
    var settings = app.storage.get(m.SETTINGS) || m.initSettings();
    return settings;
  };

  /**
   * Returns the current record.
   *
   * @returns {*}
   */
  m.get = function () {
    return app.storage.tmpGet(m.RECORD) || {};
  };

  /**
   * Sets the current record.
   *
   * @param record The currenr record to be stored.
   */
  m.set = function (record) {
    app.storage.tmpSet(m.RECORD, record);
  };

  /**
   * Clears the current record.
   */
  m.clear = function () {
    app.storage.tmpRemove(m.RECORD);
  };

  /**
   * TODO: this and validator() functions need refactoring.
   *
   * @param recordId
   */
  m.addValidator = function (recordId) {
    //todo: refactor to $validator
    var validator = $(recordId).validate({
      ignore: ":hidden,.inactive",
      errorClass: "inline-error",
      errorElement: 'p',
      highlight: function (element, errorClass) {
        //todo: refactor to $jqElement
        var jqElement = $(element);
        if (jqElement.is(':radio') || jqElement.is(':checkbox')) {
          //if the element is a radio or checkbox group then highlight the group
          var jqBox = jqElement.parents('.control-box');
          if (jqBox.length !== 0) {
            jqBox.eq(0).addClass('ui-state-error');
          } else {
            jqElement.addClass('ui-state-error');
          }
        } else {
          jqElement.addClass('ui-state-error');
        }
      },
      unhighlight: function (element, errorClass) {
        //todo: refactor to $jqElement
        var jqElement = $(element);
        if (jqElement.is(':radio') || jqElement.is(':checkbox')) {
          //if the element is a radio or checkbox group then highlight the group
          var jqBox = jqElement.parents('.control-box');
          if (jqBox.length !== 0) {
            jqBox.eq(0).removeClass('ui-state-error');
          } else {
            jqElement.removeClass('ui-state-error');
          }
        } else {
          jqElement.removeClass('ui-state-error');
        }
      },
      invalidHandler: function (record, validator) {
        var tabselected = false;
        jQuery.each(validator.errorMap, function (ctrlId, error) {
          // select the tab containing the first error control
          var ctrl = jQuery('[name=' + ctrlId.replace(/:/g, '\\:').replace(/\[/g, '\\[').replace(/\]/g, '\\]') + ']');
          if (!tabselected) {
            var tp = ctrl.filter('input,select,textarea').closest('.ui-tabs-panel');
            if (tp.length === 1) {
              $(tp).parent().tabs('select', tp.id);
            }
            tabselected = true;
          }
          ctrl.parents('fieldset').removeClass('collapsed');
          ctrl.parents('.fieldset-wrapper').show();
        });
      },
      messages: [],
      errorPlacement: function (error, element) {
        var jqBox, nexts;
        if (element.is(':radio') || element.is(':checkbox')) {
          jqBox = element.parents('.control-box');
          element = jqBox.length === 0 ? element : jqBox;
        }
        nexts = element.nextAll(':visible');
        element = nexts && $(nexts[0]).hasClass('deh-required') ? nexts[0] : element;
        error.insertAfter(element);
      }
    });
    //Don't validate whilst user is still typing in field
    //validator.settings.onkeyup = false;
  };

  /**
   * Record validation.
   */
  m.validate = function (recordId) {
    var invalids = [];

    //todo: refactor to $tabinputs
    var tabinputs = $('#' + recordId).find('input,select,textarea').not(':disabled,[name=],.scTaxonCell,.inactive');
    if (tabinputs.length > 0) {
      tabinputs.each(function (index) {
        if (!$(this).valid()) {
          var found = false;

          //this is necessary to check if there was an input with
          //the same name in the invalids array, if found it means
          //this new invalid input belongs to the same group and should
          //be ignored.
          for (var i = 0; i < invalids.length; i++) {
            if (invalids[i].name == (app.record.MULTIPLE_GROUP_KEY + this.name)) {
              found = true;
              break;
            }
            if (invalids[i].name == this.name) {
              var new_id = (this.id).substr(0, this.id.lastIndexOf(':'));
              invalids[i].name = app.record.MULTIPLE_GROUP_KEY + this.name;
              invalids[i].id = new_id;
              found = true;
              break;
            }
          }
          //save the input as a invalid
          if (!found)
            invalids.push({"name": this.name, "id": this.id});
        }
      });
    }

    //todo: refactor to $tabtaxoninputs
    var tabtaxoninputs = $('#entry_record .scTaxonCell').find('input,select').not(':disabled');
    if (tabtaxoninputs.length > 0) {
      tabtaxoninputs.each(function (index) {
        invalids.push({"name": this.name, "id": this.id});
      });
    }

    //constructing a response about invalid fields to the user
    if (invalids.length > 0) {
      return invalids;
    }
    return [];
  };

  /**
   * Returns a recording record array from stored inputs.
   */
  m.extract = function () {
    //extract record data
    var record_array = [];
    var inputName, inputValue;

    var record = app.record.get();
    if (record == null) {
      return record_array;
    }
    var inputs = Object.keys(record);
    for (var inputNum = 0; inputNum < inputs.length; inputNum++) {
      inputName = inputs[inputNum];
      inputValue = record[inputName];
      record_array.push({
        "name": inputName,
        "value": inputValue
      });
    }

    return record_array;
  };

  /**
   * Extracts data (apart from files) from provided record into a record_array that it returns.
   *
   * @param record
   * @returns {Array}
   */
  m.extractFromRecord = function (record) {
    //extract record data
    var record_array = [];
    var name, value, type, id, needed;

    record.find('input').each(function (index, input) {
      //todo: refactor to $NAME
      name = $(input).attr("name");
      value = $(input).attr('value');
      type = $(input).attr('type');
      id = $(input).attr('id');
      needed = true; //if the input is empty, no need to send it

      switch (type) {
        case "checkbox":
          needed = $(input).is(":checked");
          break;
        case "text":
          value = $(input).val();
          break;
        case "radio":
          needed = $(input).is(":checked");
          break;
        case "button":
        case "file":
          needed = false;
          //do nothing as the files are all saved
          break;
        case "hidden":
          break;
        default:
          _log("RECORD: unknown input type: " + type + '.', app.LOG_ERROR);
          break;
      }

      if (needed) {
        if (value != "") {
          record_array.push({
            "name": name,
            "value": value,
            "type": type
          });
        }
      }
    });

    //TEXTAREAS
    record.find('textarea').each(function (index, textarea) {
      //todo: refactor to $NAME
      name = $(textarea).attr('name');
      value = $(textarea).val();
      type = "textarea";

      if (value != "") {
        record_array.push({
          "name": name,
          "value": value,
          "type": type
        });
      }
    });

    //SELECTS
    record.find("select").each(function (index, select) {
      //todo: refactor to $NAME
      name = $(select).attr('name');
      value = $(select).find(":selected").val();
      type = "select";

      if (value != "") {
        record_array.push({
          "name": name,
          "value": value,
          "type": type
        });
      }
    });

    return record_array;
  };

  return m;
}(app.record || {}, app.$ || jQuery));

/***********************************************************************
 * STORAGE MODULE
 **********************************************************************/

app = app || {};
app.storage = (function (m, $) {
  /**
   * Checks if there is enough space in the storage.
   *
   * @param size
   * @returns {*}
   */
  m.hasSpace = function (size) {
    return localStorageHasSpace(size);
  };

  /**
   * Gets an item from the storage.
   *
   * @param item
   */
  m.get = function (item) {
    item = app.CONF.NAME + '_' + item;

    var data = localStorage.getItem(item);
    data = JSON.parse(data);
    return data;
  };

  /**
   * Sets an item in the storage.
   * Note: it overrides any existing item with the same name.
   *
   * @param item
   */
  m.set = function (item, data) {
    item = app.CONF.NAME + '_' + item;

    data = JSON.stringify(data);
    return localStorage.setItem(item, data);
  };

  /**
   * Removes the item from the storage.
   *
   * @param item
   */
  m.remove = function (item) {
    item = app.CONF.NAME + '_' + item;

    return localStorage.removeItem(item);
  };

  /**
   * Checks if the item exists.
   *
   * @param item Input name
   * @returns {boolean}
   */
  m.is = function (item) {
    var val = this.get(item);
    if ($.isPlainObject(val)) {
      return !$.isEmptyObject(val);
    } else {
      return val != null;
    }
  };

  /**
   * Clears the storage.
   */
  m.clear = function () {
    _log('STORAGE: clearing', app.LOG_DEBUG);

    localStorage.clear();
  };

  /**
   * Returns the item from the temporary storage.
   *
   * @param item
   */
  m.tmpGet = function (item) {
    item = app.CONF.NAME + '_' + item;

    var data = sessionStorage.getItem(item);
    data = JSON.parse(data);
    return data;
  };

  /**
   * Sets an item in temporary storage.
   *
   * @param item
   */
  m.tmpSet = function (item, data) {
    item = app.CONF.NAME + '_' + item;

    data = JSON.stringify(data);
    return sessionStorage.setItem(item, data);
  };

  /**
   * Removes an item in temporary storage.
   *
   * @param item
   */
  m.tmpRemove = function (item) {
    item = app.CONF.NAME + '_' + item;

    return sessionStorage.removeItem(item);
  };

  /**
   * Checks if the temporary item exists.
   *
   * @param item Input name
   * @returns {boolean}
   */
  m.tmpIs = function (item) {
    var val = this.tmpGet(item);
    if ($.isPlainObject(val)) {
      return !$.isEmptyObject(val);
    } else {
      return val != null;
    }
  };

  /**
   * Clears the temporary storage.
   */
  m.tmpClear = function () {
    _log('STORAGE: clearing temporary', app.LOG_DEBUG);

    sessionStorage.clear();
  };

  /**
   * Checks if it is possible to store some sized data in localStorage.
   */
  function localStorageHasSpace(size) {
    var taken = JSON.stringify(localStorage).length;
    var left = 1024 * 1024 * 5 - taken;
    if ((left - size) > 0)
      return 1;
    else
      return 0;
  }

  return m;
}(app.storage || {}, jQuery));



/*##############
 ## HELPER  ####
  //todo: should find a better place for this.
 ##############*/

/**
 * Converts DataURI object to a Blob.
 *
 * @param {type} form_count
 * @param {type} pic_count
 * @param {type} file
 * @returns {undefined}
 */
function dataURItoBlob(dataURI, file_type) {
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {
    type: file_type
  });
}