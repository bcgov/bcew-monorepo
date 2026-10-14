# Notification Banner

Use this tool to enable a Notification Banner at the top of each page of your website. You can choose the text shown in the banner, as well as its background color. HTML markup is also valid if you want to control the format of the text.

The tool lives in:

- WordPress Admin → Design System → Notification Banner

Click Save Settings to apply changes, and see a preview below the Banner Preview label.

![Notification Banner HOWTO](../images/NOTIFICATION_BANNER_HOWTO.gif)

<!-- markdownlint-disable MD033 -->
## How the banner tool works

- Enable/Disable the banner using the radio buttons.
- The Banner Content textbox can accept plain text or HTML Markup, such as:
    - <strong>strong (bold)</strong>
    - <em>emphasis (italics)</em>
    - <u>underline (use with caution; can confuse links)</u>
    - <s>Strikethrough</s>
    - <mark>Highlighted text</mark>
    - <pre>preformatted text (preserves spaces and line breaks)</pre>
- Other specialized text markup: `<abbr>`, `<code>`, `<kbd>`, `<var>`, `<sup>`, and `<sub>`.
- List item markup: `<ul>`, `<ol>`, `<li>`, `<dl>`, `<dt>`, and `<dd>`.
- Quotations and citations: `<blockquote>`, `<q>`, and `<cite>`.
- Headings: `<H1>` through `<H6>`.
- Choose the background banner color using the color-coded background status colors:
     <span style="background-color:#f8bb47; color:black; padding: 3px">Warning</span>,
     <span style="background-color:#ce3e39; color:white; padding: 3px">Danger</span>,
     <span style="background-color:#42814a; color:white; padding: 3px">Success</span>, or
     <span style="background-color:#053662; color:white; padding: 3px">Info</span>.
- To hide the banner, simply click 'Disable' beside 'Enable Banner'.

## Notification Banner recipes

- Test Site Banner
    - Text: `This is the Dev/Test Environment. The content you are viewing is not final and subject to change.`
    - Background color: <span style="background-color:#ce3e39; color:white; padding: 3px">Danger</span>
- Site under maintenance
    - Text: `This site is under maintenance. Please check back periodically for updates`
    - Background color: <span style="background-color:#f8bb47; color: black; padding: 3px">Warning</span>
- Informational Banner
    - Text: `Here are instructions for filling in this form...`
    - Background color: <span style="background-color:#053662; color: white; padding: 3px">Info</span>

<!-- markdownlint-enable MD033 -->
## Notification Banner testing

1. Save Settings.
2. Verify the banner preview matches expectations.
3. Navigate to your homepage and hard-refresh your browser.
4. Verify the text and background color of the banner are correct.

![Show Notification Banner](../images/SHOW_NOTIFICATION_BANNER.gif)
