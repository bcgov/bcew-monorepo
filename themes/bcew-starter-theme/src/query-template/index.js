import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';

registerBlockType( metadata.name, {
  edit: () => {
    return <div>Query Template see: query-template template parts</div>;
  },
});