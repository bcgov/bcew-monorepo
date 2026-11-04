import{_t as e,it as t,n,ot as r,rt as i,xt as a}from"./chunks/framework.DmGhRbf7.js";var o=JSON.parse(`{"title":"Block architecture","description":"","frontmatter":{},"headers":[],"relativePath":"content/plugins/bcew-chefs-embed/developer/block-architecture.md","filePath":"content/plugins/bcew-chefs-embed/developer/block-architecture.md"}`),s={name:`content/plugins/bcew-chefs-embed/developer/block-architecture.md`};function c(n,o,s,c,l,u){let d=a(`MermaidDiagram`);return e(),i(`div`,null,[o[0]||=t("",7),r(d,{code:`sequenceDiagram
    actor Editor as User with edit_posts
    actor Visitor as Public visitor
    participant WP as WordPress block
    participant Viewer as CHEFS viewer script
    participant CHEFS as CHEFS

    Editor->>WP: Enter Form ID or share URL
    WP-->>Editor: Show read-only viewer preview
    Editor->>WP: Save normalized Form ID and confirmation

    Visitor->>WP: Request public page over HTTPS
    WP-->>Visitor: Saved viewer element with Form ID
    Visitor->>Viewer: Load versioned viewer script with pinned integrity hash
    Note over Visitor,Viewer: Browser blocks the script if the hash does not match
    Viewer->>CHEFS: Load published Public form
    CHEFS-->>Viewer: Form
    Viewer-->>Visitor: Display form and submission result
`}),o[1]||=t("",15)])}var l=n(s,[[`render`,c]]);export{o as __pageData,l as default};