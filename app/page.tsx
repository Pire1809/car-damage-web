"use client";

import { useState } from "react";

const API_BASE_URL = "https://car-damage-api.onrender.com";

type Detection = {
  class_id: number;
  class_name: string;
  confidence: number;
  box: number[];
};

type PredictionResult = {
  detections: Detection[];
  annotated_image_url: string;
};

export default function Home() {
  const [language, setLanguage] = useState<"en" | "es">("en");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const t = {
    en: {
      title: "Detect vehicle damage in seconds.",
      subtitle:
        "Upload a vehicle image and let your trained YOLO model detect dents, scratches, cracks, broken lamps, shattered glass, and flat tires.",
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
      noDamage: "No visible damage detected.",
      model: "Model",
      detections: "Detections",
      avgConf: "Avg Conf.",
      supported: "Supported damage types",
      selected: "Selected",
      automatedSummary: "Automated inspection summary",
      manualReview: "Manual review is recommended.",
      nav: ["YOLO Detection", "FastAPI", "Computer Vision"],
      runAnalysis: "Run analysis to see detections",
      badge: "AI-powered vehicle damage inspection",
    },
    es: {
      title: "Detecta daños vehiculares en segundos.",
      subtitle:
        "Sube una imagen del vehículo y tu modelo YOLO detectará abolladuras, rayones, grietas, lámparas rotas, vidrios quebrados y llantas ponchadas.",
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
      noDamage: "No se detectó daño visible.",
      model: "Modelo",
      detections: "Detecciones",
      avgConf: "Conf. Prom.",
      supported: "Tipos de daño soportados",
      selected: "Seleccionado",
      automatedSummary: "Resumen automático de inspección",
      manualReview: "Se recomienda revisión manual.",
      nav: ["Detección YOLO", "FastAPI", "Visión Computacional"],
      runAnalysis: "Ejecuta el análisis para ver detecciones",
      badge: "Inspección vehicular impulsada por IA",
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

  function getDamageLabel(label: string) {
    return (
      damageLabels[language][label as keyof typeof damageLabels["en"]] ||
      label.replace("_", " ")
    );
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
          ? "Could not analyze the image. Make sure FastAPI is running."
          : "No se pudo analizar la imagen. Asegúrate de que FastAPI esté corriendo."
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

  const severity =
    totalDetections === 0
      ? language === "en"
        ? "None"
        : "Ninguna"
      : avgConfidence >= 0.8
      ? language === "en"
        ? "High"
        : "Alta"
      : avgConfidence >= 0.6
      ? language === "en"
        ? "Moderate"
        : "Moderada"
      : language === "en"
      ? "Low"
      : "Baja";

  const aiSummary =
    totalDetections === 0
      ? t[language].noDamage
      : language === "en"
      ? `The AI detected ${totalDetections} possible damage area(s). The estimated severity is ${severity.toLowerCase()} with an average confidence of ${(
          avgConfidence * 100
        ).toFixed(1)}%. ${t[language].manualReview}`
      : `La IA detectó ${totalDetections} posible(s) área(s) de daño. La severidad estimada es ${severity.toLowerCase()} con una confianza promedio de ${(
          avgConfidence * 100
        ).toFixed(1)}%. ${t[language].manualReview}`;

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
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <p className="text-sm text-zinc-500 mb-2">
                {t[language].severity}
              </p>

              <div className="text-4xl font-bold mb-4">{severity}</div>

              <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${avgConfidence * 100}%` }}
                />
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