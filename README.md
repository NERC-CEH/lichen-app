This is a Drupal Mobile Lichen app theme consisting of pages
source and controllers, as well as styling and configuration.

## Requirements

This theme uses Drupal 7 [iform_mobile](http://indicia-docs.readthedocs.org/en/latest/site-building/iform/modules/mobile/) 
& [iform_mobile_auth](http://indicia-docs.readthedocs.org/en/latest/site-building/iform/modules/mobile-auth/)
modules for interacting with Indicia Biological Records database (default iRecord).

## Configuration

App configuration hosted in `THEME_SOURCE/scripts/conf.js`.

**Note:** it should be done *before* building the code.

## Building

- Install [NodeJS](http://nodejs.org/)
- Open terminal in module's `THEME_SOURCE/scripts` directory
- `npm install`
- `grunt`

This will create a `scripts` folder with the javascript code (`theme.js`) used by the theme.


## Bugs and feature requests

Have a bug or a feature request? search for existing and closed issues. [Please open a new issue](https://github.com/NERC-CEH/mobile_lichen/issues).


## Creators

**Karolis Kazlauskis**

- <https://github.com/kazlauskis>



## Copyright and license

Code and documentation copyright 2014 CEH. Code released under the [GNU GPL v3 license](LICENSE).
