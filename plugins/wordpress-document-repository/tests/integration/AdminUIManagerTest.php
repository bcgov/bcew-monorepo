<?php
namespace Bcgov\WordpressDocumentRepository\Tests;

use Bcgov\WordpressDocumentRepository\AdminUIManager;
use Bcgov\WordpressDocumentRepository\DocumentMetadataManager;
use Bcgov\WordpressDocumentRepository\DocumentUploader;
use Bcgov\WordpressDocumentRepository\RepositoryConfig;

class AdminUIManagerTest extends \WP_UnitTestCase {

    public function test_add_repository_menu() {
        $repository_config = new RepositoryConfig();

        $admin_ui_manager = new AdminUIManager(
            $repository_config,
            $this->createMock(DocumentUploader::class),
            $this->createMock(DocumentMetadataManager::class)
        );

        $admin_ui_manager->add_repository_menu();

        global $menu;

        $slugs = wp_list_pluck( $menu, 2 );

        $this->assertContains(
            'document-repository',
            $slugs
        );
    }
}
