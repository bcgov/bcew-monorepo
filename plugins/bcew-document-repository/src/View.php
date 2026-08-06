<?php
namespace Bcgov\BcewDocumentRepository;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

use Bcgov\DocumentRepository\View;
?>
<div class="wrap">
    <h1><?php esc_html_e( 'Document Repository Settings', 'bcew-document-repository' ); ?></h1>
    <form method="post" action="options.php">
        <?php
        settings_fields( 'wordpress-document-repository_options_group' );
        $value = get_option( Settings::OPTION_NAME, '0' );
        ?>
        <table class="form-table">
            <tr>
                <th scope="row"><?php esc_html_e( 'Document Repository', 'bcew-document-repository' ); ?></th>
                <td>
                    <div style="display: flex; align-items: center;">
                        <label class="bcew-document-repository-toggle-switch">
                            <input type="checkbox" 
                                   name="<?php echo esc_attr( Settings::OPTION_NAME ); ?>" 
                                   value="1" 
                                   <?php checked( '1', $value ); ?>>
                            <span class="bcew-document-repository-toggle-slider"></span>
                        </label>
                        <span class="bcew-document-repository-toggle-label">
                            <?php esc_html_e( 'Enable Document Repository functionality', 'bcew-document-repository' ); ?>
                        </span>
                    </div>
                    <p class="description">
                        <?php esc_html_e( 'When enabled, this will activate the Document Repository feature, allowing you to manage and organize documents.', 'bcew-document-repository' ); ?>
                    </p>
                </td>
            </tr>
        </table>
        <?php submit_button(); ?>
    </form>
</div> 