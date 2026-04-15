const DEFAULT_CONFIG = {
  FORM_ENDPOINT: "https://script.google.com/macros/s/REPLACE_WITH_DEPLOY_ID/exec",
  TIMEREX_URL: "https://timerex.net/s/buntasome.bs_341a/0bab93ed",
  AUTO_REDIRECT_DELAY_MS: 5000,
  SOURCE: "line_richmenu_consultation"
};

function normalizeConfig(rawConfig) {
  const endpointFromNested = rawConfig?.ENDPOINTS?.GAS_WEBAPP_URL;
  return {
    ...DEFAULT_CONFIG,
    ...rawConfig,
    FORM_ENDPOINT: endpointFromNested || rawConfig?.FORM_ENDPOINT || DEFAULT_CONFIG.FORM_ENDPOINT
  };
}

const CONFIG = {
  ...normalizeConfig(window.CONSULTATION_CONFIG || {})
};

const TEXTS = {
  sending: "送信中…",
  submit: "内容を送信して日程予約へ進む",
  error: "送信に失敗しました。時間を置いて再度お試しください。",
  redirectNotice: "数秒後に予約ページへ移動します。移動しない場合は、下のボタンをご利用ください。"
};

const form = document.getElementById("consultation-form");
const submitButton = document.getElementById("submit-button");
const errorMessage = document.getElementById("error-message");
const concernsError = document.getElementById("concerns-error");
const completionSection = document.getElementById("completion");
const timerexLink = document.getElementById("timerex-link");
const redirectNotice = document.getElementById("redirect-notice");
let isSubmitting = false;

function getCheckedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value);
}

function validateConcerns() {
  const concerns = getCheckedValues("concerns");
  const isValid = concerns.length > 0;
  concernsError.hidden = isValid;
  return isValid;
}

function validateTextFields() {
  form.industry.value = form.industry.value.trim();
  form.notes.value = form.notes.value.trim();
  return form.industry.value.length > 0 && form.notes.value.length > 0;
}

function setSubmittingState(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? TEXTS.sending : TEXTS.submit;
}

function buildPayload() {
  return {
    timestamp: new Date().toISOString(),
    businessType: form.businessType.value.trim(),
    industry: form.industry.value.trim(),
    monthlyRevenue: form.monthlySales.value,
    employeeCount: form.employeeCount.value,
    concerns: getCheckedValues("concerns"),
    consultationIntent: form.consultationGoal.value,
    consultationPreference: form.consultationStyle.value,
    consultationDetails: form.notes.value.trim(),
    userAgent: window.navigator.userAgent || "",
    referrer: document.referrer || "",
    source: CONFIG.SOURCE
  };
}

async function sendFormData(payload) {
  if (!CONFIG.FORM_ENDPOINT || CONFIG.FORM_ENDPOINT.includes("REPLACE_WITH_DEPLOY_ID")) {
    throw new Error("FORM_ENDPOINT is not configured");
  }

  await fetch(CONFIG.FORM_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });
}

function showCompletion() {
  form.hidden = true;
  completionSection.hidden = false;
  timerexLink.href = CONFIG.TIMEREX_URL;
  redirectNotice.textContent = TEXTS.redirectNotice;

  window.setTimeout(() => {
    window.location.assign(CONFIG.TIMEREX_URL);
  }, CONFIG.AUTO_REDIRECT_DELAY_MS);
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

form.addEventListener("change", (event) => {
  if (event.target.name === "concerns") {
    validateConcerns();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting) {
    return;
  }

  clearError();
  validateTextFields();

  const isFormValid = form.reportValidity();
  const isConcernsValid = validateConcerns();
  const isTextFieldsValid = validateTextFields();

  if (!isFormValid || !isConcernsValid || !isTextFieldsValid) {
    return;
  }

  isSubmitting = true;
  setSubmittingState(true);

  try {
    const payload = buildPayload();
    await sendFormData(payload);
    showCompletion();
  } catch (error) {
    console.error(error);
    showError(TEXTS.error);
    isSubmitting = false;
    setSubmittingState(false);
  }
});
