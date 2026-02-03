# Redmine Session Validity Checker

A cross-browser extension that monitors Redmine sessions and warns users when their session expires to prevent data loss.

## Features

- **Automatic Redmine Detection**: Automatically detects if a website is a Redmine instance
- **Session Monitoring**: Checks session validity every 5 minutes
- **Warning Banner**: Displays a prominent warning banner when session expires
- **Configurable Modes**: 
  - **Whitelist Mode**: Only monitor specified domains
  - **Blacklist Mode**: Monitor all domains except specified ones
- **Multi-language Support**: Available in English, Polish, French, German, and Spanish
- **Cross-browser Compatible**: Works with Chrome, Edge, Firefox, and other Chromium-based browsers

## Installation

### Chrome/Edge/Chromium

1. Download or clone this repository
2. Open your browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the extension directory

### Firefox

1. Download or clone this repository
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the extension directory

## Configuration

1. Click the extension icon and select "Options" (or right-click the icon and choose "Options")
2. Choose your preferred mode:
   - **Blacklist Mode**: Extension works on all sites except those in your list
   - **Whitelist Mode**: Extension only works on sites in your list
3. Add domains to your list (supports wildcards like `*.example.com`)
4. Click "Save Settings"

## How It Works

1. **Page Load**: When you navigate to a page, the extension waits for it to fully load
2. **Redmine Detection**: Checks if the page is a Redmine instance by looking for the "Powered by Redmine" footer
3. **Login Check**: Verifies if you're logged in by looking for the "My account" link
4. **Session Monitoring**: Every 5 minutes, attempts to access your account page to verify session validity
5. **Warning**: If session expires, displays a red warning banner at the top of the page

## Technical Details

### Redmine Detection
The extension searches for: `html/body/div#wrapper/div#footer` containing "Powered by Redmine"

### Login Detection
Looks for: `<a class="my-account" href="/my/account">...</a>`

### Session Validation
Fetches `/my/account` and checks if the response redirects to `/login`

### Warning Banner
- Red banner at top of page
- Fixed position (z-index: 100000)
- Click to dismiss
- Translated based on browser language

## Languages

- English (en) - Default
- Polish (pl)
- French (fr)
- German (de)
- Spanish (es)

## Files Structure

```
redmine-session-validity-checker/
├── manifest.json           # Extension manifest
├── background.js          # Background service worker
├── content.js            # Content script (main logic)
├── options.html          # Settings page
├── options.js            # Settings page logic
├── _locales/             # Translations
│   ├── en/
│   │   └── messages.json
│   ├── pl/
│   │   └── messages.json
│   ├── fr/
│   │   └── messages.json
│   ├── de/
│   │   └── messages.json
│   └── es/
│       └── messages.json
└── README.md
```

## Permissions

- `storage`: To save user settings (mode and domain list)
- `tabs`: To monitor tab navigation
- `<all_urls>`: To check pages for Redmine instances (filtered by user settings)

## Development

The extension is built using Manifest V3 for maximum compatibility with modern browsers.

### Key Components

- **content.js**: Main logic for Redmine detection, session monitoring, and banner display
- **background.js**: Service worker for extension lifecycle management
- **options.js/html**: User interface for configuration
- **_locales**: i18n translations using Chrome's internationalization API

### Releasing

To create a new release with packaged extensions:

1. Update the version in `manifest.json`
2. Commit your changes
3. Create and push a tag with the format `release_X.Y.Z`:
   ```bash
   git tag release_1.0.0
   git push origin release_1.0.0
   ```
4. The GitHub Actions workflow will automatically:
   - Build a Firefox package (.xpi)
   - Build a Chrome package (.zip)
   - Create a GitHub release with both packages as artifacts

The packaged extensions will be available in the GitHub Releases page.

## Privacy

This extension:
- Only processes data locally in your browser
- Does not send any data to external servers
- Only accesses pages you explicitly configure (in whitelist/blacklist)
- Respects your browser's language settings

## License

This extension is provided as-is for monitoring Redmine sessions.

## Support

For issues or questions, please refer to the repository's issue tracker.