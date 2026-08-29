"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const html = read("index.html");
const css = read("css/tooplate-style.css");
const customJs = read("js/custom.js");

test("every new-tab link prevents opener access", () => {
  const newTabLinks = html.match(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi) || [];

  assert.ok(newTabLinks.length > 0, "expected at least one new-tab link");
  for (const tag of newTabLinks) {
    assert.match(tag, /\brel=["'][^"']*\bnoopener\b[^"']*\bnoreferrer\b[^"']*["']/i, tag);
  }
});

test("the static page declares a restrictive security baseline", () => {
  const csp = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);

  assert.ok(csp, "Content-Security-Policy meta tag is missing");
  assert.match(csp[1], /default-src 'self'/);
  assert.match(csp[1], /object-src 'none'/);
  assert.match(csp[1], /base-uri 'none'/);
  assert.match(csp[1], /form-action https:\/\/formspree\.io/);
  assert.match(html, /<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin">/i);
});

test("the contact form keeps native validation and an unfocusable honeypot", () => {
  const formTag = html.match(/<form\b[^>]*\bid="contact-form"[^>]*>/i)?.[0] || "";
  const honeypotTag = html.match(/<input\b[^>]*\bname="_gotcha"[^>]*>/i)?.[0] || "";

  assert.ok(formTag, "contact form is missing");
  assert.doesNotMatch(formTag, /\bnovalidate\b/i);
  assert.match(honeypotTag, /\btabindex="-1"/i);
});

test("WOW loads before its initializer and remains enabled on mobile", () => {
  const wowScriptIndex = html.indexOf('src="js/wow.min.js"');
  const customScriptIndex = html.indexOf('src="js/custom.js"');

  assert.ok(wowScriptIndex >= 0, "WOW.js script is missing");
  assert.ok(customScriptIndex > wowScriptIndex, "custom.js must load after WOW.js");
  assert.match(customJs, /new window\.WOW\(\{[\s\S]*?mobile:\s*true,[\s\S]*?live:\s*true,[\s\S]*?offset:\s*16[\s\S]*?\}\)/);
  assert.match(customJs, /typeof window\.WOW !== "function"/);
});

test("animation code honors reduced-motion preferences", () => {
  assert.match(customJs, /prefers-reduced-motion:\s*reduce/);
  assert.match(customJs, /if \(prefersReducedMotion\(\)\) \{[\s\S]*?scrollRoot\.scrollTop = targetTop;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.wow,[\s\S]*?\.critical-reveal[\s\S]*?visibility: visible !important/);
});

test("the visual redesign stays within the phone breakpoint", () => {
  const marker = "2026-08-28 mobile presentation pass";
  const markerIndex = css.indexOf(marker);
  const mobileMediaIndex = css.lastIndexOf("@media (max-width: 767px)", markerIndex);

  assert.ok(markerIndex >= 0, "mobile presentation block is missing");
  assert.ok(mobileMediaIndex >= 0, "mobile presentation block is not breakpoint-scoped");
  assert.match(css.slice(markerIndex), /\.portfolio-rail[\s\S]*?position:\s*fixed/);
  assert.match(css.slice(markerIndex), /#contact \.form-floating label[\s\S]*?order:\s*-1/);
  assert.match(css.slice(markerIndex), /#service,[\s\S]*?padding-top:\s*52px/);
  assert.match(css.slice(markerIndex), /#home \{[\s\S]*?height:\s*88svh !important/);
});

test("one smooth-scroll implementation owns portfolio anchor clicks", () => {
  assert.doesNotMatch(html, /src=["']js\/smoothscroll\.js["']/i);
  assert.match(customJs, /requestAnimationFrame\(step\)/);
  assert.match(customJs, /\(timestamp - startTime\) \/ 720/);
});

test("WOW receives updates from the page's body scroll root", () => {
  assert.match(customJs, /pageScrollRoot\.addEventListener\("scroll"/);
  assert.match(customJs, /wow\.scrollHandler\(\)/);
});

test("the preloader cannot wait on large gallery downloads", () => {
  assert.match(customJs, /\$\(dismissPreloader\)/);
  assert.match(customJs, /window\.setTimeout\(dismissPreloader, 3000\)/);
  assert.match(html, /@keyframes preloader-failsafe/);

  const galleryImages = html.match(/<img\b[^>]+(?:gulfstream|leadership)[^>]*>/gi) || [];
  assert.equal(galleryImages.length, 7);
  for (const tag of galleryImages) {
    assert.match(tag, /\bloading="lazy"/i, tag);
    assert.match(tag, /\bdecoding="async"/i, tag);
  }
});

test("all local script references resolve to tracked files", () => {
  const sources = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((match) => match[1]);
  const localSources = sources.filter((source) => !/^https?:\/\//i.test(source));

  assert.ok(localSources.length > 0, "expected local scripts");
  for (const source of localSources) {
    assert.ok(fs.existsSync(path.join(root, source.replace(/^\//, ""))), `${source} does not exist`);
  }
});
