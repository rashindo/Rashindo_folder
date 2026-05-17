const DEFAULT_CONFIG = {
  FORM_ENDPOINT: "https://example.com/your-gas-endpoint",
  TIMEREX_URL: "https://timerex.net/s/buntasome.bs_341a/0bab93ed",
  AUTO_REDIRECT_DELAY_MS: 5000
};

const CONFIG = {
  ...DEFAULT_CONFIG,
  ...(window.CONSULTATION_CONFIG || {})
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

function getCheckedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value);
}

function validateConcerns() {
  const concerns = getCheckedValues("concerns");
  const isValid = concerns.length > 0;
  concernsError.hidden = isValid;
  return isValid;
}

function setSubmittingState(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? TEXTS.sending : TEXTS.submit;
}

function buildPayload() {
  return {
    submittedAt: new Date().toISOString(),
    businessType: form.businessType.value.trim(),
    industry: form.industry.value.trim(),
    monthlySales: form.monthlySales.value,
    employeeCount: form.employeeCount.value,
    concerns: getCheckedValues("concerns"),
    consultationGoal: form.consultationGoal.value,
    consultationStyle: form.consultationStyle.value,
    notes: form.notes.value.trim()
  };
}

async function sendFormData(payload) {
  const response = await fetch(CONFIG.FORM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
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
  clearError();

  const isFormValid = form.reportValidity();
  const isConcernsValid = validateConcerns();

  if (!isFormValid || !isConcernsValid) {
    return;
  }

  setSubmittingState(true);

  try {
    const payload = buildPayload();
    await sendFormData(payload);
    showCompletion();
  } catch (error) {
    console.error(error);
    showError(TEXTS.error);
    setSubmittingState(false);
  }
});
