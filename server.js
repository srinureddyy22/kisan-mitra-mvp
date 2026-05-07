const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const rootDir = __dirname;
const publicDir = path.join(rootDir, "public");

loadDotEnv(path.join(rootDir, ".env"));

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT) || 4173;
const openAiApiKey = process.env.OPENAI_API_KEY || "";
const openAiModel = process.env.OPENAI_MODEL || "gpt-5-mini";
const assistantMode = "local-only";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      return;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  response.end(text);
}

function parseJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 8_000_000) {
        reject(new Error("Request body too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });

    request.on("error", reject);
  });
}

function formatMetric(value, suffix = "", digits = 1) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return `${value.toFixed(digits)}${suffix}`;
}

async function fetchWeather(locationQuery) {
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
    summary: `${locationName} is currently ${formatMetric(current.temperature_2m, " deg C")} with ${formatMetric(
      current.relative_humidity_2m,
      "%",
      0
    )} humidity. Today shows ${formatMetric(today.rainChancePercent, "%", 0)} rain chance and ${formatMetric(
      today.et0Mm,
      " mm"
    )} ET0.`
  };
}

function createAdvicePrompt(question, farmSnapshot, weatherSnapshot) {
  const preferredLanguage = farmSnapshot?.farmer?.language || "English";

  return [
    `Farmer question: ${question}`,
    `Preferred response language: ${preferredLanguage}`,
    "",
    "Farmer profile and crop situation:",
    JSON.stringify(farmSnapshot, null, 2),
    "",
    "Weather snapshot:",
    weatherSnapshot ? JSON.stringify(weatherSnapshot, null, 2) : "No live weather data loaded.",
    "",
    "Write for a farmer in plain language.",
    "Keep the answer short, practical, and calm.",
    "Respond using these sections:",
    "1. Farmer Situation",
    "2. Likely Causes",
    "3. What To Do Today",
    "4. Water And Weather Plan",
    "5. Low-Cost Option",
    "6. When To Get Expert Help",
    "",
    "Do not provide exact pesticide, herbicide, or fertilizer dosage instructions.",
    "If the issue looks serious or uncertain, say so clearly and advise getting local expert help."
  ].join("\n");
}

function sanitizePhotoDataUrl(photoDataUrl) {
  if (!photoDataUrl) {
    return null;
  }

  const cleanValue = String(photoDataUrl).trim();

  if (!cleanValue.startsWith("data:image/") || !cleanValue.includes(";base64,")) {
    throw new Error("Photo format is invalid. Please retake the image.");
  }

  if (cleanValue.length > 7_000_000) {
    throw new Error("Photo is too large. Please retake it with a smaller image.");
  }

  return cleanValue;
}

function createAdviceInput(question, farmSnapshot, weatherSnapshot, photoDataUrl) {
  const content = [
    {
      type: "input_text",
      text: createAdvicePrompt(question, farmSnapshot, weatherSnapshot)
    }
  ];

  if (photoDataUrl) {
    content.push({
      type: "input_text",
      text: "The farmer attached a crop photo. Use it only as supporting context and say clearly if the image is unclear."
    });
    content.push({
      type: "input_image",
      image_url: photoDataUrl
    });
  }

  return [
    {
      role: "user",
      content
    }
  ];
}

function extractOutputText(apiResponse) {
  if (typeof apiResponse.output_text === "string" && apiResponse.output_text.trim()) {
    return apiResponse.output_text.trim();
  }

  const output = Array.isArray(apiResponse.output) ? apiResponse.output : [];
  const parts = [];

  output.forEach((item) => {
    if (item.type === "message" && Array.isArray(item.content)) {
      item.content.forEach((contentItem) => {
        if (contentItem.type === "output_text" && typeof contentItem.text === "string") {
          parts.push(contentItem.text);
        }
      });
    }
  });

  return parts.join("\n\n").trim();
}

async function fetchAiAdvice(question, farmSnapshot, weatherSnapshot, previousResponseId, photoDataUrl) {
  const payload = {
    model: openAiModel,
    instructions: [
      "You are Kisan Mitra AI, a crop-solution assistant for farmers.",
      "Use the farmer details, crop snapshot, and weather data directly.",
      "Prefer simple field actions over technical explanations.",
      "Reply in the farmer's preferred language when it is provided.",
      "Recommend low-cost and low-risk actions first when possible.",
      "Do not provide exact pesticide, herbicide, or fertilizer dosage instructions.",
      "If information is uncertain, incomplete, or severe, say so plainly and advise local expert support."
    ].join(" "),
    input: createAdviceInput(question, farmSnapshot, weatherSnapshot, photoDataUrl)
  };

  if (previousResponseId) {
    payload.previous_response_id = previousResponseId;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI request failed.");
  }

  return {
    id: data.id,
    model: data.model || openAiModel,
    text: extractOutputText(data) || "No advice text was returned."
  };
}

async function serveStatic(requestPath, response) {
  const pathname = requestPath === "/" ? "/index.html" : requestPath;
  const normalized = path.normalize(pathname).replace(/^([/\\])+/, "");
  const filePath = path.join(publicDir, normalized);

  if (!filePath.startsWith(publicDir)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const content = await fsp.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream"
    });
    response.end(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(response, 404, "Not found");
      return;
    }

    sendText(response, 500, "Server error");
  }
}

http
  .createServer(async (request, response) => {
    const requestUrl = new URL(request.url, `http://localhost:${port}`);

    try {
      if (request.method === "GET" && requestUrl.pathname === "/healthz") {
        sendJson(response, 200, {
          ok: true
        });
        return;
      }

      if (request.method === "GET" && requestUrl.pathname === "/api/config") {
        sendJson(response, 200, {
          assistantMode,
          openAiConfigured: false,
          model: null,
          openAiKeyDetected: Boolean(openAiApiKey),
          configuredModel: openAiModel
        });
        return;
      }

      if (request.method === "GET" && requestUrl.pathname === "/api/weather") {
        const location = requestUrl.searchParams.get("location")?.trim();

        if (!location) {
          sendJson(response, 400, {
            error: "Please provide a location."
          });
          return;
        }

        const weather = await fetchWeather(location);
        sendJson(response, 200, weather);
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/advice") {
        sendJson(response, 503, {
          error: "Local-only guidance mode is enabled. This app is currently not sending questions to an external AI service."
        });
        return;
      }

      await serveStatic(requestUrl.pathname, response);
    } catch (error) {
      sendJson(response, 500, {
        error: error.message || "Unexpected server error."
      });
    }
  })
  .listen(port, host, () => {
    console.log(`Kisan Mitra AI is running at http://${host}:${port}`);
  });
