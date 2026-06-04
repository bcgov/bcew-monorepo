<?php
/**
 * Title: Tribunal Base Footer
 * Slug: design-system-wordpress-child-theme-hporoo/tribunal-base-footer
 * Categories: footer
 *
 * @package Design-System-WordPress-Theme
 */

$phone_icon = esc_url( get_stylesheet_directory_uri() . '/assets/images/phone-solid-full.svg' );
$email_icon = esc_url( get_stylesheet_directory_uri() . '/assets/images/envelope-open-solid-full.svg' );
$mail_icon  = esc_url( get_stylesheet_directory_uri() . '/assets/images/building-solid-full.svg' );
?>

<!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|40","left":"var:preset|spacing|40"},"margin":{"bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"
    style="margin-bottom:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
    <!-- wp:group {"className":"dswp-information-contact-socials-cards","style":{"spacing":{"padding":{"right":"0","left":"0","top":"0","bottom":"0"}},"border":{"radius":"0px","width":"1px"}},"borderColor":"border-default","layout":{"type":"constrained"}} -->
    <div class="wp-block-group dswp-information-contact-socials-cards has-border-color has-border-default-border-color"
        style="border-width:1px;border-radius:0px;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}},"border":{"radius":{"topLeft":"5px","topRight":"5px","bottomLeft":"0px","bottomRight":"0px"}}},"backgroundColor":"primary-tribunal","layout":{"type":"flex","orientation":"vertical"}} -->
        <div class="wp-block-group has-primary-tribunal-background-color has-background"
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
                <!-- wp:columns {"verticalAlignment":"center","className":"dswp-columns","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"right":"0","left":"0"},"blockGap":{"top":"0","left":"var:preset|spacing|40"}}}} -->
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
                                    <!-- wp:image {"width":"16px","linkDestination":"none","className":"dswp-information-contact-socials-card-img is-style-default"} -->
                                    <figure
                                        class="wp-block-image is-resized dswp-information-contact-socials-card-img is-style-default">
                                        <img src="<?php echo esc_attr( $email_icon ); ?>" alt="Email" style="width:16px" />
                                    </figure>
                                    <!-- /wp:image -->
                                </div>
                                <!-- /wp:group -->

                                <!-- wp:group {"style":{"spacing":{"blockGap":"0"},"typography":{"lineHeight":"1.68"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                                <div class="wp-block-group" style="line-height:1.68">
                                    <!-- wp:heading {"level":6,"style":{"spacing":{"margin":{"top":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|font dark"}}},"typography":{"fontSize":"16px"}},"textColor":"font dark"} -->
                                    <h6 class="wp-block-heading has-font-dark-color has-text-color has-link-color"
                                        style="margin-top:0;font-size:16px">
                                        Email:</h6>
                                    <!-- /wp:heading -->

                                    <!-- wp:paragraph {"style":{"typography":{"fontSize":"16px"}}} -->
                                    <p style="font-size:16px"><a href="mailto:tribunal@hporoo.ca" data-type="internal"
                                            data-id="#test">tribunal@hporoo.ca</a>
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
                        <!-- wp:group {"className":"dswp-information-contact-socials-card-content","style":{"spacing":{"padding":{"right":"0","left":"0","top":"0"},"margin":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|60"},"layout":{"selfStretch":"fit","flexSize":null}},"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"top"}} -->
                        <div class="wp-block-group dswp-information-contact-socials-card-content"
                            style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-left:0">
                            <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
                            <div class="wp-block-group" style="padding-top:0;padding-bottom:0">
                                <!-- wp:group {"className":"dswp-information-contact-socials-card-img-group","layout":{"type":"constrained"}} -->
                                <div class="wp-block-group dswp-information-contact-socials-card-img-group">
                                    <!-- wp:image {"width":"16px","linkDestination":"none","className":"dswp-information-contact-socials-card-img"} -->
                                    <figure class="wp-block-image is-resized dswp-information-contact-socials-card-img">
                                        <img src="<?php echo esc_attr( $phone_icon ); ?>" alt="Phone" style="width:16px" /></figure>
                                    <!-- /wp:image -->
                                </div>
                                <!-- /wp:group -->

                                <!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                                <div class="wp-block-group">
                                    <!-- wp:heading {"level":6,"style":{"spacing":{"margin":{"top":"0"}},"typography":{"fontSize":"16px","lineHeight":"1.68"}},"textColor":"font dark"} -->
                                    <h6 class="wp-block-heading has-font-dark-color has-text-color"
                                        style="margin-top:0;font-size:16px;line-height:1.68">Phone:
                                    </h6>
                                    <!-- /wp:heading -->
                                    <!-- wp:paragraph {"style":{"typography":{"fontSize":"16px","lineHeight":"1.68"}}} -->
                                    <p style="font-size:16px;line-height:1.68"><a href="tel:236-478-0629"
                                            data-type="internal" data-id="#test">236-478-0629</a><br>(Victoria and
                                        Capital Regional District)
                                    </p>
                                    <!-- /wp:paragraph -->

                                </div>
                                <!-- /wp:group -->
                            </div>
                            <!-- /wp:group -->

                            <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
                            <div class="wp-block-group" style="padding-top:0;padding-bottom:0">
                                <!-- wp:group {"className":"dswp-information-contact-socials-card-img-group","layout":{"type":"constrained"}} -->
                                <div class="wp-block-group dswp-information-contact-socials-card-img-group">
                                    <!-- wp:image {"width":"16px","linkDestination":"none","className":"dswp-information-contact-socials-card-img"} -->
                                    <figure class="wp-block-image is-resized dswp-information-contact-socials-card-img">
                                        <img src="<?php echo esc_attr( $phone_icon ); ?>" alt="Phone" style="width:16px" /></figure>
                                    <!-- /wp:image -->
                                </div>
                                <!-- /wp:group -->

                                <!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                                <div class="wp-block-group">
                                    <!-- wp:heading {"level":6,"style":{"spacing":{"margin":{"top":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|font dark"}}},"typography":{"fontSize":"16px","lineHeight":"1.68"}},"textColor":"font dark"} -->
                                    <h6 class="wp-block-heading has-font-dark-color has-text-color has-link-color"
                                        style="margin-top:0;font-size:16px;line-height:1.68">Phone:</h6>
                                    <!-- /wp:heading -->
                                    <!-- wp:paragraph {"style":{"typography":{"fontSize":"16px","lineHeight":"1.68"}}} -->
                                    <p style="font-size:16px;line-height:1.68"><a href="tel:1-844-338-3059"
                                            data-type="internal" data-id="#tel2">1-844-338-3059</a><br>(toll free
                                        outside of Victoria)
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
                                    <!-- wp:image {"width":"16px","linkDestination":"none","className":"dswp-information-contact-socials-card-img"} -->
                                    <figure class="wp-block-image is-resized dswp-information-contact-socials-card-img">
                                        <img src="<?php echo esc_attr( $mail_icon ); ?>" alt="Address" style="width:16px" />
                                    </figure>
                                    <!-- /wp:image -->
                                </div>
                                <!-- /wp:group -->

                                <!-- wp:group {"style":{"spacing":{"blockGap":"0"},"typography":{"lineHeight":"1.68"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                                <div class="wp-block-group" style="line-height:1.68">
                                    <!-- wp:heading {"level":6,"style":{"spacing":{"margin":{"top":"0","bottom":"0rem"}},"elements":{"link":{"color":{"text":"var:preset|color|font dark"}}},"typography":{"fontSize":"16px"}},"textColor":"font dark"} -->
                                    <h6 class="wp-block-heading has-font-dark-color has-text-color has-link-color"
                                        style="margin-top:0;margin-bottom:0rem;font-size:16px">
                                        Mailing address:</h6>
                                    <!-- /wp:heading -->

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