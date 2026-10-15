<?php
/**
 * Integration tests for the CHEFS Form block render template.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

/**
 * CHEFS Form block render behavior.
 */
class ChefsFormRenderTest extends \WP_UnitTestCase {

	/**
	 * Helper to render the template and capture output.
	 *
	 * @param array $attributes Block attributes.
	 * @return string Rendered HTML.
	 */
	private function render_template( array $attributes ): string {
		// Get plugin directory and build path to template
		$plugin_dir    = dirname( dirname( __DIR__ ) );
		$template_path = $plugin_dir . '/src/chefs-form/render.php';

		if ( ! file_exists( $template_path ) ) {
			$this->fail( "Template file not found: {$template_path}" );
		}

		ob_start();
		include $template_path;
		return ob_get_clean();
	}

	/**
	 * No form selected: renders empty state message.
	 *
	 * @return void
	 */
	public function test_render_empty_form_id() {
		$output = $this->render_template( array() );

		$this->assertStringContainsString( 'No CHEFS form selected.', $output );
		$this->assertStringContainsString( 'bcew-chefs-form__empty', $output );
		$this->assertStringNotContainsString( '<div class="bcew-chefs-form__mount"', $output );
	}

	/**
	 * Empty string form ID: renders empty state message.
	 *
	 * @return void
	 */
	public function test_render_explicit_empty_form_id() {
		$output = $this->render_template( array( 'formId' => '' ) );

		$this->assertStringContainsString( 'No CHEFS form selected.', $output );
		$this->assertStringContainsString( 'bcew-chefs-form__empty', $output );
		$this->assertStringNotContainsString( '<div class="bcew-chefs-form__mount"', $output );
	}

	/**
	 * Form ID provided: renders mount point.
	 *
	 * @return void
	 */
	public function test_render_with_form_id() {
		$output = $this->render_template( array( 'formId' => '12345' ) );

		$this->assertStringContainsString( '<div class="bcew-chefs-form__mount"', $output );
		$this->assertStringNotContainsString( 'No CHEFS form selected.', $output );
		$this->assertStringNotContainsString( 'bcew-chefs-form__empty', $output );
	}

	/**
	 * Wrapper contains expected classes and attributes.
	 *
	 * @return void
	 */
	public function test_render_wrapper_attributes() {
		$form_id = '67890';
		$output   = $this->render_template( array( 'formId' => $form_id ) );

		$this->assertStringContainsString( 'class="wp-block-bcew-chefs-form bcew-chefs-form"', $output );
		$this->assertStringContainsString( 'data-form-id="' . $form_id . '"', $output );
	}

	/**
	 * Form ID is sanitized: HTML/script tags are escaped.
	 *
	 * @return void
	 */
	public function test_render_form_id_sanitized() {
		$malicious_id = '<script>alert("xss")</script>';
		$output       = $this->render_template( array( 'formId' => $malicious_id ) );

		// The actual content should be sanitized/escaped
		$this->assertStringNotContainsString( '<script>', $output );
		$this->assertStringNotContainsString( 'alert', $output );
	}

	/**
	 * Accessibility: mount point has aria-busy and aria-live attributes.
	 *
	 * @return void
	 */
	public function test_render_accessibility_attributes() {
		$output = $this->render_template( array( 'formId' => '12345' ) );

		$this->assertStringContainsString( 'aria-busy="true"', $output );
		$this->assertStringContainsString( 'aria-live="polite"', $output );
	}

	/**
	 * Multiple attributes: only uses formId, ignores others.
	 *
	 * @return void
	 */
	public function test_render_with_multiple_attributes() {
		$output = $this->render_template(
			array(
				'formId'       => '12345',
				'token'        => 'test-token',
				'confirmation' => 'Thank you!',
				'extra'        => 'ignored',
			)
		);

		$this->assertStringContainsString( 'data-form-id="12345"', $output );
		$this->assertStringContainsString( '<div class="bcew-chefs-form__mount"', $output );
	}

	/**
	 * Wrapper always contains main bcew-chefs-form class.
	 *
	 * @return void
	 */
	public function test_render_always_has_main_wrapper() {
		$empty_output  = $this->render_template( array() );
		$filled_output = $this->render_template( array( 'formId' => '12345' ) );

		$this->assertStringContainsString( 'bcew-chefs-form', $empty_output );
		$this->assertStringContainsString( 'bcew-chefs-form', $filled_output );
	}

	/**
	 * Form ID with whitespace: trimmed and sanitized.
	 *
	 * @return void
	 */
	public function test_render_form_id_with_whitespace() {
		$output = $this->render_template( array( 'formId' => '  12345  ' ) );

		// sanitize_text_field trims whitespace
		$this->assertStringContainsString( 'data-form-id="12345"', $output );
		$this->assertStringContainsString( '<div class="bcew-chefs-form__mount"', $output );
	}

	/**
	 * Form ID with numeric type: converted to string and used.
	 *
	 * @return void
	 */
	public function test_render_form_id_as_integer() {
		$output = $this->render_template( array( 'formId' => 12345 ) );

		// Cast to string should handle integer input
		$this->assertStringContainsString( 'data-form-id="12345"', $output );
		$this->assertStringContainsString( '<div class="bcew-chefs-form__mount"', $output );
	}

	/**
	 * Mount point HTML structure: verify complete markup.
	 *
	 * @return void
	 */
	public function test_render_mount_point_complete_markup() {
		$output = $this->render_template( array( 'formId' => 'test-form' ) );

		// Mount div with all attributes
		$this->assertStringContainsString( 'aria-busy="true"', $output );
		$this->assertStringContainsString( 'aria-live="polite"', $output );
		// Verify it's a complete div tag
		$this->assertStringContainsString( '<div class="bcew-chefs-form__mount" aria-busy="true" aria-live="polite"></div>', $output );
	}

	/**
	 * Empty state paragraph: verify complete markup.
	 *
	 * @return void
	 */
	public function test_render_empty_paragraph_complete_markup() {
		$output = $this->render_template( array( 'formId' => '' ) );

		$this->assertStringContainsString( '<p class="bcew-chefs-form__empty">', $output );
		$this->assertStringContainsString( 'No CHEFS form selected.', $output );
		$this->assertStringContainsString( '</p>', $output );
	}

	/**
	 * Wrapper div structure: verify opening and closing tags.
	 *
	 * @return void
	 */
	public function test_render_wrapper_div_structure() {
		$output = $this->render_template( array( 'formId' => 'test' ) );

		// Should have opening and closing div tags
		$this->assertStringContainsString( '<div', $output );
		$this->assertStringContainsString( '</div>', $output );
	}

	/**
	 * No form ID and no attributes: strictly no mount point rendered.
	 *
	 * @return void
	 */
	public function test_render_strictly_empty_state() {
		$output = $this->render_template( array() );

		// Strictly no mount point in empty state
		preg_match_all( '/<div[^>]*class="bcew-chefs-form__mount"/', $output, $matches );
		$this->assertEmpty( $matches[0], 'No mount point should exist in empty state' );
	}

	/**
	 * Non-empty form ID strictly shows mount point.
	 *
	 * @return void
	 */
	public function test_render_strictly_with_mount_point() {
		$output = $this->render_template( array( 'formId' => 'form-123' ) );

		// Strictly no empty message in non-empty state
		$this->assertStringNotContainsString( 'bcew-chefs-form__empty', $output );
		$this->assertStringNotContainsString( 'No CHEFS form selected', $output );
	}

	/**
	 * Sanitization prevents XSS in form ID.
	 *
	 * @return void
	 */
	public function test_render_xss_prevention() {
		$xss_payload = '"><script>alert("xss")</script><p class="';
		$output      = $this->render_template( array( 'formId' => $xss_payload ) );

		// Script should not execute; should be escaped
		$this->assertStringNotContainsString( '<script>', $output );
		$this->assertStringNotContainsString( 'alert(', $output );
	}

	/**
	 * Boolean false form ID: treated as empty.
	 *
	 * @return void
	 */
	public function test_render_boolean_false_form_id() {
		$output = $this->render_template( array( 'formId' => false ) );

		// false cast to string becomes empty string
		$this->assertStringContainsString( 'No CHEFS form selected.', $output );
	}

	/**
	 * Null form ID: treated as empty.
	 *
	 * @return void
	 */
	public function test_render_null_form_id() {
		$output = $this->render_template( array( 'formId' => null ) );

		// null cast to string becomes empty string
		$this->assertStringContainsString( 'No CHEFS form selected.', $output );
	}

	/**
	 * Zero form ID: non-empty, shows mount point.
	 *
	 * @return void
	 */
	public function test_render_zero_form_id() {
		$output = $this->render_template( array( 'formId' => '0' ) );

		// '0' is a valid form ID (non-empty)
		$this->assertStringContainsString( 'data-form-id="0"', $output );
		$this->assertStringContainsString( '<div class="bcew-chefs-form__mount"', $output );
		$this->assertStringNotContainsString( 'No CHEFS form selected', $output );
	}
