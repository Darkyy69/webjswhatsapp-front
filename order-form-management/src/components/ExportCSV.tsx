import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import JSZip from "jszip";

export default function ExportCSV() {
  const sections = useSelector((state: RootState) => state.forms.sections);

  const generateCSV = (form) => {
    const csvContent = [
      ["input", "output", "text_ar", "text_fr", "text_en", "price"],
      [
        form.mainQuestion.input,
        "", // Always empty string for main question
        form.mainQuestion.text_ar,
        form.mainQuestion.text_fr,
        form.mainQuestion.text_en,
        "", // No price for main question
      ],
      ...form.questions.map((question) => [
        question.input,
        question.linkedForm || form.globalLink || "",
        question.text_ar,
        question.text_fr,
        question.text_en,
        question.price || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    return csvContent;
  };

  const exportAllCSV = () => {
    const zip = new JSZip();

    sections.forEach((section) => {
      section.forms.forEach((form) => {
        const csvContent = generateCSV(form);
        const fileName = `${(form.name || "formulaire_sans_nom")
          .toLowerCase()
          .replace(/\s+/g, "_")}.csv`;
        zip.file(fileName, csvContent);
      });
    });

    zip.generateAsync({ type: "blob" }).then(function (content) {
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "formulaires_de_commande.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <Button onClick={exportAllCSV}>
      <Save className="mr-2 h-4 w-4" /> Exporter tous les fichiers CSV
    </Button>
  );
}
