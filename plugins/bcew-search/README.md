# BC Extended Web Search

A powerful and customizable search plugin that enhances WordPress search with advanced features and an improved user experience.

## Description

BC Extended Web Search provides customizable search blocks, improved search results, and better performance than the default WordPress search.


## Requirements

- WordPress 6.4.4 or higher
- PHP 7.4 or higher

## Installation

1. Download the plugin files
2. Upload the `bcew-search` folder to the `/wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Use the search blocks in your pages or posts

## Usage

## Development

### Building from Source

1. Clone the repository:

   ```bash
   git clone https://github.com/bcgov/bcew-monorepo.git
   cd bcew-monorepo
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the plugin:

   ```bash
   pnpm --filter bcew-search build
   ```

### Running Tests

The plugin includes PHPUnit tests to ensure functionality:

```bash
composer test
```

## License

This project is licensed under the Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:

- Open an issue in the GitHub repository
- Contact the development team at <govwordpress@gov.bc.ca>

## Credits

Developed by the BC Government WordPress Team
