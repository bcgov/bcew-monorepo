<?php
/**
 * Title: HPOROO Base Footer
 * Slug: design-system-wordpress-child-theme-hporoo/hporoo-base-footer
 * Categories: footer
 *
 * @package Design-System-WordPress-Theme
 */
?>

<!-- wp:group {"metadata":{"name":"DSWP Information Contact Socials","categories":["contact"],"patternName":"design-system-wordpress-theme/dswp-information-contact-socials"},"style":{"spacing":{"padding":{"right":"var:preset|spacing|60","left":"var:preset|spacing|60"},"margin":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"
    style="margin-top:var(--wp--preset--spacing--60);margin-bottom:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--60)">
    <!-- wp:group {"className":"dswp-information-contact-socials-cards","style":{"spacing":{"padding":{"right":"0","left":"0","top":"0","bottom":"0"}},"border":{"radius":"0px","width":"1px"}},"borderColor":"border-default","layout":{"type":"constrained"}} -->
    <div class="wp-block-group dswp-information-contact-socials-cards has-border-color has-border-default-border-color"
        style="border-width:1px;border-radius:0px;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}},"border":{"radius":{"topLeft":"5px","topRight":"5px","bottomLeft":"0px","bottomRight":"0px"}}},"backgroundColor":"bar-colour","layout":{"type":"flex","orientation":"vertical"}} -->
        <div class="wp-block-group has-bar-colour-background-color has-background"
            style="border-top-left-radius:5px;border-top-right-radius:5px;border-bottom-left-radius:0px;border-bottom-right-radius:0px;padding-top:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40)">
            <!-- wp:heading {"level":4,"style":{"spacing":{"padding":{"right":"var:preset|spacing|50","left":"var:preset|spacing|50"}},"elements":{"link":{"color":{"text":"var:preset|color|background-white"}}}},"textColor":"background-white"} -->
            <h4 class="wp-block-heading has-background-white-color has-text-color has-link-color"
                style="padding-right:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">Contact
                us</h4>
            <!-- /wp:heading -->
        </div>
        <!-- /wp:group -->

        <!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|50","left":"var:preset|spacing|50","top":"0","bottom":"0"},"margin":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group"
            style="margin-top:var(--wp--preset--spacing--20);margin-bottom:var(--wp--preset--spacing--20);padding-top:0;padding-right:var(--wp--preset--spacing--50);padding-bottom:0;padding-left:var(--wp--preset--spacing--50)">
            <!-- wp:group {"templateLock":false,"lock":{"move":false,"remove":false},"metadata":{"categories":["text"],"patternName":"design-system-wordpress-theme/dswp-horizontal-card","name":"DSWP Information Contact Socials"},"style":{"spacing":{"padding":{"top":"0","bottom":"0"},"margin":{"top":"0","bottom":"0"},"blockGap":"0"}},"layout":{"type":"constrained","justifyContent":"center"}} -->
            <div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0">
                <!-- wp:columns {"verticalAlignment":"center","className":"dswp-columns","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"right":"0","left":"0"},"blockGap":{"top":"0","left":"var:preset|spacing|80"}}}} -->
                <div class="wp-block-columns are-vertically-aligned-center dswp-columns"
                    style="margin-top:0;margin-bottom:0;padding-right:0;padding-left:0">
                    <!-- wp:column {"verticalAlignment":"center","width":"50%","className":"dswp-information-contact-socials-card","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}}} -->
                    <div class="wp-block-column is-vertically-aligned-center dswp-information-contact-socials-card"
                        style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;flex-basis:50%">
                        <!-- wp:group {"className":"dswp-information-contact-socials-card-content","style":{"spacing":{"padding":{"right":"0","left":"0","top":"0"},"margin":{"top":"0","bottom":"0"},"blockGap":"0"},"layout":{"selfStretch":"fit","flexSize":null}},"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"top"}} -->
                        <div class="wp-block-group dswp-information-contact-socials-card-content"
                            style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-left:0">
                            <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
                            <div class="wp-block-group" style="padding-top:0;padding-bottom:0">
                                <!-- wp:group {"className":"dswp-information-contact-socials-card-img-group","layout":{"type":"constrained"}} -->
                                <div class="wp-block-group dswp-information-contact-socials-card-img-group">
                                    <!-- wp:image {"width":"32px","height":"auto","linkDestination":"none","className":"dswp-information-contact-socials-card-img"} -->
                                    <figure class="wp-block-image is-resized dswp-information-contact-socials-card-img">
                                        <img src="<?php echo esc_url(get_stylesheet_directory_uri() . '/assets/images/phone-solid-full.svg' );?>"
                                            alt="Phone" style="width:32px;height:auto" /></figure>
                                    <!-- /wp:image -->
                                </div>
                                <!-- /wp:group -->

                                <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                                <div class="wp-block-group">
                                    <!-- wp:heading {"level":6,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|font dark"}}},"typography":{"fontSize":"16px"}},"textColor":"font dark"} -->
                                    <h6 class="wp-block-heading has-font-dark-color has-text-color has-link-color"
                                        style="margin-top:0;margin-bottom:0;font-size:16px">General inquiries:</h6>
                                    <!-- /wp:heading -->

                                    <!-- wp:paragraph {"style":{"typography":{"fontSize":"16px"}}} -->
                                    <p style="font-size:16px"><a href="tel:236-475-3059" data-type="internal"
                                            data-id="#test">236-475-3059</a> (toll free)</p>
                                    <!-- /wp:paragraph -->
                                </div>
                                <!-- /wp:group -->
                            </div>
                            <!-- /wp:group -->
                        </div>
                        <!-- /wp:group -->
                    </div>
                    <!-- /wp:column -->

                    <!-- wp:column {"verticalAlignment":"center","width":"50%","className":"dswp-information-contact-socials-card","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}}} -->
                    <div class="wp-block-column is-vertically-aligned-center dswp-information-contact-socials-card"
                        style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;flex-basis:50%">
                        <!-- wp:group {"className":"dswp-information-contact-socials-card-content","style":{"spacing":{"padding":{"right":"0","left":"0","top":"0"},"margin":{"top":"0","bottom":"0"},"blockGap":"0"},"layout":{"selfStretch":"fit","flexSize":null}},"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"top"}} -->
                        <div class="wp-block-group dswp-information-contact-socials-card-content"
                            style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-left:0">
                            <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
                            <div class="wp-block-group" style="padding-top:0;padding-bottom:0">
                                <!-- wp:group {"className":"dswp-information-contact-socials-card-img-group","layout":{"type":"constrained"}} -->
                                <div class="wp-block-group dswp-information-contact-socials-card-img-group">
                                    <!-- wp:image {"width":"32px","linkDestination":"none","className":"dswp-information-contact-socials-card-img"} -->
                                    <figure class="wp-block-image is-resized dswp-information-contact-socials-card-img">
                                        <img src="<?php echo esc_url(get_stylesheet_directory_uri() . '/assets/images/phone-solid-full.svg' );?>"
                                            alt="Phone" style="width:32px" /></figure>
                                    <!-- /wp:image -->
                                </div>
                                <!-- /wp:group -->

                                <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                                <div class="wp-block-group">
                                    <!-- wp:heading {"level":6,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|font dark"}}},"typography":{"fontSize":"16px"}},"textColor":"font dark"} -->
                                    <h6 class="wp-block-heading has-font-dark-color has-text-color has-link-color"
                                        style="margin-top:0;margin-bottom:0;font-size:16px">Complaints:</h6>
                                    <!-- /wp:heading -->

                                    <!-- wp:paragraph {"style":{"typography":{"fontSize":"16px"}}} -->
                                    <p style="font-size:16px"><a href="tel:236-478-1446" data-type="internal"
                                            data-id="#test">236-478-1446</a></p>
                                    <!-- /wp:paragraph -->
                                </div>
                                <!-- /wp:group -->
                            </div>
                            <!-- /wp:group -->
                        </div>
                        <!-- /wp:group -->
                    </div>
                    <!-- /wp:column -->
                </div>
                <!-- /wp:columns -->

                <!-- wp:columns {"verticalAlignment":"center","className":"dswp-columns","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"right":"0","left":"0"},"blockGap":{"left":"var:preset|spacing|80"}}}} -->
                <div class="wp-block-columns are-vertically-aligned-center dswp-columns"
                    style="margin-top:0;margin-bottom:0;padding-right:0;padding-left:0">
                    <!-- wp:column {"verticalAlignment":"center","width":"50%","className":"dswp-information-contact-socials-card","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}}} -->
                    <div class="wp-block-column is-vertically-aligned-center dswp-information-contact-socials-card"
                        style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;flex-basis:50%">
                        <!-- wp:group {"className":"dswp-information-contact-socials-card-content","style":{"spacing":{"padding":{"right":"0","left":"0","top":"0"},"margin":{"top":"0","bottom":"0"},"blockGap":"0"},"layout":{"selfStretch":"fit","flexSize":null}},"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"top"}} -->
                        <div class="wp-block-group dswp-information-contact-socials-card-content"
                            style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-left:0">
                            <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top","orientation":"horizontal"}} -->
                            <div class="wp-block-group" style="padding-top:0;padding-bottom:0">
                                <!-- wp:group {"className":"dswp-information-contact-socials-card-img-group","layout":{"type":"constrained"}} -->
                                <div class="wp-block-group dswp-information-contact-socials-card-img-group">
                                    <!-- wp:image {"scale":"cover","linkDestination":"none","className":"dswp-information-contact-socials-card-img is-style-default"} -->
                                    <figure
                                        class="wp-block-image dswp-information-contact-socials-card-img is-style-default">
                                        <img src="<?php echo esc_url(get_stylesheet_directory_uri() . '/assets/images/envelope-open-solid-full.svg' );?>"
                                            alt="Email" style="object-fit:cover" /></figure>
                                    <!-- /wp:image -->
                                </div>
                                <!-- /wp:group -->

                                <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                                <div class="wp-block-group">
                                    <!-- wp:heading {"level":6,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|font dark"}}},"typography":{"fontSize":"16px"}},"textColor":"font dark"} -->
                                    <h6 class="wp-block-heading has-font-dark-color has-text-color has-link-color"
                                        style="margin-top:0;margin-bottom:0;font-size:16px">Email:</h6>
                                    <!-- /wp:heading -->

                                    <!-- wp:paragraph {"style":{"typography":{"fontSize":"16px"}}} -->
                                    <p style="font-size:16px"><a href="mailto:info@hporoo.ca" data-type="internal"
                                            data-id="#test">info@hporoo.ca</a>
                                    </p>
                                    <!-- /wp:paragraph -->
                                </div>
                                <!-- /wp:group -->
                            </div>
                            <!-- /wp:group -->
                        </div>
                        <!-- /wp:group -->
                    </div>
                    <!-- /wp:column -->

                    <!-- wp:column {"verticalAlignment":"center","width":"50%","className":"dswp-information-contact-socials-card","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}}} -->
                    <div class="wp-block-column is-vertically-aligned-center dswp-information-contact-socials-card"
                        style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;flex-basis:50%">
                        <!-- wp:group {"className":"dswp-information-contact-socials-card-content","style":{"spacing":{"padding":{"right":"0","left":"0","top":"0"},"margin":{"top":"0","bottom":"0"},"blockGap":"0"},"layout":{"selfStretch":"fit","flexSize":null}},"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"top"}} -->
                        <div class="wp-block-group dswp-information-contact-socials-card-content"
                            style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-left:0">
                            <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
                            <div class="wp-block-group" style="padding-top:0;padding-bottom:0">
                                <!-- wp:group {"className":"dswp-information-contact-socials-card-img-group","layout":{"type":"constrained"}} -->
                                <div class="wp-block-group dswp-information-contact-socials-card-img-group">
                                    <!-- wp:image {"width":"32px","linkDestination":"none","className":"dswp-information-contact-socials-card-img"} -->
                                    <figure class="wp-block-image is-resized dswp-information-contact-socials-card-img">
                                        <img src="<?php echo esc_url(get_stylesheet_directory_uri() . '/assets/images/building-solid-full.svg' );?>"
                                            alt="Address" style="width:32px" /></figure>
                                    <!-- /wp:image -->
                                </div>
                                <!-- /wp:group -->

                                <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","orientation":"vertical","flexWrap":"wrap"}} -->
                                <div class="wp-block-group">
                                    <!-- wp:heading {"level":6,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|font dark"}}},"typography":{"fontSize":"16px"}},"textColor":"font dark"} -->
                                    <h6 class="wp-block-heading has-font-dark-color has-text-color has-link-color"
                                        style="margin-top:0;margin-bottom:0;font-size:16px">Mailing address:</h6>
                                    <!-- /wp:heading -->

                                    <!-- wp:group {"layout":{"type":"constrained"}} -->
                                    <div class="wp-block-group">
                                        <!-- wp:paragraph {"align":"left","style":{"layout":{"selfStretch":"fit","flexSize":null},"elements":{"link":{"color":{"text":"var:preset|color|font dark"}}},"typography":{"fontSize":"16px"}},"textColor":"font dark"} -->
                                        <p class="has-text-align-left has-font-dark-color has-text-color has-link-color"
                                            style="font-size:16px">
                                            PO
                                            Box 9639 Stn Prov Govt<br>Victoria, B.C. V8W 9P1</p>
                                        <!-- /wp:paragraph -->
                                    </div>
                                    <!-- /wp:group -->
                                </div>
                                <!-- /wp:group -->
                            </div>
                            <!-- /wp:group -->
                        </div>
                        <!-- /wp:group -->
                    </div>
                    <!-- /wp:column -->
                </div>
                <!-- /wp:columns -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","theme":"design-system-wordpress-child-theme-hporoo","area":"footer"} /-->