<?php

/**
 * @file
 * Default theme implementation to display the basic html structure of a single
 * Drupal page.
 *
 * Variables:
 * - $css: An array of CSS files for the current page.
 * - $language: (object) The language the site is being displayed in.
 *   $language->language contains its textual representation.
 *   $language->dir contains the language direction. It will either be 'ltr' or 'rtl'.
 * - $rdf_namespaces: All the RDF namespace prefixes used in the HTML document.
 * - $grddl_profile: A GRDDL profile allowing agents to extract the RDF data.
 * - $head_title: A modified version of the page title, for use in the TITLE
 *   tag.
 * - $head_title_array: (array) An associative array containing the string parts
 *   that were used to generate the $head_title variable, already prepared to be
 *   output as TITLE tag. The key/value pairs may contain one or more of the
 *   following, depending on conditions:
 *   - title: The title of the current page, if any.
 *   - name: The name of the site.
 *   - slogan: The slogan of the site, if any, and if there is no title.
 * - $head: Markup for the HEAD section (including meta tags, keyword tags, and
 *   so on).
 * - $styles: Style tags necessary to import all CSS files for the page.
 * - $scripts: Script tags necessary to load the JavaScript files and settings
 *   for the page.
 * - $page_top: Initial markup from any modules that have altered the
 *   page. This variable should always be output first, before all other dynamic
 *   content.
 * - $page: The rendered page content.
 * - $page_bottom: Final closing markup from any modules that have altered the
 *   page. This variable should always be output last, after all other dynamic
 *   content.
 * - $classes String of classes that can be used to style contextually through
 *   CSS.
 *
 * @see template_preprocess()
 * @see template_preprocess_html()
 * @see template_process()
 */

// Get settings to pass to JavaScript
$start_path = base_path() . mobile_jquery_theme_get_setting('app_home');
// Get path to JavaScript
$theme_path = base_path() . $GLOBALS['theme_path'];
$iform_mobile_path = 'sites/all/modules/iform_mobile/';
?>

<!DOCTYPE html>
<html>
<head>
    <link rel="manifest" href="<?php echo $theme_path ?>/manifest.json">

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1,
        minimum-scale=1, maximum-scale=1, user-scalable=no"/>
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="Lichen App">
    <meta name="application-name" content="Lichen App">
    <meta name="format-detection" content="telephone=no">

    <!-- ICONS -->
    <link rel="icon" type="image/vnd.microsoft.icon" href="<?php echo $theme_path ?>/images/favicon.ico">
    <link rel="icon" sizes="192x192" href="<?php echo $theme_path ?>/images/Icon-192.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php echo $theme_path ?>/images/Icon-72.png">
    <link rel="apple-touch-icon-precomposed" sizes="76x76" href="<?php echo $theme_path ?>/images/Icon-76.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?php echo $theme_path ?>/images/Icon@2x.png">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?php echo $theme_path ?>/images/Icon-72@2x.png">
    <link rel="apple-touch-icon-precomposed" sizes="152x152" href="<?php echo $theme_path ?>/images/Icon-76@2x.png">
    <link rel="apple-touch-icon-precomposed" sizes="180x180" href="<?php echo $theme_path ?>/images/Icon-60@3x.png">

    <!-- CSS -->
    <?php print $styles; ?>

    <!-- JavaScript -->
    <?php print $scripts; ?>

    <script>
        Drupal.settings.themePath = '<?php echo $theme_path ?>';
    </script>

</head>
<body class="<?php print $classes; ?>" <?php print $attributes; ?>>
<?php print $page_top; ?>
<?php print $page; ?>
<?php print $page_bottom; ?>
</body>
</html>
