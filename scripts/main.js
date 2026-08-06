(function () {
  const config = window.siteConfig || {};

  document.addEventListener("DOMContentLoaded", () => {
    setupBrand();
    setupNavigation();
    setupConfigLinks();
    renderFeatureCards();
    renderComingSoonTags();
    setupConditionalFields();
    setupContactForm();
    setupActiveSectionObserver();
    setCurrentYear();
  });

  function setupBrand() {
    const brandName = document.querySelector("[data-brand-name]");
    const brandSubtitle = document.querySelector("[data-brand-subtitle]");

    if (brandName && config.brandName) brandName.textContent = config.brandName;
    if (brandSubtitle && config.brandSubtitle) brandSubtitle.textContent = config.brandSubtitle;
  }

  function setupConfigLinks() {
    const socials = config.socials || {};

    document.querySelectorAll("[data-social-url]").forEach((link) => {
      const key = link.getAttribute("data-social-url");
      const social = socials[key] || {};
      const label = social.label || key || "Canale social";
      const url = normalizeUrl(social.url);

      if (!url) {
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("aria-label", `${label} in arrivo`);
        link.setAttribute("title", `${label} in arrivo`);
        link.classList.add("is-disabled");
        return;
      }

      link.href = url;
      link.removeAttribute("aria-disabled");
      link.classList.remove("is-disabled");
      link.setAttribute("aria-label", `Apri ${label}`);
      link.setAttribute("title", `Apri ${label}`);
    });

    document.querySelectorAll("[data-social-handle]").forEach((element) => {
      const key = element.getAttribute("data-social-handle");
      const social = socials[key] || {};
      if (social.handle) element.textContent = social.handle;
    });

    const contactLine = document.querySelector("[data-contact-line]");
    if (!contactLine) return;

    const contact = config.contact || {};
    const pieces = [];
    if (isValidEmail(contact.email)) pieces.push(`Email: ${contact.email}`);
    if (normalizeUrl(contact.whatsappUrl)) pieces.push(`WhatsApp: ${contact.whatsappNumber || contact.whatsappUrl}`);
    if (!normalizeUrl(contact.whatsappUrl)) pieces.push("WhatsApp Business non ancora attivo");
    contactLine.textContent = pieces.length ? pieces.join(" | ") : "Email e WhatsApp Business da inserire prima del lancio pubblico.";
  }

  function setupNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-site-nav]");

    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (!event.target.closest("a")) return;
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  function renderFeatureCards() {
    const grid = document.querySelector("[data-features-grid]");
    if (!grid || !Array.isArray(config.featureCards)) return;

    grid.innerHTML = config.featureCards
      .map(
        (card) => `
          <article class="feature-card">
            <span>${escapeHtml(card.kicker)}</span>
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.text)}</p>
          </article>
        `
      )
      .join("");
  }

  function setupConditionalFields() {
    document.querySelectorAll("[data-toggle-other]").forEach((select) => {
      const targetName = select.dataset.toggleOther;
      const root = select.closest("form") || document;
      const target = root.querySelector(`[data-conditional-field="${targetName}"]`);
      const field = target?.querySelector("textarea, input");

      if (!target || !field) return;

      const update = () => {
        const isOther = select.value === "Altro";
        target.hidden = !isOther;
        field.required = isOther;

        if (!isOther) field.value = "";
      };

      select.addEventListener("change", update);
      root.addEventListener("reset", () => window.setTimeout(update, 0));
      update();
    });
  }

  function renderComingSoonTags() {
    const list = document.querySelector("[data-coming-tags]");
    if (!list || !Array.isArray(config.comingSoonTags)) return;

    list.innerHTML = config.comingSoonTags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  }

  function setupContactForm() {
    const forms = document.querySelectorAll("[data-contact-form]");
    if (!forms.length) return;

    forms.forEach((form) => {
      form.addEventListener("submit", (event) => {
        const status = form.querySelector("[data-form-status]");
        const error = validateFormBeforeNativeSubmit(form);

        if (error) {
          event.preventDefault();
          setFormStatus(status, error, true);
          focusFirstInvalidField(form);
          return;
        }

        setFormStatus(status, "Invio in corso...");
      });
    });
  }

  function validateFormBeforeNativeSubmit(form) {
    const fullName = getField(form, "fullName");
    const email = getField(form, "email");
    const whatsapp = getField(form, "whatsapp");
    const message = getField(form, "message");
    const consent = getField(form, "consent");
    const mainInterest = getField(form, "mainInterest");
    const mainInterestOther = getField(form, "mainInterestOther");

    if (fullName?.required && fullName.value.trim().length < 3) return "Compila il campo: Nome e cognome.";
    if (email?.required && !email.value.trim()) return "Il campo email è obbligatorio.";
    if (email?.value && !isValidEmail(email.value)) return "Inserisci un indirizzo email valido.";
    if (whatsapp?.value && !isValidPhone(whatsapp.value)) {
      return "Inserisci un numero WhatsApp valido oppure lascia il campo vuoto.";
    }
    if (mainInterest?.value === "Altro" && !mainInterestOther?.value.trim()) {
      return "Scrivi cosa ti interessa oppure scegli un’altra voce.";
    }
    if (message?.required && message.value.trim().length < 12) return "Scrivi un messaggio un po’ più completo.";
    if (consent?.required && !consent.checked) return "Per inviare devi accettare il consenso privacy.";

    const missingRequired = getMissingRequiredField(form);
    if (missingRequired) return `Compila il campo: ${missingRequired}.`;

    return "";
  }

  function focusFirstInvalidField(form) {
    const field = Array.from(form.querySelectorAll("input, select, textarea")).find((element) => {
      if (element.closest("[hidden]")) return false;
      if (element.name === "bot-field") return false;
      if (element.name === "mainInterestOther") {
        const mainInterest = getField(form, "mainInterest");
        return mainInterest?.value === "Altro" && !element.value.trim();
      }
      if (element.type === "email" && element.value && !isValidEmail(element.value)) return true;
      if (element.name === "whatsapp" && element.value && !isValidPhone(element.value)) return true;
      if (element.name === "fullName" && element.required && element.value.trim().length < 3) return true;
      if (element.name === "message" && element.required && element.value.trim().length < 12) return true;
      if (element.type === "checkbox") return element.required && !element.checked;
      return element.required && !String(element.value || "").trim();
    });

    field?.focus();
  }

  function setFormStatus(element, message, isError = false) {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("is-error", isError);
  }

  function setupActiveSectionObserver() {
    const nav = document.querySelector("[data-site-nav]");
    if (!nav || !("IntersectionObserver" in window)) return;

    const links = Array.from(nav.querySelectorAll("a[href^='#']"));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
        });
      },
      { rootMargin: "-24% 0px -62% 0px", threshold: [0.08, 0.2, 0.4] }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function setCurrentYear() {
    const year = document.querySelector("[data-current-year]");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function normalizeUrl(value) {
    const url = String(value || "").trim();
    if (!url || !/^https?:\/\//i.test(url)) return "";
    return url;
  }

  function getField(form, fieldName) {
    const field = form.elements[fieldName];
    if (!field) return null;
    if (!field.tagName && typeof field.length === "number") return field[0] || null;
    return field;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function isValidPhone(value) {
    return /^[+()0-9\s.-]{6,}$/.test(String(value || "").trim());
  }

  function getMissingRequiredField(form) {
    const fields = Array.from(form.querySelectorAll("input[required], select[required], textarea[required]"));
    const missing = fields.find((field) => {
      if (field.closest("[hidden]")) return false;
      if (field.name === "consent") return false;
      if (field.type === "checkbox") return !field.checked;
      return !String(field.value || "").trim();
    });

    if (!missing) return "";
    const label = missing.closest("label");
    return label?.querySelector("span")?.textContent?.trim() || missing.name || "obbligatorio";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
