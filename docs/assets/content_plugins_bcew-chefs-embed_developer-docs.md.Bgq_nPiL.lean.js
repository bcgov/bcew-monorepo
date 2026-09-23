import{_ as i,I as a,o as n,c as r,a8 as s,J as o}from"./chunks/framework.D4ejoiGF.js";const g=JSON.parse('{"title":"Developer docs","description":"","frontmatter":{},"headers":[],"relativePath":"content/plugins/bcew-chefs-embed/developer-docs.md","filePath":"content/plugins/bcew-chefs-embed/developer-docs.md"}'),d={name:"content/plugins/bcew-chefs-embed/developer-docs.md"};function l(h,e,c,p,k,m){const t=a("MermaidDiagram");return n(),r("div",null,[e[0]||(e[0]=s("",27)),o(t,{code:`sequenceDiagram
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
`}),e[1]||(e[1]=s("",38))])}const b=i(d,[["render",l]]);export{g as __pageData,b as default};
