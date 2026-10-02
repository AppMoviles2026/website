// Validates the visual contact form and simulates submission without delivering messages.
export function initContact(i18n) {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const summary = document.querySelector("#error-summary");
  const status = document.querySelector("#form-status");
  const selectionNote = document.querySelector("#selected-plan");
  const submit = form.querySelector('[type="submit"]');
  const fieldNames = ["segment", "name", "email", "message", "consent"];
  const fields = {
    segment: form.querySelector('[name="segment"]'),
    name: form.elements.namedItem("name"),
    email: form.elements.namedItem("email"),
    message: form.elements.namedItem("message"),
    consent: form.elements.namedItem("consent")
  };
  const controls = [...form.querySelectorAll("input, textarea, button"), ...document.querySelectorAll("[data-plan]")];
  let selectedPlan = "";
  let errors = [];
  let statusKey = "";
  let sending = false;

  function validate() {
    const invalid = [];
    if (!form.querySelector('[name="segment"]:checked')) invalid.push("segment");
    if (!fields.name.value.trim()) invalid.push("name");
    if (!fields.email.value.trim() || !fields.email.validity.valid) invalid.push("email");
    const messageLength = fields.message.value.trim().length;
    if (messageLength < 10 || messageLength > 2000) invalid.push("message");
    if (!fields.consent.checked) invalid.push("consent");
    return invalid;
  }

  function renderErrors(focusSummary = false) {
    fieldNames.forEach(name => {
      const invalid = errors.includes(name);
      const fieldControls = name === "segment" ? form.querySelectorAll('[name="segment"]') : [fields[name]];
      fieldControls.forEach(control => {
        if (invalid) control.setAttribute("aria-invalid", "true");
        else control.removeAttribute("aria-invalid");
      });
      const message = document.querySelector(`#${name}-error`);
      message.hidden = !invalid;
      message.textContent = invalid ? i18n.translate(`form.error.${name}`) : "";
    });
    summary.replaceChildren();
    summary.hidden = errors.length === 0;
    if (!errors.length) return;
    const heading = document.createElement("strong");
    heading.textContent = i18n.translate("form.error.summary");
    const list = document.createElement("ul");
    errors.forEach(name => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${fields[name].id}`;
      link.textContent = i18n.translate(`form.error.${name}`);
      link.addEventListener("click", event => {
        event.preventDefault();
        fields[name].focus();
      });
      item.append(link);
      list.append(item);
    });
    summary.append(heading, list);
    if (focusSummary) summary.focus();
  }

  function renderState() {
    status.hidden = !statusKey;
    status.textContent = statusKey ? i18n.translate(statusKey) : "";
    status.dataset.state = statusKey.split(".").pop();
    selectionNote.hidden = !selectedPlan;
    selectionNote.textContent = selectedPlan
      ? i18n.translate("form.planSelected", { plan: i18n.translate(`plan.${selectedPlan}.name`) })
      : "";
    submit.querySelector("span").textContent = i18n.translate(sending ? "form.sending" : "form.submit");
    submit.disabled = sending || validate().length > 0;
    submit.setAttribute("aria-disabled", String(submit.disabled));
  }

  document.querySelectorAll("[data-plan]").forEach(button => {
    button.addEventListener("click", () => {
      selectedPlan = button.dataset.plan;
      if (selectedPlan !== "free") form.querySelector('[name="segment"][value="business"]').checked = true;
      errors = errors.filter(name => name !== "segment" || !form.querySelector('[name="segment"]:checked'));
      renderErrors();
      renderState();
      document.querySelector("#contact").scrollIntoView();
      fields.name.focus({ preventScroll: true });
    });
  });
  form.querySelectorAll('[name="segment"]').forEach(input => {
    input.addEventListener("change", () => {
      if (selectedPlan && selectedPlan !== "free" && input.value !== "business") selectedPlan = "";
      renderState();
    });
  });
  form.addEventListener("input", () => {
    statusKey = "";
    renderState();
    if (errors.length) {
      const invalid = validate();
      errors = errors.filter(name => invalid.includes(name));
      renderErrors();
    }
  });
  form.addEventListener("change", () => renderState());
  i18n.subscribe(() => {
    renderErrors();
    renderState();
  });

  form.noValidate = true;
  renderState();
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (sending) return;
    statusKey = "";
    errors = validate();
    renderState();
    renderErrors(errors.length > 0);
    if (errors.length) return;

    sending = true;
    statusKey = "form.sending";
    form.setAttribute("aria-busy", "true");
    controls.forEach(control => { control.disabled = true; });
    renderState();
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      form.reset();
      selectedPlan = "";
      statusKey = "form.success";
    } catch (error) {
      statusKey = "form.failure";
    } finally {
      sending = false;
      controls.forEach(control => { control.disabled = false; });
      form.removeAttribute("aria-busy");
      renderState();
      status.focus();
    }
  });
}
