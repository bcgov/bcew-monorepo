# REST API

The CHEFS Form block does not register WordPress REST routes. Its Form ID and
confirmation message are saved in the post content, and the CHEFS viewer loads
the form directly from CHEFS without an API key or token.

The credentials table and its server-side authentication code remain only for
the separate credential-removal work in DSWP-1367 and DSWP-1370. They are not
used by the block's editor preview or published-page rendering.
