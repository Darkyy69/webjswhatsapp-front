import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { Button } from "@/components/ui/button"
import { Save } from 'lucide-react'
import JSZip from 'jszip'
import { toast } from "@/hooks/use-toast"

export default function ExportCSV() {
  const sections = useSelector((state: RootState) => state.forms.sections)

  const generateCSV = (form) => {
    const csvContent = [
      ['input', 'output', 'text_fr', 'price'],
      [
        form.mainQuestion.input,
        '',  // Always empty string for main question
        form.mainQuestion.text_fr,
        ''  // No price for main question
      ],
      ...form.questions.map((question) => [
        question.input,
        question.linkedForm || form.globalLink || '',
        question.text_fr,
        question.price || ''
      ])
    ].map(row => row.join(',')).join('\n')

    return csvContent
  }

  const validateForms = () => {
    let isValid = true;
    let companyName = '';

    for (const section of sections) {
      for (const form of section.forms) {
        if (form.type === 'accueil' && !form.companyName) {
          isValid = false;
          toast({
            title: "Erreur de validation",
            description: "Le nom de l'entreprise est requis dans le formulaire d'accueil.",
            variant: "destructive",
          });
        }
        if (form.type === 'accueil') {
          companyName = form.companyName;
        }
        if (!form.mainQuestion.text_fr) {
          isValid = false;
          toast({
            title: "Erreur de validation",
            description: `La question principale est requise dans le formulaire "${form.name || 'Sans nom'}"`,
            variant: "destructive",
          });
        }
        for (const question of form.questions) {
          if (!question.text_fr) {
            isValid = false;
            toast({
              title: "Erreur de validation",
              description: `Toutes les questions doivent avoir un texte en français dans le formulaire "${form.name || 'Sans nom'}"`,
              variant: "destructive",
            });
          }
        }
      }
    }

    return { isValid, companyName };
  }

  const exportAllCSV = () => {
    const { isValid, companyName } = validateForms();
    if (!isValid) return;

    const zip = new JSZip();
    const folder = zip.folder(companyName || "formulaires_de_commande");

    sections.forEach(section => {
      section.forms.forEach(form => {
        const csvContent = generateCSV(form);
        const fileName = `${(form.name || 'formulaire_sans_nom').toLowerCase().replace(/\s+/g, '_')}.csv`;
        folder.file(fileName, csvContent);
      });
    });

    zip.generateAsync({ type: "blob" }).then(function(content) {
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${companyName || "formulaires_de_commande"}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  return (
    <Button onClick={exportAllCSV}>
      <Save className="mr-2 h-4 w-4" /> Exporter tous les fichiers CSV
    </Button>
  )
}