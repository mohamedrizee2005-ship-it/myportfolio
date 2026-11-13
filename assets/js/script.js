"use strict";

// Essential interactions only; all portfolio content is available without animation.
document.documentElement.classList.add("js-enabled");

const themeButton = document.getElementById("theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
function syncThemeButton() {
  const dark = document.documentElement.dataset.theme === "dark";
  const label = dark ? "Switch to light theme" : "Switch to dark theme";
  themeButton.setAttribute("aria-label", label);
  themeButton.title = label;
  themeColor.content = dark ? "#131b25" : "#f8f7f4";
}
syncThemeButton();
themeButton.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  try { localStorage.setItem("theme", nextTheme); } catch (error) { /* Storage is optional. */ }
  syncThemeButton();
});

const menuButton = document.querySelector(".menu-toggle");
const menu = document.getElementById("main-nav");
menuButton.hidden = false;
function closeMenu() {
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menu.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
});
menu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("click", event => {
  if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia("(min-width: 761px)").addEventListener("change", closeMenu);

// Track the section nearest the navigation without hiding any page content.
const navLinks = Array.from(menu.querySelectorAll("[data-nav-link]"));
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-15% 0px -60% 0px", threshold: 0 });
  document.querySelectorAll("main > section[id]").forEach(section => observer.observe(section));
}

// Actual HallSync screenshots can be switched without leaving the project.
document.querySelectorAll("[data-gallery]").forEach(gallery => {
  const image = gallery.querySelector("[data-gallery-image]");
  const preview = gallery.querySelector("[data-gallery-preview]");
  const choices = gallery.querySelectorAll("[data-image-src]");
  choices.forEach(choice => choice.addEventListener("click", () => {
    image.src = choice.dataset.imageSrc;
    image.alt = choice.dataset.imageAlt;
    preview.dataset.preview = choice.dataset.imageSrc;
    preview.dataset.previewAlt = choice.dataset.imageAlt;
    preview.dataset.previewCaption = choice.dataset.imageCaption;
    choices.forEach(item => item.setAttribute("aria-pressed", String(item === choice)));
  }));
});

// A native dialog provides keyboard focus containment and Escape to close.
const dialog = document.getElementById("image-dialog");
const dialogImage = dialog.querySelector("[data-dialog-image]");
const dialogCaption = dialog.querySelector("[data-dialog-caption]");
let previewTrigger = null;
document.querySelectorAll("[data-preview]").forEach(button => {
  button.addEventListener("click", () => {
    previewTrigger = button;
    dialogImage.src = button.dataset.preview;
    dialogImage.alt = button.dataset.previewAlt || "Portfolio image preview";
    dialogCaption.textContent = button.dataset.previewCaption || "";
    dialog.showModal();
    document.body.classList.add("dialog-open");
  });
});
dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  dialogImage.removeAttribute("src");
  if (previewTrigger) previewTrigger.focus();
});

const contactForm = document.getElementById("contact-form");
contactForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const name = contactForm.elements.fullname.value.trim();
  const email = contactForm.elements.email.value.trim();
  const message = contactForm.elements.message.value.trim();
  if (!name || !email || !message) {
    document.getElementById("form-status").textContent = "Please enter your name, email address, and message.";
    return;
  }
  const subject = contactForm.elements.subject.value.trim() || "Portfolio enquiry from " + name;
  const body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
  document.getElementById("form-status").textContent = "Opening your email app. If it doesn’t open, use the email address on this page.";
  window.location.href = "mailto:mohamedrizee2005@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
});
document.querySelectorAll("[data-year]").forEach(element => { element.textContent = new Date().getFullYear(); });
