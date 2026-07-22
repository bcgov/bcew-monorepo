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

const FORM_ID_ASIDE = {
	title: "What’s the Form ID?",
	body: "The CHEFS UUID for your form. It’s safe on public pages — it identifies the form but isn’t the API key. WordPress uses it to look up the encrypted API key when someone visits the page.",
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
		title: "Lock the API key",
		say: "The API key becomes scrambled. The Form ID stays readable for block lookup.",
		file: "plugins/bcew-chefs-form/includes/class-chefs-crypto.php",
		zone: {
			server: true,
			serverTag: "PHP only",
			serverNote: "encrypt() runs in PHP — ciphertext never sent to the browser",
		},
		code: () => `$api_key_encrypted = BCEW_Chefs_Crypto::encrypt( $api_key );
// Form ID stored as plaintext: $form_id`,
		morph: true,
		scene: () => `
			<span class="box secret morph-from" data-to="locked API key">API key</span>
			<span class="arrow">→</span>
			<span class="box lock">encrypt()</span>
		`,
	},
	{
		title: "Save in the database",
		say: "Form ID, label, and encrypted API key go in one DB row.",
		file: "plugins/bcew-chefs-form/includes/class-chefs-credentials.php",
		aside: FORM_ID_ASIDE,
		zone: {
			server: true,
			serverTag: "PHP + database",
			serverNote: "API key stored encrypted — admin page redirects, fields stay empty",
		},
		code: (c) => `$wpdb->insert( $table, [
    'form_id'           => '${esc(c.formId)}',
    'label'             => $label,
    'api_key_encrypted' => $api_key_encrypted,
] );`,
		scene: (c) => boxes([
			["form-id", `Form ID<small>${esc(c.formIdShort)}</small>`],
			["lock", "locked API key"],
			"→",
			["page", "database row"],
		]),
	},
	{
		title: "The block stores the Form ID",
		say: "The block editor stores the Form ID — not the API key. The API key never comes back to the browser.",
		file: "plugins/bcew-chefs-form/src/chefs-form/block.json",
		aside: FORM_ID_ASIDE,
		zone: {
			browser: true,
			server: true,
			browserTag: "Block editor",
			serverTag: "Saved in WP",
			browserNote: "Only Form ID in block attributes",
			serverNote: "API key stays in the encrypted DB row",
		},
		code: (c) => `"attributes": {
    "formId": {
        "type": "string",
        "default": "${esc(c.formId)}"
    }
}`,
		scene: (c) => boxes([
			["page", `block<small>Form ID ${esc(c.formIdShort)}</small>`],
			"=",
			["form-id", `database row<small>same Form ID</small>`],
		]),
	},
];

const EMBED_STEPS = [
	{
		title: "Page has the Form ID",
		say: "PHP runs render.php on the server first. The browser only receives finished HTML — with the Form ID, not the API key.",
		file: "plugins/bcew-chefs-form/src/chefs-form/render.php",
		aside: FORM_ID_ASIDE,
		zone: {
			browser: true,
			server: true,
			serverFirst: true,
			browserTag: "Public browser",
			serverTag: "render.php runs first",
			browserNote: "Gets HTML: data-bcew-chefs-form-id only",
			serverNote: "PHP builds the page before the DOM exists",
		},
		code: (c) => `$form_id = $attributes['formId'];

<div data-bcew-chefs-form-id="<?php echo esc_attr( $form_id ); ?>">
// → ${esc(c.formIdShort)}
</div>`,
		scene: (c) => boxes([
			["page", "public page"],
			"→",
			["form-id", `Form ID<small>${esc(c.formIdShort)}</small>`],
		]),
	},
	{
		title: "Form ID finds the DB row",
		say: "Match the Form ID → get the encrypted API key for that form.",
		file: "plugins/bcew-chefs-form/includes/class-chefs-credentials.php",
		aside: FORM_ID_ASIDE,
		zone: {
			server: true,
			serverTag: "PHP REST API",
			serverNote: "DB lookup on the server — browser only sent the Form ID",
		},
		code: (c) => `$row = $wpdb->get_row(
    $wpdb->prepare(
        'SELECT ... FROM wp_bcew_chefs_credentials
         WHERE form_id = %s',
        '${esc(c.formId)}'
    )
);`,
		scene: () => boxes([
			["form-id", "Form ID"],
			"→",
			["lock", "locked API key"],
		]),
	},
	{
		title: "Unlock on the server",
		say: "WordPress decrypts the API key in PHP. The browser still can’t see it.",
		file: "plugins/bcew-chefs-form/includes/class-chefs-crypto.php",
		zone: {
			server: true,
			serverTag: "PHP only",
			serverNote: "decrypt() in memory — plaintext never leaves the server",
		},
		code: () => `$api_key = BCEW_Chefs_Crypto::decrypt( $row['api_key_encrypted'] );`,
		morph: true,
		scene: () => `
			<span class="box lock morph-from" data-to="API key" data-cls="secret">locked API key</span>
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
    ?form_id=${esc(c.formId)}' )
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
		formIdShort: truncate(fv.formId, 10),
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
	state.formValues = {
		label: values.label,
		formId: values.formId,
		apiKey: values.apiKey,
		encKey: fakeSeal(values.apiKey),
	};
	els.wpForm.classList.add("sending");
	window.setTimeout(() => {
		els.wpForm.classList.remove("sending");
		openStage("save", SAVE_STEPS);
	}, 300);
}

function ensureCredentials(values) {
	if (state.formValues.formId) return;
	const v = values || readDemoForm();
	state.formValues = {
		label: v.label,
		formId: v.formId,
		apiKey: v.apiKey,
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
				state.formValues.formId = ev.form_id || row?.form_id || els.demoFormId.value || readDemoForm().formId;
				state.formValues.encKey = row?.api_key_encrypted || fakeSeal("key");
				state.formValues.apiKey = els.demoApiKey.value || "••••";
				openStage("save", SAVE_STEPS);
			} else if (ev.type === "embed") {
				ensureCredentials(readDemoForm());
				if (ev.form_id) state.formValues.formId = ev.form_id;
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
