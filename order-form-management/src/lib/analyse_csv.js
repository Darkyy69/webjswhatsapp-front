const fetch = require("node-fetch");

async function fetchCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text.split("\n").map((row) => row.split(","));
}

async function analyzeCSV() {
  const csv1 = await fetchCSV(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-N92JVTcYVPeJyFRsO9rNOiYXda3I1X.csv"
  );
  const csv3 = await fetchCSV(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-7PHjhnoodoZOQE8fGNcsmBA1rOXV1d.csv"
  );

  console.log("CSV 1 (Welcome Message):");
  console.log(csv1);

  console.log("\nCSV 3 (Menu Selection):");
  console.log(csv3);
}

analyzeCSV();
