const PLUGIN_TREE = [
	{ type: "dir", name: "bcew-chefs-form/" },
	{ type: "file", name: "bcew-chefs-form.php", path: "plugins/bcew-chefs-form/bcew-chefs-form.php" },
	{ type: "dir", name: "includes/" },
	{ type: "file", name: "class-chefs-settings.php", path: "plugins/bcew-chefs-form/includes/class-chefs-settings.php" },
	{ type: "file", name: "class-chefs-crypto.php", path: "plugins/bcew-chefs-form/includes/class-chefs-crypto.php" },
	{ type: "file", name: "class-chefs-credentials.php", path: "plugins/bcew-chefs-form/includes/class-chefs-credentials.php" },
	{ type: "dir", name: "src/chefs-form/" },
	{ type: "file", name: "render.php", path: "plugins/bcew-chefs-form/src/chefs-form/render.php" },
	{ type: "file", name: "view.js", path: "plugins/bcew-chefs-form/src/chefs-form/view.js" },
	{ type: "file", name: "block.json", path: "plugins/bcew-chefs-form/src/chefs-form/block.json" },
];

const EMBED_REF_ASIDE = {
	title: "What’s an embed ref?",
	body: "A short random ID that labels your saved form in the database. It’s safe to put on public pages — it doesn’t reveal your API key. WordPress uses it to look up the locked secrets when someone visits the page.",
};

const EMBED_REF_ORIGIN_ASIDE = {
	title: "What’s an embed ref?",
	body: "A short random ID that labels your saved form in the database. It’s safe to put on public pages — it doesn’t reveal your API key. WordPress created it when you saved: 16 random bytes turned into a 32-character hex string.",
};

const PHP_JS_ASIDE = {
	title: "PHP vs JS here",
	body: "PHP runs on the WordPress server before the page is sent. It builds the HTML. JavaScript only runs after the browser receives that HTML — and the API key was never put in it.",
};

const SAVE_STEPS = [
	{
		title: "Secrets leave the form",
		say: "You type them in the admin page. On Save, the browser POSTs them to PHP — this is the only time they cross the wire as plain text.",
		file: "plugins/bcew-chefs-form/includes/class-chefs-settings.php",
		zone: {
			browser: true,
			server: true,
			browserTag: "Admin browser",
			serverTag: "PHP receives POST",
			browserNote: "Form ID + API key in the form fields",
			serverNote: "Reads $_POST — secrets stay on the server after this",
		},
		hazard: {
			title: "Could this be intercepted?",
			body: "Yes — if wp-admin is not on HTTPS. The POST body is plain text to PHP. TLS encrypts it in transit. Without HTTPS, someone on the network could read it. Localhost is fine. Production wp-admin must use HTTPS.",
		},
		code: () => `$form_id = sanitize_text_field( $_POST['form_id'] );
$api_key = sanitize_text_field( $_POST['api_key'] );
$label   = sanitize_text_field( $_POST['label'] );`,
		scene: () => boxes([
			["secret", "Form ID + API key"],
			"→",
			["page", "WordPress"],
		]),
	},
	{
		title: "Ask CHEFS: are these real?",
		say: "If CHEFS says no, we stop. If yes, continue.",
		file: "plugins/bcew-chefs-form/bcew-chefs-form.php",
		zone: {
			server: true,
			serverTag: "PHP only",
			serverNote: "Server-to-server call — the browser never sees this",
		},
		code: () => `$token = bcew_chefs_form_get_gateway_token( $form_id, $api_key );

if ( empty( $token['token'] ) ) {
    // stop — credentials rejected
}`,
		scene: () => boxes([
			["secret", "credentials"],
			"→",
			["ok", "CHEFS ✓"],
		]),
	},
	{
		title: "Lock the secrets",
		say: "Readable values become scrambled. Only WordPress can unlock them later.",
		file: "plugins/bcew-chefs-form/includes/class-chefs-crypto.php",
		zone: {
			server: true,
			serverTag: "PHP only",
			serverNote: "encrypt() runs in PHP — ciphertext never sent to the browser",
		},
		code: () => `$form_id_encrypted = BCEW_Chefs_Crypto::encrypt( $form_id );
$api_key_encrypted = BCEW_Chefs_Crypto::encrypt( $api_key );`,
		morph: true,
		scene: () => `
			<span class="box secret morph-from" data-to="locked secrets">Form ID + API key</span>
			<span class="arrow">→</span>
			<span class="box lock">encrypt()</span>
		`,
	},
	{
		title: "Roll a random embed ref",
		say: "16 random bytes → hex string. Not derived from your API key.",
		file: "plugins/bcew-chefs-form/includes/class-chefs-credentials.php",
		aside: EMBED_REF_ASIDE,
		zone: {
			server: true,
			serverTag: "PHP only",
			serverNote: "random_bytes() + bin2hex() — happens on the server",
		},
		code: (c) => `$embed_ref = bin2hex( random_bytes( 16 ) );
// 16 bytes → 32 hex chars
// → ${esc(c.embed)}`,
		scene: (c) => boxes([
			["random", "random_bytes(16)"],
			"→",
			["lock", "bin2hex()"],
			"→",
			["embed-ref", `embed ref<small>${esc(c.embedShort)}</small>`],
		]),
	},
	{
		title: "Save in the database",
		say: "Locked secrets and the embed ref go in one DB row.",
		file: "plugins/bcew-chefs-form/includes/class-chefs-credentials.php",
		aside: EMBED_REF_ASIDE,
		zone: {
			server: true,
			serverTag: "PHP + database",
			serverNote: "Secrets stored encrypted — admin page redirects, fields stay empty",
		},
		code: (c) => `$wpdb->insert( $table, [
    'embed_ref'         => '${esc(c.embed)}',
    'form_id_encrypted' => $form_id_encrypted,
    'api_key_encrypted' => $api_key_encrypted,
] );`,
		scene: (c) => boxes([
			["lock", "locked secrets"],
			["embed-ref", `embed ref<small>${esc(c.embedShort)}</small>`],
			"→",
			["page", "database row"],
		]),
	},
	{
		title: "The page only keeps the embed ref",
		say: "The block editor stores the embed ref — not the API key. Secrets never come back to the browser.",
		file: "plugins/bcew-chefs-form/src/chefs-form/block.json",
		aside: EMBED_REF_ASIDE,
		zone: {
			browser: true,
			server: true,
			browserTag: "Block editor",
			serverTag: "Saved in WP",
			browserNote: "Only embed ref in block attributes",
			serverNote: "API key stays in the encrypted DB row",
		},
		code: (c) => `"attributes": {
    "embedRef": {
        "type": "string",
        "default": "${esc(c.embed)}"
    }
}`,
		scene: (c) => boxes([
			["page", `block<small>embed ref ${esc(c.embedShort)}</small>`],
			"=",
			["embed-ref", `database row<small>same embed ref</small>`],
		]),
	},
];

const EMBED_STEPS = [
	{
		title: "Page has an embed ref",
		say: "PHP runs render.php on the server first. The browser only receives finished HTML — with the embed ref, not the API key.",
		file: "plugins/bcew-chefs-form/src/chefs-form/render.php",
		aside: EMBED_REF_ORIGIN_ASIDE,
		zone: {
			browser: true,
			server: true,
			serverFirst: true,
			browserTag: "Public browser",
			serverTag: "render.php runs first",
			browserNote: "Gets HTML: data-bcew-chefs-embed only",
			serverNote: "PHP builds the page before the DOM exists",
		},
		code: (c) => `$embed_ref = $attributes['embedRef'];

<div data-bcew-chefs-embed="<?php echo esc_attr( $embed_ref ); ?>">
// → ${esc(c.embedShort)}
</div>`,
		scene: (c) => boxes([
			["page", "public page"],
			"→",
			["embed-ref", `embed ref<small>${esc(c.embedShort)}</small>`],
		]),
	},
	{
		title: "Embed ref finds the DB row",
		say: "Match the embed ref → get the locked secrets for that form.",
		file: "plugins/bcew-chefs-form/includes/class-chefs-credentials.php",
		aside: EMBED_REF_ASIDE,
		zone: {
			server: true,
			serverTag: "PHP REST API",
			serverNote: "DB lookup on the server — browser only sent the embed ref",
		},
		code: (c) => `$row = $wpdb->get_row(
    $wpdb->prepare(
        'SELECT ... FROM wp_bcew_chefs_credentials
         WHERE embed_ref = %s',
        '${esc(c.embed)}'
    )
);`,
		scene: () => boxes([
			["embed-ref", "embed ref"],
			"→",
			["lock", "locked secrets"],
		]),
	},
	{
		title: "Unlock on the server",
		say: "WordPress decrypts in PHP. The browser still can’t see the API key.",
		file: "plugins/bcew-chefs-form/includes/class-chefs-crypto.php",
		zone: {
			server: true,
			serverTag: "PHP only",
			serverNote: "decrypt() in memory — plaintext never leaves the server",
		},
		code: () => `$form_id = BCEW_Chefs_Crypto::decrypt( $row['form_id_encrypted'] );
$api_key = BCEW_Chefs_Crypto::decrypt( $row['api_key_encrypted'] );`,
		morph: true,
		scene: () => `
			<span class="box lock morph-from" data-to="Form ID + API key" data-cls="secret">locked secrets</span>
			<span class="arrow">→</span>
			<span class="box page">decrypt() in PHP</span>
		`,
	},
	{
		title: "CHEFS gives a temporary pass",
		say: "Trade the API key for a short-lived token the page is allowed to use.",
		file: "plugins/bcew-chefs-form/bcew-chefs-form.php",
		zone: {
			server: true,
			serverTag: "PHP → CHEFS",
			serverNote: "API key used server-side — not included in the JSON response",
		},
		code: () => `$token = bcew_chefs_form_get_gateway_token(
    $record['form_id'],
    $record['api_key']
);
// → temporary auth token`,
		scene: () => boxes([
			["secret", "API key"],
			"→",
			["ok", "temporary pass"],
		]),
	},
	{
		title: "Form shows on the page",
		say: "view.js runs in the browser now. It gets a token + Form ID — the API key never left PHP.",
		file: "plugins/bcew-chefs-form/src/chefs-form/view.js",
		aside: PHP_JS_ASIDE,
		zone: {
			browser: true,
			server: true,
			browserTag: "view.js (JS)",
			serverTag: "embed-config JSON",
			browserNote: "fetch() → token + formId. No api_key in response.",
			serverNote: "PHP already discarded the API key from the reply",
		},
		code: (c) => `// view.js — runs in the browser
fetch( '/wp-json/bcew-chefs/v1/embed-config
    ?embed_ref=${esc(c.embed)}' )
  .then( ( res ) => res.json() )
  // { formId, authToken } — no api_key
  .then( ( config ) => loadViewer( container, config ) );`,
		scene: () => boxes([
			["ok", "temporary pass"],
			"→",
			["page", "CHEFS form"],
		]),
	},
];

const els = {
	origin: document.getElementById("wp-origin"),
	connect: document.getElementById("btn-connect"),
	status: document.getElementById("status"),
	fileTree: document.getElementById("file-tree"),
	stage: document.getElementById("stage"),
	stepLabel: document.getElementById("step-label"),
	stepTitle: document.getElementById("step-title"),
	stepSay: document.getElementById("step-say"),
	stepCode: document.getElementById("step-code"),
	stepCodeInner: document.querySelector("#step-code code"),
	stepZone: document.getElementById("step-zone"),
	zoneBrowserTag: document.getElementById("zone-browser-tag"),
	zoneBrowserNote: document.getElementById("zone-browser-note"),
	zoneServerTag: document.getElementById("zone-server-tag"),
	zoneServerNote: document.getElementById("zone-server-note"),
	stepHazard: document.getElementById("step-hazard"),
	hazardTitle: document.getElementById("hazard-title"),
	hazardBody: document.getElementById("hazard-body"),
	stepAside: document.getElementById("step-aside"),
	scene: document.getElementById("scene"),
	stepFile: document.getElementById("step-file"),
	prev: document.getElementById("btn-prev"),
	next: document.getElementById("btn-next"),
	adminLink: document.getElementById("wp-admin-link"),
	liveBadge: document.getElementById("live-badge"),
	wpForm: document.getElementById("wp-form"),
	demoLabel: document.getElementById("demo-label"),
	demoFormId: document.getElementById("demo-form-id"),
	demoApiKey: document.getElementById("demo-api-key"),
	demoSave: document.getElementById("btn-demo-save"),
	demoEmbed: document.getElementById("btn-demo-embed"),
};

const state = {
	watching: false,
	pollTimer: null,
	eventId: null,
	event: null,
	steps: [],
	stepIndex: 0,
	touchedFiles: new Set(),
	formValues: {
		label: "",
		formId: "",
		apiKey: "",
		embed: "",
		encForm: "",
		encKey: "",
	},
};

const POLL_MS = 800;

function origin() {
	return els.origin.value.replace(/\/$/, "");
}

function setStatus(text, kind = "") {
	els.status.textContent = text;
	els.status.className = `status ${kind}`.trim();
}

function setBadge(text) {
	const on = Boolean(text);
	els.liveBadge.hidden = !on;
	els.liveBadge.textContent = text || "";
	els.liveBadge.classList.toggle("hot", on);
}

function esc(str) {
	return String(str)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function truncate(str, n = 12) {
	str = String(str || "");
	return str.length > n ? `${str.slice(0, n)}…` : str;
}

function shortFile(path) {
	return String(path || "").split("/").pop() || path;
}

function fakeSeal(value) {
	let h = 0;
	const s = String(value || "x");
	for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
	return `s1:${h.toString(16)}${s.slice(0, 4)}…`;
}

function newEmbed() {
	return Array.from(crypto.getRandomValues(new Uint8Array(16)))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function readDemoForm() {
	return {
		label: els.demoLabel.value.trim() || "Contact form",
		formId: els.demoFormId.value.trim() || "00000000-0000-4000-8000-000000000000",
		apiKey: els.demoApiKey.value.trim() || "demo-api-key",
	};
}

function ctx() {
	const fv = state.formValues;
	return {
		label: fv.label,
		formId: fv.formId,
		embed: fv.embed,
		embedShort: truncate(fv.embed, 10),
	};
}

function boxes(parts) {
	return parts
		.map((p) => {
			if (typeof p === "string") return `<span class="arrow">${esc(p)}</span>`;
			const [cls, html] = p;
			return `<span class="box ${cls}">${html}</span>`;
		})
		.join("");
}

function renderFileTree(activePath) {
	if (activePath) state.touchedFiles.add(activePath);
	els.fileTree.innerHTML = PLUGIN_TREE.map((item) => {
		if (item.type === "dir") return `<li class="dir">${esc(item.name)}</li>`;
		const active = item.path === activePath ? "active" : "";
		const touched = state.touchedFiles.has(item.path) && item.path !== activePath ? "touched" : "";
		return `<li class="file ${active} ${touched}">${esc(item.name)}</li>`;
	}).join("");
}

function runMorph() {
	const nodes = els.scene.querySelectorAll(".morph-from");
	if (!nodes.length) return;
	window.setTimeout(() => {
		nodes.forEach((el) => {
			el.classList.add("morphing");
			window.setTimeout(() => {
				const next = el.getAttribute("data-to") || "";
				const cls = el.getAttribute("data-cls") || "lock";
				el.textContent = next;
				el.classList.remove("secret", "lock", "morphing", "morph-from");
				el.classList.add(cls);
			}, 700);
		});
	}, 300);
}

function renderZone(zone) {
	if (!els.stepZone) return;

	if (!zone) {
		els.stepZone.hidden = true;
		return;
	}

	const browserOn = Boolean(zone.browser);
	const serverOn = Boolean(zone.server);

	els.stepZone.hidden = false;
	els.stepZone.classList.toggle("server-first", Boolean(zone.serverFirst));
	els.stepZone.querySelector(".zone-browser")?.classList.toggle("active", browserOn);
	els.stepZone.querySelector(".zone-server")?.classList.toggle("active", serverOn);
	els.stepZone.querySelector(".zone-browser")?.classList.toggle("dim", !browserOn);
	els.stepZone.querySelector(".zone-server")?.classList.toggle("dim", !serverOn);

	if (els.zoneBrowserTag) els.zoneBrowserTag.textContent = browserOn ? zone.browserTag || "Browser" : "—";
	if (els.zoneBrowserNote) els.zoneBrowserNote.textContent = browserOn ? zone.browserNote || "" : "Not involved this step";
	if (els.zoneServerTag) els.zoneServerTag.textContent = serverOn ? zone.serverTag || "PHP server" : "—";
	if (els.zoneServerNote) els.zoneServerNote.textContent = serverOn ? zone.serverNote || "" : "Not involved this step";
}

function goToStep(index) {
	if (!state.steps.length) return;
	state.stepIndex = Math.max(0, Math.min(index, state.steps.length - 1));
	const step = state.steps[state.stepIndex];
	const c = ctx();

	els.stepLabel.textContent = `${state.event?.type === "embed" ? "Embed" : "Save"} · ${state.stepIndex + 1} / ${state.steps.length}`;
	els.stepTitle.textContent = step.title;
	els.stepSay.textContent = step.say;

	if (step.code && els.stepCode && els.stepCodeInner) {
		els.stepCodeInner.textContent = step.code(c);
		els.stepCode.hidden = false;
	} else if (els.stepCode) {
		els.stepCode.hidden = true;
	}

	if (step.aside && els.stepAside) {
		els.stepAside.innerHTML = `
			<p class="aside-kicker">${esc(step.aside.title)}</p>
			<p class="aside-body">${esc(step.aside.body)}</p>
		`;
		els.stepAside.hidden = false;
	} else if (els.stepAside) {
		els.stepAside.hidden = true;
	}

	if (step.hazard && els.stepHazard) {
		if (els.hazardTitle) els.hazardTitle.textContent = step.hazard.title;
		if (els.hazardBody) els.hazardBody.textContent = step.hazard.body;
		els.stepHazard.hidden = false;
	} else if (els.stepHazard) {
		els.stepHazard.hidden = true;
	}

	renderZone(step.zone);

	els.scene.innerHTML = step.scene(c);
	els.stepFile.textContent = shortFile(step.file);

	renderFileTree(step.file);
	if (step.morph) runMorph();

	els.prev.disabled = state.stepIndex === 0;
	const last = state.stepIndex >= state.steps.length - 1;
	els.next.textContent = last
		? state.event?.type === "save"
			? "Play embed"
			: "Done"
		: "Next";
}

function openStage(type, steps) {
	state.event = { type, id: `${type}_${Date.now()}` };
	state.eventId = state.event.id;
	state.steps = steps;
	state.stepIndex = 0;
	state.touchedFiles = new Set();
	els.stage.hidden = false;
	els.stage.removeAttribute("hidden");
	setBadge(type.toUpperCase());
	setStatus(type, "ok");
	goToStep(0);
}

function launchSave(values) {
	const embed = newEmbed();
	state.formValues = {
		label: values.label,
		formId: values.formId,
		apiKey: values.apiKey,
		embed,
		encForm: fakeSeal(values.formId),
		encKey: fakeSeal(values.apiKey),
	};
	els.wpForm.classList.add("sending");
	window.setTimeout(() => {
		els.wpForm.classList.remove("sending");
		openStage("save", SAVE_STEPS);
	}, 300);
}

function ensureCredentials(values) {
	if (state.formValues.embed) return;
	const v = values || readDemoForm();
	const embed = newEmbed();
	state.formValues = {
		label: v.label,
		formId: v.formId,
		apiKey: v.apiKey,
		embed,
		encForm: fakeSeal(v.formId),
		encKey: fakeSeal(v.apiKey),
	};
}

function launchEmbed() {
	ensureCredentials(readDemoForm());
	openStage("embed", EMBED_STEPS);
}

function finishOrAdvance() {
	if (state.stepIndex >= state.steps.length - 1) {
		if (state.event?.type === "save") {
			launchEmbed();
			return;
		}
		els.stage.hidden = true;
		state.event = null;
		setBadge("");
		setStatus("ready");
		return;
	}
	goToStep(state.stepIndex + 1);
}

async function fetchState() {
	const base = origin();
	for (const url of [
		`${base}/wp-json/bcew-chefs/v1/flow-demo-state`,
		`${base}/?rest_route=/bcew-chefs/v1/flow-demo-state`,
	]) {
		const res = await fetch(url, { cache: "no-store" });
		if (res.status === 404) continue;
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		if (!data.enabled) throw new Error("bridge off");
		return data;
	}
	throw new Error("404");
}

async function tick() {
	try {
		const data = await fetchState();
		if (data.latestEvent && data.latestEvent.id !== state.eventId) {
			const ev = data.latestEvent;
			state.eventId = ev.id;
			if (ev.type === "save") {
				const row = ev.steps?.find((s) => s.row)?.row;
				state.formValues.label = ev.label || row?.label || readDemoForm().label;
				state.formValues.embed = ev.embed_ref || row?.embed_ref || newEmbed();
				state.formValues.encForm = row?.form_id_encrypted || fakeSeal("wp");
				state.formValues.encKey = row?.api_key_encrypted || fakeSeal("key");
				state.formValues.formId = els.demoFormId.value || "from WordPress";
				state.formValues.apiKey = els.demoApiKey.value || "••••";
				openStage("save", SAVE_STEPS);
			} else if (ev.type === "embed") {
				ensureCredentials(readDemoForm());
				if (ev.embed_ref) state.formValues.embed = ev.embed_ref;
				openStage("embed", EMBED_STEPS);
			}
			return;
		}
		if (!state.event) setStatus(`${data.rowCount} row(s)`, "ok");
	} catch (err) {
		setStatus(err.message, "err");
	}
}

function startWatching() {
	els.adminLink.href = `${origin()}/wp-admin/admin.php?page=bcew-chefs-form-settings`;
	state.watching = true;
	state.event = null;
	state.eventId = null;
	els.stage.hidden = true;
	clearInterval(state.pollTimer);
	setBadge("WATCHING");
	tick();
	state.pollTimer = setInterval(tick, POLL_MS);
}

function on(el, event, handler) {
	if (!el) return;
	el.addEventListener(event, handler);
}

try {
	renderFileTree(null);
	setStatus("ready");
	on(els.connect, "click", startWatching);
	on(els.demoSave, "click", () => launchSave(readDemoForm()));
	on(els.demoEmbed, "click", () => launchEmbed());
	on(els.prev, "click", () => goToStep(state.stepIndex - 1));
	on(els.next, "click", finishOrAdvance);
} catch (err) {
	console.error(err);
	setStatus(String(err.message || err), "err");
}
