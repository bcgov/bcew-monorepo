import{_t as e,it as t,n,ot as r,rt as i,xt as a}from"./chunks/framework.DmGhRbf7.js";var o=JSON.parse(`{"title":"Block architecture","description":"","frontmatter":{},"headers":[],"relativePath":"content/plugins/bcew-chefs-embed/developer/block-architecture.md","filePath":"content/plugins/bcew-chefs-embed/developer/block-architecture.md"}`),s={name:`content/plugins/bcew-chefs-embed/developer/block-architecture.md`};function c(n,o,s,c,l,u){let d=a(`MermaidDiagram`);return e(),i(`div`,null,[o[0]||=t("",8),r(d,{code:`sequenceDiagram
    actor Editor as User with edit_posts
    actor Visitor as Public visitor
    participant WP as WordPress plugin
    participant DB as Plugin database
    participant CHEFS as CHEFS API
    participant Viewer as CHEFS viewer script

    Editor->>WP: GET saved forms over HTTPS
    WP->>DB: Read Form IDs and names
    DB-->>WP: Form metadata only
    WP-->>Editor: Form IDs and names
    Editor->>WP: Save selected Form ID in block

    Visitor->>WP: Request public page over HTTPS
    WP->>DB: render.php reads encrypted credentials
    WP->>WP: Decrypt API key server-side
    WP->>CHEFS: Exchange Form ID and API key over HTTPS
    CHEFS-->>WP: Short-lived token
    WP-->>Visitor: Render viewer configuration with token
    Visitor->>Viewer: Load form with Form ID and token over HTTPS
    Viewer->>CHEFS: Request form over HTTPS
    CHEFS-->>Viewer: Form
`}),o[1]||=t("",9)])}var l=n(s,[[`render`,c]]);export{o as __pageData,l as default};