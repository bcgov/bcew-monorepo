import{_ as i,I as r,o,c as a,a8 as t,J as n}from"./chunks/framework.ALLMRHJF.js";const u=JSON.parse('{"title":"Block architecture","description":"","frontmatter":{},"headers":[],"relativePath":"content/plugins/bcew-chefs-embed/developer/block-architecture.md","filePath":"content/plugins/bcew-chefs-embed/developer/block-architecture.md"}'),d={name:"content/plugins/bcew-chefs-embed/developer/block-architecture.md"};function c(l,e,h,p,m,f){const s=r("MermaidDiagram");return o(),a("div",null,[e[0]||(e[0]=t("",7)),n(s,{code:`sequenceDiagram
    actor Admin as WordPress admin
    actor Editor as User with edit_posts
    actor Visitor as Public visitor
    participant WP as WordPress plugin
    participant DB as Plugin database
    participant CHEFS as CHEFS API
    participant Viewer as CHEFS viewer script

    Admin->>WP: Save Form ID and API key (admin-post + nonce)
    WP->>CHEFS: Validate credentials over HTTPS
    WP->>DB: Store Form ID and encrypted API key

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
`}),e[1]||(e[1]=t("",9))])}const b=i(d,[["render",c]]);export{u as __pageData,b as default};
