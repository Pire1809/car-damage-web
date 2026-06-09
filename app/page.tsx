"use client";

import { useMemo, useState } from "react";

const API_BASE_URL = "https://car-damage-api.onrender.com";

type Detection = {
  class_id: number;
  class_name: string;
  confidence: number;
  box: number[];
};

type RepairEstimate = {
  min: number;
  max: number;
  currency: string;
  severity: string;
  summary: string;
  disclaimer: string;
  multipliers?: {
    brand: number;
    vehicle_type: number;
    year: number;
    damage_count: number;
  };
};

type PredictionResult = {
  vehicle?: {
    make: string;
    model: string;
    year: number | null;
    vehicle_type: string;
  };
  detections: Detection[];
  annotated_image_url: string;
  repair_estimate?: RepairEstimate;
};

const VEHICLE_LOVS: Record<string, string[]> = {
  Toyota: [
    "Corolla",
    "Camry",
    "RAV4",
    "Highlander",
    "Tacoma",
    "Tundra",
    "Prius",
    "4Runner",
    "Sienna",
    "C-HR",
  ],
  Honda: [
    "Civic",
    "Accord",
    "CR-V",
    "HR-V",
    "Pilot",
    "Odyssey",
    "Ridgeline",
    "Passport",
  ],
  Nissan: [
    "Sentra",
    "Altima",
    "Maxima",
    "Rogue",
    "Murano",
    "Pathfinder",
    "Frontier",
    "Titan",
    "Kicks",
  ],
  Hyundai: [
    "Elantra",
    "Sonata",
    "Tucson",
    "Santa Fe",
    "Palisade",
    "Kona",
    "Venue",
    "Ioniq 5",
  ],
  Kia: [
    "Forte",
    "K5",
    "Soul",
    "Sportage",
    "Sorento",
    "Telluride",
    "Seltos",
    "EV6",
  ],
  Ford: [
    "F-150",
    "Super Duty",
    "Escape",
    "Explorer",
    "Edge",
    "Bronco",
    "Mustang",
    "Maverick",
    "Ranger",
  ],
  Chevrolet: [
    "Silverado",
    "Malibu",
    "Equinox",
    "Traverse",
    "Tahoe",
    "Suburban",
    "Camaro",
    "Colorado",
    "Trailblazer",
  ],
  Dodge: [
    "Charger",
    "Challenger",
    "Durango",
    "Hornet",
    "Journey",
    "Grand Caravan",
  ],
  Jeep: [
    "Wrangler",
    "Grand Cherokee",
    "Cherokee",
    "Compass",
    "Renegade",
    "Gladiator",
    "Wagoneer",
  ],
  Subaru: [
    "Impreza",
    "Legacy",
    "Outback",
    "Forester",
    "Crosstrek",
    "Ascent",
    "WRX",
  ],
  Volkswagen: [
    "Jetta",
    "Passat",
    "Golf",
    "Tiguan",
    "Atlas",
    "Taos",
    "ID.4",
    "Arteon",
  ],
  Mazda: [
    "Mazda3",
    "Mazda6",
    "CX-3",
    "CX-30",
    "CX-5",
    "CX-50",
    "CX-9",
    "MX-5 Miata",
  ],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  BMW: [
    "2 Series",
    "3 Series",
    "4 Series",
    "5 Series",
    "7 Series",
    "X1",
    "X3",
    "X5",
    "X7",
  ],
  "Mercedes-Benz": [
    "A-Class",
    "C-Class",
    "E-Class",
    "S-Class",
    "GLA",
    "GLC",
    "GLE",
    "GLS",
  ],
  Audi: ["A3", "A4", "A5", "A6", "A8", "Q3", "Q5", "Q7", "Q8", "e-tron"],
  Lexus: ["IS", "ES", "GS", "LS", "UX", "NX", "RX", "GX", "LX"],
  Acura: ["ILX", "Integra", "TLX", "RLX", "RDX", "MDX", "NSX"],
  Infiniti: ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"],
  Volvo: ["S60", "S90", "V60", "XC40", "XC60", "XC90", "C40 Recharge"],
  Porsche: ["911", "718", "Panamera", "Macan", "Cayenne", "Taycan"],
  "Land Rover": [
    "Range Rover",
    "Range Rover Sport",
    "Range Rover Evoque",
    "Discovery",
    "Discovery Sport",
    "Defender",
  ],
};

const YEARS = Array.from({ length: 31 }, (_, index) =>
  String(new Date().getFullYear() - index)
);

export default function Home() {
  const [language, setLanguage] = useState<"en" | "es">("en");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [make, setMake] = useState("");
  const [modelName, setModelName] = useState("");
  const [year, setYear] = useState("");
  const [vehicleType, setVehicleType] = useState("sedan");

  const modelOptions = useMemo(() => {
    if (!make) return [];
    return VEHICLE_LOVS[make] || [];
  }, [make]);

  const hasRepairEstimate = Boolean(result?.repair_estimate);

  const t = {
    en: {
      title: "Detect vehicle damage in seconds.",
      subtitle:
        "Upload a vehicle image and get AI-powered damage detection plus a preliminary repair cost estimate.",
      select: "Select Image",
      analyze: "Analyze Damage",
      analyzing: "Analyzing...",
      report: "Damage Report",
      complete: "Analysis complete",
      summary: "AI Summary",
      severity: "Damage Severity",
      pdf: "Generate PDF Report",
      original: "Original Image",
      result: "AI Detection Result",
      detected: "Detected objects and confidence scores",
      model: "Model",
      detections: "Detections",
      avgConf: "Avg Conf.",
      supported: "Supported damage types",
      selected: "Selected",
      automatedSummary: "Automated inspection summary",
      nav: ["YOLO Detection", "FastAPI", "Repair Estimate"],
      runAnalysis: "Run analysis to see detections",
      badge: "AI-powered vehicle damage inspection",
      vehicleInfo: "Vehicle Information",
      make: "Make",
      vehicleModel: "Model",
      year: "Year",
      vehicleType: "Vehicle Type",
      estimate: "Estimated Repair Cost",
      preliminary: "Preliminary estimate",
      costNote:
        "This estimate is generated from damage type, confidence, vehicle brand, vehicle type, year, and detection count.",
      chooseMake: "Select make",
      chooseModel: "Select model",
      chooseYear: "Select year",
      chooseType: "Select vehicle type",
      minimum: "Minimum",
      maximum: "Maximum",
      pendingEstimate:
        "Repair estimate is not available yet. Make sure the backend was updated and redeployed.",
    },
    es: {
      title: "Detecta daños vehiculares en segundos.",
      subtitle:
        "Sube una imagen del vehículo y obtén detección de daños con IA más un estimado preliminar de reparación.",
      select: "Seleccionar imagen",
      analyze: "Analizar daño",
      analyzing: "Analizando...",
      report: "Reporte de daños",
      complete: "Análisis completo",
      summary: "Resumen de IA",
      severity: "Severidad del daño",
      pdf: "Generar reporte PDF",
      original: "Imagen original",
      result: "Resultado de IA",
      detected: "Objetos detectados y nivel de confianza",
      model: "Modelo",
      detections: "Detecciones",
      avgConf: "Conf. Prom.",
      supported: "Tipos de daño soportados",
      selected: "Seleccionado",
      automatedSummary: "Resumen automático de inspección",
      nav: ["Detección YOLO", "FastAPI", "Estimación de reparación"],
      runAnalysis: "Ejecuta el análisis para ver detecciones",
      badge: "Inspección vehicular impulsada por IA",
      vehicleInfo: "Información del vehículo",
      make: "Marca",
      vehicleModel: "Modelo",
      year: "Año",
      vehicleType: "Tipo de vehículo",
      estimate: "Costo estimado de reparación",
      preliminary: "Estimación preliminar",
      costNote:
        "Este estimado se genera con tipo de daño, confianza, marca, tipo de vehículo, año y número de detecciones.",
      chooseMake: "Selecciona marca",
      chooseModel: "Selecciona modelo",
      chooseYear: "Selecciona año",
      chooseType: "Selecciona tipo de vehículo",
      minimum: "Mínimo",
      maximum: "Máximo",
      pendingEstimate:
        "El estimado de reparación todavía no está disponible. Asegúrate de que el backend fue actualizado y redeployado.",
    },
  };

  const damageLabels = {
    en: {
      dent: "Dent",
      scratch: "Scratch",
      crack: "Crack",
      glass_shatter: "Glass Shatter",
      lamp_broken: "Broken Lamp",
      tire_flat: "Flat Tire",
    },
    es: {
      dent: "Abolladura",
      scratch: "Rayón",
      crack: "Grieta",
      glass_shatter: "Vidrio Quebrado",
      lamp_broken: "Lámpara Rota",
      tire_flat: "Llanta Ponchada",
    },
  };

  const vehicleTypes = [
    { value: "compact", en: "Compact / Economy", es: "Compacto / Económico" },
    { value: "sedan", en: "Sedan", es: "Sedán" },
    { value: "suv", en: "SUV / Crossover", es: "SUV / Crossover" },
    { value: "pickup", en: "Pickup / Truck", es: "Pickup / Camioneta" },
    { value: "luxury", en: "Luxury", es: "Lujo" },
    { value: "ev", en: "EV", es: "Eléctrico" },
    { value: "hybrid", en: "Hybrid", es: "Híbrido" },
    { value: "performance", en: "Performance", es: "Deportivo" },
    { value: "exotic", en: "Exotic", es: "Exótico" },
  ];

  function getDamageLabel(label: string) {
    return (
      damageLabels[language][label as keyof typeof damageLabels["en"]] ||
      label.replace("_", " ")
    );
  }

  function translateSeverity(severity?: string) {
    if (!severity) return "—";
    if (language === "en") return severity;

    const map: Record<string, string> = {
      None: "Ninguna",
      Low: "Baja",
      Moderate: "Moderada",
      High: "Alta",
    };

    return map[severity] || severity;
  }

  function handleMakeChange(value: string) {
    setMake(value);
    setModelName("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setResult(null);
    setImageUrl("");

    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    }
  }

  async function handleUpload() {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("make", make);
      formData.append("model_name", modelName);
      formData.append("year", year);
      formData.append("vehicle_type", vehicleType);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data: PredictionResult = await response.json();

      setResult(data);
      setImageUrl(`${API_BASE_URL}${data.annotated_image_url}`);
    } catch (error) {
      console.error(error);
      alert(
        language === "en"
          ? "Could not analyze the image. Make sure the API is running."
          : "No se pudo analizar la imagen. Asegúrate de que la API esté funcionando."
      );
    } finally {
      setLoading(false);
    }
  }

  function generatePDF() {
    window.print();
  }

  const totalDetections = result?.detections?.length || 0;

  const avgConfidence =
    result && result.detections.length > 0
      ? result.detections.reduce((acc, item) => acc + item.confidence, 0) /
        result.detections.length
      : 0;

  const aiSummary =
    result?.repair_estimate?.summary ||
    (language === "en"
      ? "Upload a vehicle image to generate an AI inspection summary."
      : "Sube una imagen del vehículo para generar un resumen de inspección con IA.");

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#1d4ed8_0,transparent_30%),radial-gradient(circle_at_top_right,#7c3aed_0,transparent_25%)] opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold">
              AI
            </div>
            <span className="text-xl font-semibold">Car Damage AI</span>
          </div>

          <div className="hidden md:flex gap-3 text-sm text-zinc-400">
            <span>{t[language].nav[0]}</span>
            <span>•</span>
            <span>{t[language].nav[1]}</span>
            <span>•</span>
            <span>{t[language].nav[2]}</span>
          </div>

          <button
            onClick={() => setLanguage(language === "en" ? "es" : "en")}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10"
          >
            {language === "en" ? "ES" : "EN"}
          </button>
        </nav>

        <section className="grid lg:grid-cols-2 gap-10 items-center mb-12">
          <div>
            <div className="inline-flex mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
              {t[language].badge}
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              {t[language].title}
            </h1>

            <p className="text-lg text-zinc-400 max-w-xl mb-8">
              {t[language].subtitle}
            </p>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {t[language].vehicleInfo}
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <select
                  value={make}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="">{t[language].chooseMake}</option>
                  {Object.keys(VEHICLE_LOVS).map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>

                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  disabled={!make}
                  className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-40"
                >
                  <option value="">{t[language].chooseModel}</option>
                  {modelOptions.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>

                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="">{t[language].chooseYear}</option>
                  {YEARS.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>

                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="">{t[language].chooseType}</option>
                  {vehicleTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {language === "en" ? type.en : type.es}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="cursor-pointer rounded-2xl bg-white text-black px-6 py-4 font-semibold hover:bg-zinc-200 transition text-center">
                {t[language].select}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="rounded-2xl bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-500 disabled:opacity-40 transition"
              >
                {loading ? t[language].analyzing : t[language].analyze}
              </button>
            </div>

            {file && (
              <p className="mt-4 text-sm text-zinc-500">
                {t[language].selected}:{" "}
                <span className="text-zinc-300">{file.name}</span>
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-black/40 p-5 border border-white/10">
                <p className="text-zinc-500 text-sm">{t[language].model}</p>
                <p className="text-2xl font-bold">A</p>
              </div>

              <div className="rounded-2xl bg-black/40 p-5 border border-white/10">
                <p className="text-zinc-500 text-sm">
                  {t[language].detections}
                </p>
                <p className="text-2xl font-bold">{totalDetections}</p>
              </div>

              <div className="rounded-2xl bg-black/40 p-5 border border-white/10">
                <p className="text-zinc-500 text-sm">{t[language].avgConf}</p>
                <p className="text-2xl font-bold">
                  {avgConfidence ? `${(avgConfidence * 100).toFixed(0)}%` : "—"}
                </p>
              </div>
            </div>

            {hasRepairEstimate && result?.repair_estimate && (
              <div className="mt-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
                <p className="text-sm text-blue-300 mb-2">
                  {t[language].preliminary}
                </p>
                <p className="text-4xl font-bold">
                  ${result.repair_estimate.min.toLocaleString()} - $
                  {result.repair_estimate.max.toLocaleString()}
                </p>
                <p className="text-sm text-zinc-400 mt-2">
                  {result.repair_estimate.currency}
                </p>
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-black/40 border border-white/10 p-5">
              <p className="text-sm text-zinc-500 mb-3">
                {t[language].supported}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "dent",
                  "scratch",
                  "crack",
                  "glass_shatter",
                  "lamp_broken",
                  "tire_flat",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300"
                  >
                    {getDamageLabel(label)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {(previewUrl || imageUrl) && (
          <section className="grid lg:grid-cols-2 gap-8 mb-10">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
              <h2 className="text-xl font-semibold mb-4">
                {t[language].original}
              </h2>

              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Original"
                  className="rounded-2xl w-full object-contain max-h-[650px]"
                />
              )}
            </div>

            <div className="rounded-3xl border border-blue-500/20 bg-zinc-950/80 p-5 shadow-[0_0_60px_rgba(37,99,235,0.15)]">
              <h2 className="text-xl font-semibold mb-4">
                {t[language].result}
              </h2>

              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Processed"
                  className="rounded-2xl w-full object-contain max-h-[650px]"
                />
              ) : (
                <div className="h-[400px] rounded-2xl border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500">
                  {t[language].runAnalysis}
                </div>
              )}
            </div>
          </section>
        )}

        {result && (
          <section className="grid lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <p className="text-sm text-blue-300 mb-2">
                {t[language].summary}
              </p>

              <h3 className="text-2xl font-bold mb-3">
                {t[language].automatedSummary}
              </h3>

              <p className="text-zinc-400 leading-relaxed">{aiSummary}</p>

              {!hasRepairEstimate && (
                <p className="mt-4 text-sm text-yellow-400">
                  {t[language].pendingEstimate}
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <p className="text-sm text-zinc-500 mb-2">
                {t[language].severity}
              </p>

              <div className="text-4xl font-bold mb-4">
                {translateSeverity(result.repair_estimate?.severity)}
              </div>

              <button
                onClick={generatePDF}
                className="mt-6 w-full rounded-2xl bg-white text-black px-5 py-3 font-semibold hover:bg-zinc-200"
              >
                {t[language].pdf}
              </button>
            </div>
          </section>
        )}

        {hasRepairEstimate && result?.repair_estimate && (
          <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{t[language].estimate}</h2>
                <p className="text-zinc-500">{t[language].costNote}</p>
              </div>

              <span className="rounded-full bg-blue-500/10 text-blue-400 px-4 py-2 text-sm">
                {result.repair_estimate.currency}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <p className="text-zinc-500 text-sm">{t[language].minimum}</p>
                <p className="text-3xl font-bold">
                  ${result.repair_estimate.min.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <p className="text-zinc-500 text-sm">{t[language].maximum}</p>
                <p className="text-3xl font-bold">
                  ${result.repair_estimate.max.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <p className="text-zinc-500 text-sm">{t[language].severity}</p>
                <p className="text-3xl font-bold">
                  {translateSeverity(result.repair_estimate.severity)}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mt-5">
              {result.repair_estimate.disclaimer}
            </p>
          </section>
        )}

        {result && (
          <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{t[language].report}</h2>
                <p className="text-zinc-500">{t[language].detected}</p>
              </div>

              <span className="rounded-full bg-green-500/10 text-green-400 px-4 py-2 text-sm">
                {t[language].complete}
              </span>
            </div>

            {result.detections.length === 0 && (
              <p className="text-zinc-400">
                {language === "en"
                  ? "No visible damage was detected."
                  : "No se detectó daño visible."}
              </p>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              {result.detections.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-black/40 border border-white/10 p-5"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="capitalize text-lg font-semibold">
                      {getDamageLabel(item.class_name)}
                    </span>

                    <span className="text-blue-400 font-bold">
                      {(item.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${item.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}