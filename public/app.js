const seed = window.kisanMitraSeed;
const publishedWebUrl = "https://srinureddyy22.github.io/kisan-mitra-mvp/";

const cropKeys = Object.keys(seed.crops);
const problemKeys = Object.keys(seed.problems);
const storageKey = "kisan-mitra-state";

const dom = {
  heroCropCount: document.querySelector("#heroCropCount"),
  heroProblemCount: document.querySelector("#heroProblemCount"),
  heroCaseCount: document.querySelector("#heroCaseCount"),
  configBadge: document.querySelector("#configBadge"),
  configText: document.querySelector("#configText"),
  liveSignalCrop: document.querySelector("#liveSignalCrop"),
  liveSignalProblem: document.querySelector("#liveSignalProblem"),
  liveSignalUrgency: document.querySelector("#liveSignalUrgency"),
  liveSignalWater: document.querySelector("#liveSignalWater"),
  farmForm: document.querySelector("#farmForm"),
  cropSelect: document.querySelector("#cropSelect"),
  symptomSelect: document.querySelector("#symptomSelect"),
  irrigationForm: document.querySelector("#irrigationForm"),
  irrigationCropSelect: document.querySelector("#irrigationCropSelect"),
  weatherForm: document.querySelector("#weatherForm"),
  weatherLocationInput: document.querySelector("#weatherLocationInput"),
  copilotForm: document.querySelector("#copilotForm"),
  copilotQuestion: document.querySelector("#copilotQuestion"),
  scenarioChips: document.querySelector("#scenarioChips"),
  promptChips: document.querySelector("#promptChips"),
  summaryHeadline: document.querySelector("#summaryHeadline"),
  summaryTag: document.querySelector("#summaryTag"),
  summaryParagraph: document.querySelector("#summaryParagraph"),
  caseIdLabel: document.querySelector("#caseIdLabel"),
  caseStageLabel: document.querySelector("#caseStageLabel"),
  caseUpdatedLabel: document.querySelector("#caseUpdatedLabel"),
  caseStatusText: document.querySelector("#caseStatusText"),
  saveCaseButton: document.querySelector("#saveCaseButton"),
  downloadReportButton: document.querySelector("#downloadReportButton"),
  newCaseButton: document.querySelector("#newCaseButton"),
  issuePriority: document.querySelector("#issuePriority"),
  todayPriority: document.querySelector("#todayPriority"),
  waterPriority: document.querySelector("#waterPriority"),
  budgetPriority: document.querySelector("#budgetPriority"),
  expertPriority: document.querySelector("#expertPriority"),
  checklistList: document.querySelector("#checklistList"),
  irrigationVolume: document.querySelector("#irrigationVolume"),
  irrigationDuration: document.querySelector("#irrigationDuration"),
  weatherLocationLabel: document.querySelector("#weatherLocationLabel"),
  weatherSummaryText: document.querySelector("#weatherSummaryText"),
  weatherCurrentTemp: document.querySelector("#weatherCurrentTemp"),
  weatherHumidity: document.querySelector("#weatherHumidity"),
  weatherRainChance: document.querySelector("#weatherRainChance"),
  weatherEt0: document.querySelector("#weatherEt0"),
  weatherSoil: document.querySelector("#weatherSoil"),
  forecastCards: document.querySelector("#forecastCards"),
  photoInput: document.querySelector("#photoInput"),
  clearPhotoButton: document.querySelector("#clearPhotoButton"),
  photoStatus: document.querySelector("#photoStatus"),
  photoModeBadge: document.querySelector("#photoModeBadge"),
  photoPreviewShell: document.querySelector("#photoPreviewShell"),
  photoPreview: document.querySelector("#photoPreview"),
  photoPlaceholder: document.querySelector("#photoPlaceholder"),
  voiceToggleButton: document.querySelector("#voiceToggleButton"),
  clearQuestionButton: document.querySelector("#clearQuestionButton"),
  voiceStatus: document.querySelector("#voiceStatus"),
  voiceSupportBadge: document.querySelector("#voiceSupportBadge"),
  chatThread: document.querySelector("#chatThread"),
  caseList: document.querySelector("#caseList"),
  cropLibrary: document.querySelector("#cropLibrary"),
  problemLibrary: document.querySelector("#problemLibrary"),
  appUrlLink: document.querySelector("#appUrlLink")
};

const state = {
  config: {
    assistantMode: "local-only",
    openAiConfigured: false,
    model: null
  },
  weather: null,
  previousResponseId: null,
  attachedPhotoDataUrl: null,
  attachedPhotoName: "",
  voiceRecognition: null,
  voiceBaseQuestion: "",
  isListening: false,
  savedCases: [],
  currentCaseMeta: null
};

function readStoredState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch (error) {
    return {};
  }
}

function writeStoredState(nextState) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(nextState));
  } catch (error) {
    return;
  }
}

function isNativePlatform() {
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

function isStandaloneExperience() {
  return (
    isNativePlatform() ||
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

function mergeStoredState(partial) {
  writeStoredState({
    ...readStoredState(),
    ...partial
  });
}

function getRecognitionLanguage() {
  const languageMap = {
    English: "en-IN",
    Hindi: "hi-IN",
    Telugu: "te-IN"
  };

  return languageMap[getFarmValues().language] || "en-IN";
}

function getPhotoStatusText() {
  if (!state.attachedPhotoDataUrl) {
    return "Attach a crop or leaf photo to keep a visual reference while reviewing local guidance.";
  }

  return `${state.attachedPhotoName || "Crop photo"} is attached. Local mode keeps the preview for comparison, but no external image analysis is used.`;
}

function renderPhotoState(message) {
  const hasPhoto = Boolean(state.attachedPhotoDataUrl);

  dom.photoModeBadge.textContent = hasPhoto ? "Photo attached" : "Photo optional";
  dom.photoStatus.textContent = message || getPhotoStatusText();
  dom.photoPreviewShell.classList.toggle("is-empty", !hasPhoto);
  dom.photoPreview.hidden = !hasPhoto;
  dom.photoPlaceholder.hidden = hasPhoto;
  dom.clearPhotoButton.disabled = !hasPhoto;

  if (hasPhoto) {
    dom.photoPreview.src = state.attachedPhotoDataUrl;
  } else {
    dom.photoPreview.removeAttribute("src");
  }
}

function setPhotoState(photoDataUrl, photoName = "", options = {}) {
  const { skipRenderMeta = false } = options;
  state.attachedPhotoDataUrl = photoDataUrl || null;
  state.attachedPhotoName = photoDataUrl ? photoName || "Crop photo" : "";
  renderPhotoState();

  if (!skipRenderMeta && state.currentCaseMeta) {
    renderCaseMeta();
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the selected photo."));
    reader.readAsDataURL(file);
  });
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to open the selected photo."));
    image.src = dataUrl;
  });
}

async function compressPhotoFile(file) {
  const originalDataUrl = await fileToDataUrl(file);
  const image = await loadImageFromDataUrl(originalDataUrl);
  const maxDimension = 1280;
  const longestSide = Math.max(image.width || 1, image.height || 1);
  const scale = Math.min(1, maxDimension / longestSide);
  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.round((image.width || 1) * scale));
  canvas.height = Math.max(1, Math.round((image.height || 1) * scale));

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to process the selected photo.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);

  if (compressedDataUrl.length > 6_500_000) {
    throw new Error("Photo is still too large after compression. Try a closer image.");
  }

  return compressedDataUrl;
}

async function handlePhotoSelection(file) {
  if (!file) {
    return;
  }

  renderPhotoState("Processing the photo for upload...");

  try {
    const compressedPhoto = await compressPhotoFile(file);
    setPhotoState(compressedPhoto, file.name || "Crop photo", {
      skipRenderMeta: true
    });
    markCaseDirty();
    renderCaseMeta();
  } catch (error) {
    setPhotoState(null);
    renderPhotoState(error.message || "Unable to process the selected photo.");
  }
}

function litersFromMillimeters(mm, acres) {
  return Math.max(0, mm) * acres * 4046.86;
}

function formatLiters(value) {
  return `${Math.round(value).toLocaleString("en-IN")} L`;
}

function formatMinutes(totalMinutes) {
  const safeMinutes = Math.max(1, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0) {
    return `${minutes} minutes`;
  }

  if (minutes === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minutes`;
}

function formatNumber(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "--";
}

function formatShortDate(value) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric"
  });
}

function formatTimestamp(value) {
  if (!value) {
    return "Not saved yet";
  }

  return new Date(value).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getDefaultFarmValues() {
  return {
    farmerName: "Ramu",
    location: "Hyderabad",
    language: "English",
    crop: "paddy",
    stage: "vegetative",
    acres: 5,
    irrigationSource: "canal",
    symptom: "yellowing",
    affectedArea: 25,
    soilMoisture: 42,
    canopyTemp: 31,
    rainForecast: 10,
    goal: "save-crop",
    budget: "balanced",
    urgency: "today"
  };
}

function generateCaseId() {
  const stamp = new Date()
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, "");
  const token = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `KM-${stamp}-${token}`;
}

function createCaseMeta(partial = {}) {
  const now = new Date().toISOString();

  return {
    id: partial.id || generateCaseId(),
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now,
    isSaved: Boolean(partial.isSaved)
  };
}

function ensureCurrentCaseMeta() {
  if (!state.currentCaseMeta) {
    state.currentCaseMeta = createCaseMeta();
  }

  return state.currentCaseMeta;
}

function markCaseDirty() {
  const meta = ensureCurrentCaseMeta();

  meta.updatedAt = new Date().toISOString();
  meta.isSaved = false;
}

function getCaseLifecycle(advisory) {
  if (advisory.riskLabel === "Severe" || advisory.urgencyLabel === "Act today") {
    return "Needs action";
  }

  if (advisory.riskLabel === "High" || advisory.urgencyLabel === "Watch closely") {
    return "Monitoring";
  }

  return "Stable watch";
}

function buildCurrentCaseRecord() {
  const farmValues = getFarmValues();
  const advisory = buildAdvisory(farmValues);
  const meta = ensureCurrentCaseMeta();

  return {
    id: meta.id,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    isSaved: meta.isSaved,
    status: getCaseLifecycle(advisory),
    farmerName: farmValues.farmerName || "Farmer",
    location: farmValues.location || "Unknown location",
    cropName: seed.crops[farmValues.crop].name,
    cropKey: farmValues.crop,
    stage: farmValues.stage,
    symptomKey: farmValues.symptom,
    symptomLabel: seed.problems[farmValues.symptom].label,
    urgencyLabel: advisory.urgencyLabel,
    riskLabel: advisory.riskLabel,
    summary: advisory.summary,
    likelyCause: advisory.likelyCause,
    todayAction: advisory.todayAction,
    waterLine: advisory.waterLine,
    budgetLine: advisory.budgetLine,
    expertLine: advisory.expertLine,
    checklist: advisory.checklist,
    weatherSummary: state.weather?.summary || "Weather not loaded",
    weatherLocation: state.weather?.locationName || "",
    photoAttached: Boolean(state.attachedPhotoDataUrl),
    questionDraft: dom.copilotQuestion.value.trim(),
    farmValues
  };
}

function buildReportText(caseRecord) {
  return [
    "Kisan Mitra MVP Field Report",
    `Case ID: ${caseRecord.id}`,
    `Created: ${formatTimestamp(caseRecord.createdAt)}`,
    `Updated: ${formatTimestamp(caseRecord.updatedAt)}`,
    `Status: ${caseRecord.status}`,
    "",
    "Farmer Details",
    `Farmer: ${caseRecord.farmerName}`,
    `Location: ${caseRecord.location}`,
    `Crop: ${caseRecord.cropName}`,
    `Stage: ${labelFromKey(caseRecord.stage)}`,
    `Problem: ${caseRecord.symptomLabel}`,
    "",
    "Field Summary",
    caseRecord.summary,
    "",
    "Likely Cause",
    caseRecord.likelyCause,
    "",
    "What To Do Today",
    caseRecord.todayAction,
    "",
    "Water Plan",
    caseRecord.waterLine,
    "",
    "Budget Move",
    caseRecord.budgetLine,
    "",
    "When To Escalate",
    caseRecord.expertLine,
    "",
    "Checklist",
    ...caseRecord.checklist.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Weather",
    caseRecord.weatherSummary,
    "",
    "MVP Notes",
    caseRecord.photoAttached
      ? "A crop photo was attached during review, but photos are not stored in saved local case records."
      : "No crop photo was attached for this case.",
    caseRecord.questionDraft
      ? `Question Draft: ${caseRecord.questionDraft}`
      : "Question Draft: none"
  ].join("\n");
}

function renderVoiceState(message) {
  const supported = Boolean(state.voiceRecognition);

  if (!supported) {
    dom.voiceSupportBadge.textContent = "Browser limited";
    dom.voiceToggleButton.textContent = "Voice Not Supported";
    dom.voiceToggleButton.disabled = true;
    dom.voiceStatus.textContent =
      message ||
      "Voice input works in supported Chrome or Edge style browsers after microphone permission is granted.";
    return;
  }

  dom.voiceToggleButton.disabled = false;
  dom.voiceSupportBadge.textContent = state.isListening ? "Listening" : "Mic ready";
  dom.voiceToggleButton.textContent = state.isListening ? "Stop Listening" : "Start Voice Input";
  dom.voiceStatus.textContent =
    message || `Mic is ready. Tap and speak in ${getFarmValues().language}.`;
}

function initializeVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    renderVoiceState();
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    state.isListening = true;
    renderVoiceState(`Listening in ${getFarmValues().language}. Speak your crop question now.`);
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();

    dom.copilotQuestion.value = [state.voiceBaseQuestion, transcript].filter(Boolean).join(" ").trim();
  };

  recognition.onerror = (event) => {
    state.isListening = false;

    if (event.error === "not-allowed") {
      renderVoiceState("Microphone access was blocked. Allow mic access and try again.");
      return;
    }

    if (event.error === "no-speech") {
      renderVoiceState("No speech was detected. Try again and speak a little closer to the microphone.");
      return;
    }

    renderVoiceState("Voice input could not start properly. Try again or type your question manually.");
  };

  recognition.onend = () => {
    state.isListening = false;
    renderVoiceState(
      dom.copilotQuestion.value.trim()
        ? "Voice input was added to the question box."
        : `Mic is ready. Tap and speak in ${getFarmValues().language}.`
    );
  };

  state.voiceRecognition = recognition;
  renderVoiceState();
}

function toggleVoiceRecognition() {
  if (!state.voiceRecognition) {
    renderVoiceState();
    return;
  }

  if (state.isListening) {
    state.voiceRecognition.stop();
    return;
  }

  state.voiceBaseQuestion = dom.copilotQuestion.value.trim();
  state.voiceRecognition.lang = getRecognitionLanguage();

  try {
    state.voiceRecognition.start();
  } catch (error) {
    renderVoiceState("Voice input is still preparing. Please tap the mic again in a moment.");
  }
}

function labelFromKey(value) {
  return value.replace(/-/g, " ");
}

function populateCropSelect(selectElement) {
  selectElement.innerHTML = "";

  cropKeys.forEach((cropKey) => {
    const option = document.createElement("option");
    option.value = cropKey;
    option.textContent = seed.crops[cropKey].name;
    selectElement.append(option);
  });
}

function populateProblemSelect(selectElement) {
  selectElement.innerHTML = "";

  problemKeys.forEach((problemKey) => {
    const option = document.createElement("option");
    option.value = problemKey;
    option.textContent = seed.problems[problemKey].label;
    selectElement.append(option);
  });
}

function renderCounts() {
  dom.heroCropCount.textContent = String(cropKeys.length);
  dom.heroProblemCount.textContent = String(problemKeys.length);
  dom.heroCaseCount.textContent = String(state.savedCases.length);
}

function renderScenarioChips() {
  dom.scenarioChips.innerHTML = "";

  seed.scenarios.forEach((scenario) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.dataset.scenarioId = scenario.id;
    button.textContent = `${scenario.label} - ${scenario.note}`;
    dom.scenarioChips.append(button);
  });
}

function renderPromptChips() {
  dom.promptChips.innerHTML = "";

  seed.prompts.forEach((prompt) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.dataset.prompt = prompt;
    button.textContent = prompt;
    dom.promptChips.append(button);
  });
}

function getFarmValues() {
  const data = new FormData(dom.farmForm);

  return {
    farmerName: String(data.get("farmerName") || "").trim(),
    location: String(data.get("location") || "").trim(),
    language: data.get("language"),
    crop: data.get("crop"),
    stage: data.get("stage"),
    acres: Number(data.get("acres")),
    irrigationSource: data.get("irrigationSource"),
    symptom: data.get("symptom"),
    affectedArea: Number(data.get("affectedArea")),
    soilMoisture: Number(data.get("soilMoisture")),
    canopyTemp: Number(data.get("canopyTemp")),
    rainForecast: Number(data.get("rainForecast")),
    goal: data.get("goal"),
    budget: data.get("budget"),
    urgency: data.get("urgency")
  };
}

function setFarmValues(values) {
  dom.farmForm.elements.farmerName.value = values.farmerName;
  dom.farmForm.elements.location.value = values.location;
  dom.farmForm.elements.language.value = values.language;
  dom.farmForm.elements.crop.value = values.crop;
  dom.farmForm.elements.stage.value = values.stage;
  dom.farmForm.elements.acres.value = values.acres;
  dom.farmForm.elements.irrigationSource.value = values.irrigationSource;
  dom.farmForm.elements.symptom.value = values.symptom;
  dom.farmForm.elements.affectedArea.value = values.affectedArea;
  dom.farmForm.elements.soilMoisture.value = values.soilMoisture;
  dom.farmForm.elements.canopyTemp.value = values.canopyTemp;
  dom.farmForm.elements.rainForecast.value = values.rainForecast;
  dom.farmForm.elements.goal.value = values.goal;
  dom.farmForm.elements.budget.value = values.budget;
  dom.farmForm.elements.urgency.value = values.urgency;

  dom.irrigationForm.elements.crop.value = values.crop;
  dom.irrigationForm.elements.acres.value = values.acres;
  dom.irrigationForm.elements.soilMoisture.value = values.soilMoisture;

  if (values.location) {
    dom.weatherLocationInput.value = values.location;
  }
}

function getWeatherContext() {
  return state.weather;
}

function calculateRiskLabel(score) {
  if (score >= 6) {
    return "Severe";
  }

  if (score >= 4) {
    return "High";
  }

  if (score >= 2) {
    return "Moderate";
  }

  return "Low";
}

function calculateUrgencyLabel(score, urgency) {
  if (score >= 6 || urgency === "today") {
    return "Act today";
  }

  if (score >= 4 || urgency === "this-week") {
    return "Watch closely";
  }

  return "Routine watch";
}

function buildGoalLine(goal) {
  const goalLines = {
    "save-crop": "Focus on stopping spread and reducing plant stress before chasing extra growth.",
    "increase-yield": "Protect the healthiest area first so the field keeps its yield potential.",
    "reduce-cost": "Spend only on confirmed problem zones first and avoid blanket action.",
    "harvest-quality": "Protect produce quality and avoid rough or last-minute corrections close to harvest."
  };

  return goalLines[goal] || goalLines["save-crop"];
}

function buildBudgetLine(problem, budget, affectedArea) {
  if (budget === "low") {
    return `Low-cost first: ${problem.lowCost} Spend only after you confirm the cause in the affected patch.`;
  }

  if (budget === "protect-yield") {
    return `Protect-yield mode: confirm the cause quickly, then prioritize the ${affectedArea >= 25 ? "worst block" : "weak patches"} before the issue expands.`;
  }

  return `Balanced spend: ${problem.lowCost} If symptoms continue, act on the affected area first instead of the whole field.`;
}

function buildWaterLine(farmValues, crop, workingRain, rainChance, liters) {
  const sourceTips = {
    rainfed: "Because this field depends on rainfall, conserve existing moisture and avoid reacting to surface dryness alone.",
    borewell: "Use borewell water in split turns so the weakest patches recover without waterlogging the rest of the field.",
    canal: "If canal water is available, direct the first turn to weak patches and avoid flooding healthy areas.",
    drip: "Use shorter split irrigation cycles so roots get support without keeping leaves or fruit too wet.",
    sprinkler: "Avoid long sprinkler runs if leaf wetness or disease pressure already looks high."
  };

  const sourceTip = sourceTips[farmValues.irrigationSource] || sourceTips.borewell;

  if (farmValues.irrigationSource === "rainfed") {
    if (rainChance >= 60 || workingRain >= 10) {
      return `${sourceTip} Rain chances are already meaningful, so check root-zone moisture before arranging extra water.`;
    }

    return `${sourceTip} Mulch, shallow soil checks, and early scouting matter more than rushing into a full irrigation plan.`;
  }

  if (rainChance >= 60 || workingRain >= 10) {
    return `Expected rain is fairly high. Avoid a heavy irrigation today; if stress remains, give only a light split watering of about ${formatLiters(
      liters * 0.45
    )} to the driest patches first.`;
  }

  return `Apply about ${formatLiters(liters)} in split watering if the weakest area still looks stressed. ${sourceTip}`;
}

function buildAdvisory(farmValues) {
  const crop = seed.crops[farmValues.crop];
  const problem = seed.problems[farmValues.symptom];
  const weather = getWeatherContext();
  const todayWeather = weather?.forecast?.[0] || null;
  const workingTemp = todayWeather?.maxTempC ?? weather?.current?.temperatureC ?? farmValues.canopyTemp;
  const workingHumidity = weather?.current?.humidityPercent ?? 58;
  const workingRain = todayWeather?.precipitationMm ?? farmValues.rainForecast;
  const rainChance = todayWeather?.rainChancePercent ?? Math.min(farmValues.rainForecast * 5, 100);
  const drynessGap = Math.max(crop.droughtThreshold - farmValues.soilMoisture, 0);
  const heatLift = workingTemp >= 35 ? 1.1 : workingTemp >= 31 ? 0.5 : 0;
  const rainRelief = Math.min(workingRain * 0.16, crop.waterNeedMm * 0.55);
  const irrigationMm = Math.max(crop.waterNeedMm + drynessGap * 0.15 + heatLift - rainRelief, 1.3);
  const liters = litersFromMillimeters(irrigationMm, farmValues.acres);

  let riskScore = 0;

  if (farmValues.soilMoisture < crop.droughtThreshold - 8) {
    riskScore += 2;
  } else if (farmValues.soilMoisture < crop.droughtThreshold) {
    riskScore += 1;
  }

  if (workingTemp >= 35) {
    riskScore += 1;
  }

  if (farmValues.symptom !== "none") {
    riskScore += 2;
  }

  if (workingHumidity >= 82 || rainChance >= 65) {
    riskScore += 1;
  }

  if (farmValues.affectedArea >= 40) {
    riskScore += 2;
  } else if (farmValues.affectedArea >= 20) {
    riskScore += 1;
  }

  if (farmValues.urgency === "today") {
    riskScore += 1;
  }

  const riskLabel = calculateRiskLabel(riskScore);
  const urgencyLabel = calculateUrgencyLabel(riskScore, farmValues.urgency);
  const moistureSignal =
    farmValues.soilMoisture < crop.droughtThreshold - 8
      ? "Dry stress"
      : farmValues.soilMoisture > crop.droughtThreshold + 10
        ? "Moisture heavy"
        : "Balanced";

  let weatherPressureLine = "Weather pressure looks manageable today, so field scouting will tell us more.";

  if (workingHumidity >= 82 || rainChance >= 65) {
    weatherPressureLine = "Humidity and likely leaf wetness can increase the chance of disease spread.";
  } else if (workingTemp >= 35) {
    weatherPressureLine = "Strong heat can make plants look worse by afternoon, so check them early in the day.";
  }

  const areaLine =
    farmValues.affectedArea >= 30
      ? "A larger part of the field is affected, so compare the worst block with a healthy block before wider action."
      : "This still looks patch-based, so confirm the cause in one weak area before treating the whole field.";

  const likelyCause =
    farmValues.symptom === "none"
      ? `${crop.focus} ${weatherPressureLine}`
      : `${problem.cause} ${weatherPressureLine} ${areaLine}`;

  let todayAction = problem.action;

  if (farmValues.urgency === "today") {
    todayAction = `Start in the first half of the day. ${problem.action}`;
  }

  if (farmValues.affectedArea >= 30) {
    todayAction += " Work from the worst patch outward instead of acting on every acre at once.";
  }

  if (farmValues.goal === "harvest-quality") {
    todayAction += " Avoid rough handling or sudden moisture swings close to picking.";
  }

  const summaryParts = [];

  if (farmValues.farmerName) {
    summaryParts.push(`${farmValues.farmerName}, your ${crop.name} field`);
  } else {
    summaryParts.push(`Your ${crop.name} field`);
  }

  summaryParts.push(farmValues.location ? `in ${farmValues.location}` : "in the current location");
  summaryParts.push(`is at the ${labelFromKey(farmValues.stage)} stage.`);
  summaryParts.push(`The main concern is ${problem.label.toLowerCase()}.`);
  summaryParts.push(weatherPressureLine);
  summaryParts.push(buildGoalLine(farmValues.goal));

  const shouldEscalate =
    riskScore >= 6 ||
    farmValues.affectedArea >= 45 ||
    (farmValues.symptom === "spots" && (workingHumidity >= 82 || rainChance >= 65));

  const expertLine = shouldEscalate
    ? "This looks serious enough to involve a local agriculture officer, agronomist, or trusted extension worker today, especially if the patch is spreading fast."
    : "If the issue spreads to new growth, crosses into more patches, or does not improve in 2 to 3 days, contact a local agriculture officer or agronomist.";

  const checklist = [
    crop.stages[farmValues.stage],
    problem.action,
    farmValues.affectedArea >= 30
      ? "Mark the edge of the affected area and compare it again tomorrow morning."
      : "Compare one weak patch with one healthy patch before you spend more money.",
    buildGoalLine(farmValues.goal),
    rainChance >= 60
      ? "Avoid spraying or irrigation just before a wet spell unless a local expert confirms it is necessary."
      : workingTemp >= 35
        ? "Scout in the morning or evening because midday heat can exaggerate symptoms."
        : "Use the next dry window for scouting and targeted correction work."
  ];

  return {
    cropName: crop.name,
    problemLabel: problem.label,
    summary: summaryParts.join(" "),
    likelyCause,
    todayAction,
    waterLine: buildWaterLine(farmValues, crop, workingRain, rainChance, liters),
    budgetLine: buildBudgetLine(problem, farmValues.budget, farmValues.affectedArea),
    expertLine,
    checklist,
    moistureSignal,
    urgencyLabel,
    riskLabel
  };
}

function renderAdvisory() {
  const farmValues = getFarmValues();
  const advisory = buildAdvisory(farmValues);

  dom.summaryHeadline.textContent = `${advisory.urgencyLabel} solution for ${advisory.cropName}`;
  dom.summaryTag.textContent = `${labelFromKey(farmValues.stage)} stage`;
  dom.summaryParagraph.textContent = advisory.summary;
  dom.issuePriority.textContent = advisory.likelyCause;
  dom.todayPriority.textContent = advisory.todayAction;
  dom.waterPriority.textContent = advisory.waterLine;
  dom.budgetPriority.textContent = advisory.budgetLine;
  dom.expertPriority.textContent = advisory.expertLine;

  dom.checklistList.innerHTML = "";
  advisory.checklist.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    dom.checklistList.append(listItem);
  });

  dom.liveSignalCrop.textContent = advisory.cropName;
  dom.liveSignalProblem.textContent = advisory.problemLabel;
  dom.liveSignalUrgency.textContent = advisory.urgencyLabel;
  dom.liveSignalWater.textContent = advisory.moistureSignal;

  renderCropLibrary(farmValues.crop);
  renderProblemLibrary(farmValues.symptom);
  renderCaseMeta(advisory);
  mergeStoredState({
    farmValues,
    savedCases: state.savedCases,
    currentCaseMeta: state.currentCaseMeta
  });
}

function renderCaseMeta(advisory = buildAdvisory(getFarmValues())) {
  const meta = ensureCurrentCaseMeta();
  const lifecycle = getCaseLifecycle(advisory);

  dom.caseIdLabel.textContent = meta.id;
  dom.caseStageLabel.textContent = meta.isSaved ? lifecycle : `Draft - ${lifecycle}`;
  dom.caseUpdatedLabel.textContent = formatTimestamp(meta.updatedAt);
  dom.caseStatusText.textContent = meta.isSaved
    ? "This case is saved locally. You can reopen it later, update it, or download a field report."
    : "This draft stays on this device. Save it to reopen the field record later.";
}

function renderCaseList() {
  renderCounts();

  if (!state.savedCases.length) {
    dom.caseList.innerHTML = `
      <article class="empty-state">
        <strong>No saved cases yet.</strong>
        <p>Save the current field record to start building your local farmer case history.</p>
      </article>
    `;
    return;
  }

  dom.caseList.innerHTML = "";

  state.savedCases.forEach((caseRecord) => {
    const article = document.createElement("article");
    article.className = "saved-case-card";
    const status = document.createElement("span");
    status.textContent = caseRecord.status;

    const title = document.createElement("strong");
    title.textContent = `${caseRecord.farmerName} - ${caseRecord.cropName}`;

    const meta = document.createElement("p");
    meta.textContent = `${caseRecord.location} • ${formatTimestamp(caseRecord.updatedAt)}`;

    const summary = document.createElement("small");
    summary.textContent = caseRecord.summary;

    const actions = document.createElement("div");
    actions.className = "case-card-actions";

    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "secondary-button";
    loadButton.dataset.caseAction = "load";
    loadButton.dataset.caseId = caseRecord.id;
    loadButton.textContent = "Load";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "secondary-button";
    deleteButton.dataset.caseAction = "delete";
    deleteButton.dataset.caseId = caseRecord.id;
    deleteButton.textContent = "Delete";

    actions.append(loadButton, deleteButton);
    article.append(status, title, meta, summary, actions);
    dom.caseList.append(article);
  });
}

function saveCurrentCase() {
  const record = buildCurrentCaseRecord();
  const updatedAt = new Date().toISOString();

  state.currentCaseMeta = createCaseMeta({
    id: record.id,
    createdAt: record.createdAt,
    updatedAt,
    isSaved: true
  });

  const savedRecord = {
    ...record,
    updatedAt,
    isSaved: true
  };

  state.savedCases = [savedRecord, ...state.savedCases.filter((item) => item.id !== savedRecord.id)]
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
    .slice(0, 10);

  mergeStoredState({
    farmValues: getFarmValues(),
    savedCases: state.savedCases,
    currentCaseMeta: state.currentCaseMeta
  });

  renderCaseMeta();
  renderCaseList();
}

function downloadCurrentReport() {
  const caseRecord = buildCurrentCaseRecord();
  const report = buildReportText(caseRecord);
  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeFarmer = (caseRecord.farmerName || "farmer").replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  link.href = url;
  link.download = `${caseRecord.id}-${safeFarmer}-report.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function loadSavedCase(caseId) {
  const caseRecord = state.savedCases.find((item) => item.id === caseId);

  if (!caseRecord) {
    return;
  }

  state.currentCaseMeta = createCaseMeta({
    id: caseRecord.id,
    createdAt: caseRecord.createdAt,
    updatedAt: caseRecord.updatedAt,
    isSaved: true
  });
  state.previousResponseId = null;
  setFarmValues(caseRecord.farmValues);
  setPhotoState(null, "", { skipRenderMeta: true });
  dom.copilotQuestion.value = caseRecord.questionDraft || "";
  renderAdvisory();
  renderIrrigation();
  loadWeather(caseRecord.weatherLocation || caseRecord.location || dom.weatherLocationInput.value, {
    markDirty: false
  });
}

function deleteSavedCase(caseId) {
  state.savedCases = state.savedCases.filter((item) => item.id !== caseId);

  if (state.currentCaseMeta?.id === caseId) {
    state.currentCaseMeta = createCaseMeta({
      id: state.currentCaseMeta.id,
      createdAt: state.currentCaseMeta.createdAt,
      updatedAt: new Date().toISOString(),
      isSaved: false
    });
    renderCaseMeta();
  }

  mergeStoredState({
    farmValues: getFarmValues(),
    savedCases: state.savedCases,
    currentCaseMeta: state.currentCaseMeta
  });

  renderCaseList();
}

function createNewCase() {
  state.previousResponseId = null;
  state.currentCaseMeta = createCaseMeta();
  setFarmValues(getDefaultFarmValues());
  setPhotoState(null, "", { skipRenderMeta: true });
  dom.copilotQuestion.value = "";
  renderAdvisory();
  renderIrrigation();
  loadWeather(dom.weatherLocationInput.value || getDefaultFarmValues().location, {
    markDirty: false
  });
}

function renderIrrigation() {
  const data = new FormData(dom.irrigationForm);
  const cropKey = data.get("crop");
  const acres = Number(data.get("acres"));
  const pumpRate = Number(data.get("pumpRate"));
  const soilMoisture = Number(data.get("soilMoisture"));
  const crop = seed.crops[cropKey];
  const moistureGap = Math.max(crop.droughtThreshold - soilMoisture, 0);
  const irrigationMm = Math.max(crop.waterNeedMm + moistureGap * 0.14, 1.3);
  const liters = litersFromMillimeters(irrigationMm, acres);
  const minutes = liters / Math.max(pumpRate, 1);

  dom.irrigationVolume.textContent = `Recommended volume: ${formatLiters(liters)}`;
  dom.irrigationDuration.textContent = `Estimated pump time: ${formatMinutes(minutes)} at ${pumpRate} L/min.`;
}

function renderConfig(config) {
  state.config = config;
  const isInstalled = isStandaloneExperience();

  dom.configBadge.textContent = isInstalled ? "App mode" : "Install ready";
  dom.configBadge.classList.remove("ready");
  dom.configText.textContent =
    isInstalled
      ? "This app is running in a mobile-friendly shell with local crop logic, live weather, camera support, and saved farmer cases."
      : "This MVP runs fully in local mode with crop logic, live weather, case saving, camera reference, and voice input. It is ready for browser install, Android wrapping, and iOS wrapping from the same codebase.";
  renderPhotoState();
}

async function fetchWeatherSnapshot(locationQuery) {
  const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocodeUrl.searchParams.set("name", locationQuery);
  geocodeUrl.searchParams.set("count", "1");
  geocodeUrl.searchParams.set("language", "en");
  geocodeUrl.searchParams.set("format", "json");

  const geocodeResponse = await fetch(geocodeUrl);
  const geocodeData = await geocodeResponse.json();

  if (!geocodeResponse.ok) {
    throw new Error(geocodeData.reason || "Unable to resolve that location.");
  }

  const place = geocodeData.results?.[0];

  if (!place) {
    throw new Error("No matching farm location was found.");
  }

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(place.latitude));
  forecastUrl.searchParams.set("longitude", String(place.longitude));
  forecastUrl.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "wind_speed_10m",
      "soil_moisture_0_to_1cm"
    ].join(",")
  );
  forecastUrl.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "et0_fao_evapotranspiration"
    ].join(",")
  );
  forecastUrl.searchParams.set("forecast_days", "3");
  forecastUrl.searchParams.set("timezone", "auto");

  const forecastResponse = await fetch(forecastUrl);
  const forecastData = await forecastResponse.json();

  if (!forecastResponse.ok) {
    throw new Error(forecastData.reason || "Unable to load forecast data.");
  }

  const current = forecastData.current || {};
  const daily = forecastData.daily || {};
  const forecast = (daily.time || []).map((date, index) => ({
    date,
    maxTempC: daily.temperature_2m_max?.[index],
    minTempC: daily.temperature_2m_min?.[index],
    precipitationMm: daily.precipitation_sum?.[index],
    rainChancePercent: daily.precipitation_probability_max?.[index],
    et0Mm: daily.et0_fao_evapotranspiration?.[index]
  }));

  const locationName = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
  const today = forecast[0] || {};

  return {
    query: locationQuery,
    locationName,
    coordinates: {
      latitude: place.latitude,
      longitude: place.longitude
    },
    timezone: forecastData.timezone,
    current: {
      temperatureC: current.temperature_2m,
      humidityPercent: current.relative_humidity_2m,
      precipitationMm: current.precipitation,
      windSpeedKph: current.wind_speed_10m,
      surfaceSoilMoisturePercent: Number.isFinite(current.soil_moisture_0_to_1cm)
        ? current.soil_moisture_0_to_1cm * 100
        : null
    },
    forecast,
    summary: `${locationName} is currently ${formatNumber(current.temperature_2m)} deg C with ${formatNumber(
      current.relative_humidity_2m,
      0
    )}% humidity. Today shows ${formatNumber(today.rainChancePercent, 0)}% rain chance and ${formatNumber(
      today.et0Mm
    )} mm ET0.`
  };
}

function renderWeatherLoading(location) {
  dom.weatherLocationLabel.textContent = `Loading ${location}...`;
  dom.weatherSummaryText.textContent = "Fetching current conditions and a short forecast.";
  dom.weatherCurrentTemp.textContent = "--";
  dom.weatherHumidity.textContent = "--";
  dom.weatherRainChance.textContent = "--";
  dom.weatherEt0.textContent = "--";
  dom.weatherSoil.textContent = "--";
  dom.forecastCards.innerHTML = "";
}

function renderWeather(weather, options = {}) {
  const { markDirty: shouldMarkDirty = true } = options;
  state.weather = weather;
  const today = weather.forecast?.[0] || {};

  dom.weatherLocationLabel.textContent = weather.locationName;
  dom.weatherSummaryText.textContent = weather.summary;
  dom.weatherCurrentTemp.textContent = `${formatNumber(weather.current.temperatureC)} deg C`;
  dom.weatherHumidity.textContent = `${formatNumber(weather.current.humidityPercent, 0)}%`;
  dom.weatherRainChance.textContent = `${formatNumber(today.rainChancePercent, 0)}%`;
  dom.weatherEt0.textContent = `${formatNumber(today.et0Mm)} mm`;
  dom.weatherSoil.textContent = Number.isFinite(weather.current.surfaceSoilMoisturePercent)
    ? `${formatNumber(weather.current.surfaceSoilMoisturePercent)}%`
    : "--";

  dom.forecastCards.innerHTML = "";
  weather.forecast.forEach((day) => {
    const card = document.createElement("article");
    card.className = "forecast-card";
    card.innerHTML = `
      <span>${formatShortDate(day.date)}</span>
      <strong>${formatNumber(day.maxTempC)} / ${formatNumber(day.minTempC)} deg C</strong>
      <p>${formatNumber(day.rainChancePercent, 0)}% rain chance</p>
      <small>${formatNumber(day.precipitationMm)} mm rain, ET0 ${formatNumber(day.et0Mm)} mm</small>
    `;
    dom.forecastCards.append(card);
  });

  mergeStoredState({
    weatherLocation: dom.weatherLocationInput.value.trim()
  });

  if (shouldMarkDirty) {
    markCaseDirty();
  }

  renderAdvisory();
}

function renderWeatherError(message, options = {}) {
  const { markDirty: shouldMarkDirty = true } = options;
  state.weather = null;
  dom.weatherLocationLabel.textContent = "Weather unavailable";
  dom.weatherSummaryText.textContent = message;
  dom.weatherCurrentTemp.textContent = "--";
  dom.weatherHumidity.textContent = "--";
  dom.weatherRainChance.textContent = "--";
  dom.weatherEt0.textContent = "--";
  dom.weatherSoil.textContent = "--";
  dom.forecastCards.innerHTML = "";

  if (shouldMarkDirty) {
    markCaseDirty();
  }

  renderAdvisory();
}

function renderCropLibrary(activeCropKey) {
  dom.cropLibrary.innerHTML = "";

  cropKeys.forEach((cropKey) => {
    const crop = seed.crops[cropKey];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `library-card ${cropKey === activeCropKey ? "active" : ""}`;
    button.dataset.cropKey = cropKey;
    button.innerHTML = `
      <span>${crop.name}</span>
      <strong>${crop.waterNeedMm.toFixed(1)} mm/day</strong>
      <p>${crop.focus}</p>
      <small>${crop.valueGoal}</small>
    `;
    dom.cropLibrary.append(button);
  });
}

function renderProblemLibrary(activeProblemKey) {
  dom.problemLibrary.innerHTML = "";

  problemKeys.forEach((problemKey) => {
    const problem = seed.problems[problemKey];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `library-card ${problemKey === activeProblemKey ? "active" : ""}`;
    button.dataset.problemKey = problemKey;
    button.innerHTML = `
      <span>${problem.label}</span>
      <strong>${problem.urgency}</strong>
      <p>${problem.cause}</p>
      <small>${problem.lowCost}</small>
    `;
    dom.problemLibrary.append(button);
  });
}

function createMessage(role, text) {
  const article = document.createElement("article");
  article.className = `message ${role}`;

  const label = document.createElement("span");
  label.textContent = role === "user" ? getFarmValues().farmerName || "Farmer" : "Kisan Mitra Guide";

  const body = document.createElement("p");
  body.textContent = text;

  article.append(label, body);
  dom.chatThread.append(article);
  dom.chatThread.scrollTop = dom.chatThread.scrollHeight;
  return article;
}

function buildOfflineReply(question) {
  const farmValues = getFarmValues();
  const advisory = buildAdvisory(farmValues);
  const weather = state.weather;
  const photoLine = state.attachedPhotoDataUrl
    ? "A crop photo is attached for local reference. Use it to compare visible damage with the problem library and your field notes."
    : "";
  const weatherLine = weather
    ? `Weather summary: ${weather.summary}`
    : "No live weather is loaded, so this answer uses only the crop and field details from the form.";
  const languageNote =
    farmValues.language === "English"
      ? ""
      : `Preferred language is ${farmValues.language}. Local guidance currently appears in English, but voice input still follows the selected language.`;

  return [
    "Farmer Situation",
    advisory.summary,
    "",
    "Likely Causes",
    advisory.likelyCause,
    "",
    "What To Do Today",
    advisory.todayAction,
    advisory.checklist[0],
    advisory.checklist[1],
    "",
    "Water And Weather Plan",
    advisory.waterLine,
    weatherLine,
    "",
    "Low-Cost Option",
    advisory.budgetLine,
    "",
    "When To Get Expert Help",
    advisory.expertLine,
    photoLine,
    languageNote,
    "",
    `Question context: ${question}`
  ]
    .filter(Boolean)
    .join("\n");
}

function collectFarmSnapshot() {
  const farmValues = getFarmValues();
  const advisory = buildAdvisory(farmValues);

  return {
    farmer: {
      name: farmValues.farmerName || "Unknown farmer",
      location: farmValues.location || "Unknown location",
      language: farmValues.language,
      goal: farmValues.goal,
      urgency: farmValues.urgency,
      budget: farmValues.budget
    },
    field: {
      crop: farmValues.crop,
      stage: farmValues.stage,
      acres: farmValues.acres,
      irrigationSource: farmValues.irrigationSource,
      affectedAreaPercent: farmValues.affectedArea,
      soilMoisturePercent: farmValues.soilMoisture,
      canopyTempC: farmValues.canopyTemp,
      rainForecastMm: farmValues.rainForecast
    },
    cropProfile: seed.crops[farmValues.crop],
    problemProfile: seed.problems[farmValues.symptom],
    visualContext: {
      photoAttached: Boolean(state.attachedPhotoDataUrl),
      photoName: state.attachedPhotoName || null
    },
    advisory,
    irrigation: {
      volume: dom.irrigationVolume.textContent,
      duration: dom.irrigationDuration.textContent
    }
  };
}

async function fetchConfig() {
  renderConfig({
    assistantMode: "local-only",
    openAiConfigured: false,
    model: null
  });
}

async function loadWeather(location, options = {}) {
  const { markDirty: shouldMarkDirty = true } = options;
  const cleanLocation = location.trim();

  if (!cleanLocation) {
    renderWeatherError("Enter a village, city, or district to load weather.", {
      markDirty: shouldMarkDirty
    });
    return;
  }

  renderWeatherLoading(cleanLocation);

  try {
    const weather = await fetchWeatherSnapshot(cleanLocation);
    renderWeather(weather, {
      markDirty: shouldMarkDirty
    });
  } catch (error) {
    renderWeatherError(error.message || "Unable to load weather right now.", {
      markDirty: shouldMarkDirty
    });
  }
}

async function submitQuestion(question) {
  createMessage("user", question);
  createMessage("assistant", buildOfflineReply(question));
}

function initializeForms() {
  populateCropSelect(dom.cropSelect);
  populateCropSelect(dom.irrigationCropSelect);
  populateProblemSelect(dom.symptomSelect);
}

function initializeState() {
  const stored = readStoredState();
  const initialFarm = stored.farmValues || getDefaultFarmValues();
  state.savedCases = Array.isArray(stored.savedCases) ? stored.savedCases : [];
  state.currentCaseMeta = createCaseMeta(stored.currentCaseMeta || {});

  setFarmValues(initialFarm);
  renderAdvisory();
  renderIrrigation();
  renderCropLibrary(initialFarm.crop);
  renderProblemLibrary(initialFarm.symptom);
  renderPhotoState();
  renderCaseList();

  const weatherLocation = stored.weatherLocation || initialFarm.location || "Hyderabad";
  dom.weatherLocationInput.value = weatherLocation;
  loadWeather(weatherLocation, {
    markDirty: false
  });
}

function renderAppLink() {
  if (isNativePlatform()) {
    dom.appUrlLink.href = publishedWebUrl;
    dom.appUrlLink.textContent = publishedWebUrl;
    return;
  }

  const url = new URL(window.location.href);

  url.hash = "";
  url.search = "";

  if (!url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/[^/]+$/, "");
  }

  dom.appUrlLink.href = url;
  dom.appUrlLink.textContent = url.toString();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      return;
    });
  });
}

dom.farmForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nextValues = getFarmValues();
  state.previousResponseId = null;
  markCaseDirty();
  setFarmValues(nextValues);
  renderAdvisory();
  renderIrrigation();
});

dom.irrigationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderIrrigation();
});

dom.weatherForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadWeather(dom.weatherLocationInput.value);
});

dom.photoInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  await handlePhotoSelection(file);
});

dom.clearPhotoButton.addEventListener("click", () => {
  dom.photoInput.value = "";
  markCaseDirty();
  setPhotoState(null, "", {
    skipRenderMeta: true
  });
  renderCaseMeta();
});

dom.saveCaseButton.addEventListener("click", () => {
  saveCurrentCase();
});

dom.downloadReportButton.addEventListener("click", () => {
  downloadCurrentReport();
});

dom.newCaseButton.addEventListener("click", () => {
  createNewCase();
});

dom.voiceToggleButton.addEventListener("click", () => {
  toggleVoiceRecognition();
});

dom.clearQuestionButton.addEventListener("click", () => {
  dom.copilotQuestion.value = "";
  dom.copilotQuestion.focus();
});

dom.copilotForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = dom.copilotQuestion.value.trim();

  if (!question) {
    return;
  }

  dom.copilotQuestion.value = "";
  await submitQuestion(question);
});

dom.scenarioChips.addEventListener("click", (event) => {
  const scenarioId = event.target.dataset.scenarioId;

  if (!scenarioId) {
    return;
  }

  const scenario = seed.scenarios.find((item) => item.id === scenarioId);

  if (!scenario) {
    return;
  }

  state.previousResponseId = null;
  markCaseDirty();
  setFarmValues(scenario.values);
  renderAdvisory();
  renderIrrigation();
  loadWeather(scenario.values.location || dom.weatherLocationInput.value);
});

dom.promptChips.addEventListener("click", (event) => {
  const prompt = event.target.dataset.prompt;

  if (!prompt) {
    return;
  }

  dom.copilotQuestion.value = prompt;
  dom.copilotQuestion.focus();
});

dom.farmForm.elements.language.addEventListener("change", () => {
  if (!state.isListening) {
    renderVoiceState(`Mic is ready. Tap and speak in ${getFarmValues().language}.`);
  }
});

dom.cropLibrary.addEventListener("click", (event) => {
  const cropCard = event.target.closest("[data-crop-key]");

  if (!cropCard) {
    return;
  }

  const current = getFarmValues();
  state.previousResponseId = null;
  markCaseDirty();
  setFarmValues({
    ...current,
    crop: cropCard.dataset.cropKey
  });
  renderAdvisory();
  renderIrrigation();
});

dom.problemLibrary.addEventListener("click", (event) => {
  const problemCard = event.target.closest("[data-problem-key]");

  if (!problemCard) {
    return;
  }

  const current = getFarmValues();
  state.previousResponseId = null;
  markCaseDirty();
  setFarmValues({
    ...current,
    symptom: problemCard.dataset.problemKey
  });
  renderAdvisory();
});

dom.caseList.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-case-action]");

  if (!actionButton) {
    return;
  }

  const { caseAction, caseId } = actionButton.dataset;

  if (caseAction === "load") {
    loadSavedCase(caseId);
    return;
  }

  if (caseAction === "delete") {
    deleteSavedCase(caseId);
  }
});

renderCounts();
renderScenarioChips();
renderPromptChips();
initializeForms();
initializeVoiceRecognition();
initializeState();
renderAppLink();
registerServiceWorker();
fetchConfig();
