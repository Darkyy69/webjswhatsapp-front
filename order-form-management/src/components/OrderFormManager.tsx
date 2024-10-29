"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  addForm,
  updateForm,
  deleteForm,
  setCurrentForm,
  addSection,
  setCurrentSection,
  Form,
  Question,
  FormSection,
} from "@/store/formSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PlusCircle,
  Trash2,
  Link,
  Save,
  FolderPlus,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function OrderFormManager() {
  const dispatch = useDispatch();
  const sections = useSelector((state: RootState) => state.forms.sections);
  const currentSectionId = useSelector(
    (state: RootState) => state.forms.currentSectionId
  );
  const currentFormId = useSelector(
    (state: RootState) => state.forms.currentFormId
  );

  const currentSection =
    sections.find((section) => section.id === currentSectionId) || null;
  const currentForm =
    currentSection?.forms.find((form) => form.id === currentFormId) || null;

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkSource, setLinkSource] = useState<{ input: string } | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);

  useEffect(() => {
    if (sections.length > 0 && !currentSectionId) {
      dispatch(setCurrentSection(sections[0].id));
    }
    if (currentSection && currentSection.forms.length > 0 && !currentFormId) {
      dispatch(setCurrentForm(currentSection.forms[0].id));
    }
  }, [sections, currentSectionId, currentSection, currentFormId, dispatch]);

  const addNewForm = () => {
    if (!currentSection) return;
    const newForm: Form = {
      id: Date.now().toString(),
      name: "",
      type: "personnalise",
      mainQuestion: {
        input: "0",
        text_ar: "",
        text_fr: "",
        text_en: "",
        editable: true,
      },
      questions: [],
      globalLink: null,
    };
    dispatch(addForm({ sectionId: currentSection.id, form: newForm }));
  };

  const addQuestion = () => {
    if (!currentForm) return;
    const newQuestion: Question = {
      input: (currentForm.questions.length + 1).toString(),
      text_ar: "",
      text_fr: "",
      text_en: "",
      price: "",
      linkedForm: null,
      editable: true,
    };
    dispatch(
      updateForm({
        ...currentForm,
        questions: [...currentForm.questions, newQuestion],
      })
    );
  };

  const updateQuestion = (input: string, updates: Partial<Question>) => {
    if (!currentForm) return;
    if (input === "0") {
      dispatch(
        updateForm({
          ...currentForm,
          mainQuestion: { ...currentForm.mainQuestion, ...updates },
        })
      );
    } else {
      const updatedQuestions = currentForm.questions.map((question) =>
        question.input === input ? { ...question, ...updates } : question
      );
      dispatch(updateForm({ ...currentForm, questions: updatedQuestions }));
    }
  };

  const removeQuestion = (input: string) => {
    if (!currentForm) return;
    const updatedQuestions = currentForm.questions.filter(
      (question) => question.input !== input
    );
    const reindexedQuestions = updatedQuestions.map((question, index) => ({
      ...question,
      input: (index + 1).toString(),
    }));
    dispatch(updateForm({ ...currentForm, questions: reindexedQuestions }));
  };

  const saveForm = () => {
    if (!currentForm) return;
    dispatch(updateForm(currentForm));
  };

  const openLinkModal = (input: string) => {
    setLinkSource({ input });
    setIsLinkModalOpen(true);
  };

  const linkForms = (targetFormId: string) => {
    if (!linkSource || !currentForm) return;
    if (linkSource.input === "global") {
      dispatch(updateForm({ ...currentForm, globalLink: targetFormId }));
    } else if (linkSource.input !== "0") {
      const updatedQuestions = currentForm.questions.map((question) =>
        question.input === linkSource.input
          ? { ...question, linkedForm: targetFormId }
          : question
      );
      dispatch(updateForm({ ...currentForm, questions: updatedQuestions }));
    }
    setIsLinkModalOpen(false);
  };

  const addNewSection = () => {
    if (newSectionName.trim() === "") return;
    const newSection: FormSection = {
      id: Date.now().toString(),
      name: newSectionName.trim(),
      forms: [],
    };
    dispatch(addSection(newSection));
    setNewSectionName("");
    setIsNewSectionModalOpen(false);
  };

  const getLinkedFormName = (formId: string | null) => {
    if (!formId) return "Non lié";
    const linkedForm = sections
      .flatMap((s) => s.forms)
      .find((f) => f.id === formId);
    return linkedForm ? linkedForm.name : "Formulaire inconnu";
  };

  const renderQuestionFields = (question: Question, index: number) => (
    <div key={question.input} className="space-y-4 relative">
      <div className="flex justify-end absolute top-0 right-0">
        {index !== -1 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeQuestion(question.input)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Supprimer la question</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div>
        <Label htmlFor={`text_ar-${question.input}`}>Texte en arabe</Label>
        <Textarea
          id={`text_ar-${question.input}`}
          value={question.text_ar}
          onChange={(e) =>
            updateQuestion(question.input, { text_ar: e.target.value })
          }
          dir="rtl"
        />
      </div>
      <div>
        <Label htmlFor={`text_fr-${question.input}`}>Texte en français</Label>
        <Textarea
          id={`text_fr-${question.input}`}
          value={question.text_fr}
          onChange={(e) =>
            updateQuestion(question.input, { text_fr: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor={`text_en-${question.input}`}>Texte en anglais</Label>
        <Textarea
          id={`text_en-${question.input}`}
          value={question.text_en}
          onChange={(e) =>
            updateQuestion(question.input, { text_en: e.target.value })
          }
        />
      </div>
      {question.input !== "0" && (
        <div>
          <Label htmlFor={`price-${question.input}`}>Prix</Label>
          <Input
            id={`price-${question.input}`}
            value={question.price}
            onChange={(e) =>
              updateQuestion(question.input, { price: e.target.value })
            }
            type="number"
            step="0.01"
          />
        </div>
      )}
      {question.input !== "0" && (
        <div className="flex items-center justify-between">
          <div>
            <Label>Formulaire lié</Label>
            <p>{getLinkedFormName(question.linkedForm)}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => openLinkModal(question.input)}
          >
            <Link className="mr-2 h-4 w-4" /> Lier au formulaire
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        Gestionnaire de formulaires de commande
      </h1>
      <Tabs
        value={currentSectionId || ""}
        onValueChange={(value) => dispatch(setCurrentSection(value))}
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id}>
                {section.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setIsNewSectionModalOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" /> Nouvelle section
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Créer une nouvelle section pour organiser vos formulaires</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <div className="flex gap-4">
              <div className="w-1/3">
                <Card>
                  <CardHeader>
                    <CardTitle>Formulaires</CardTitle>
                    <CardDescription>
                      Gérez vos formulaires de commande
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.forms.map((form) => (
                        <li
                          key={form.id}
                          className="flex justify-between items-center"
                        >
                          <Button
                            variant={
                              form.id === currentFormId ? "default" : "ghost"
                            }
                            onClick={() => dispatch(setCurrentForm(form.id))}
                          >
                            {form.name || "Formulaire sans nom"}
                          </Button>
                          {form.type === "personnalise" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() =>
                                      dispatch(deleteForm(form.id))
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Supprimer ce formulaire</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button onClick={addNewForm}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Nouveau
                            formulaire
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Créer un nouveau formulaire dans cette section</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardFooter>
                </Card>
              </div>
              <div className="w-2/3">
                {currentForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Input
                          value={currentForm.name}
                          onChange={(e) =>
                            dispatch(
                              updateForm({
                                ...currentForm,
                                name: e.target.value,
                              })
                            )
                          }
                          className="text-2xl font-bold"
                          placeholder="Ex: Menu Pizza, Desserts, Boissons"
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentForm.type === "accueil" && (
                        <div className="mb-4">
                          <Label htmlFor="companyName">
                            Nom de l'entreprise
                          </Label>
                          <Input
                            id="companyName"
                            value={currentForm.companyName}
                            onChange={(e) =>
                              dispatch(
                                updateForm({
                                  ...currentForm,
                                  companyName: e.target.value,
                                })
                              )
                            }
                            placeholder="Entrez le nom de votre entreprise"
                          />
                        </div>
                      )}
                      <div className="mb-4">
                        <Label>Lien global</Label>
                        <div className="flex items-center">
                          <p className="flex-grow">
                            {getLinkedFormName(currentForm.globalLink)}
                          </p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  onClick={() => openLinkModal("global")}
                                >
                                  <Link className="mr-2 h-4 w-4" /> Définir le
                                  lien global
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Lier ce formulaire à un autre formulaire pour
                                  toutes les questions
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="main-question">
                          <AccordionTrigger>
                            Question principale
                          </AccordionTrigger>
                          <AccordionContent>
                            {renderQuestionFields(currentForm.mainQuestion, -1)}
                          </AccordionContent>
                        </AccordionItem>
                        {currentForm.questions.map((question, index) => (
                          <AccordionItem
                            key={question.input}
                            value={question.input}
                          >
                            <AccordionTrigger>
                              Question {index + 1}
                            </AccordionTrigger>
                            <AccordionContent>
                              {renderQuestionFields(question, index)}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={addQuestion} className="mt-4">
                              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                              une question
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ajouter une nouvelle question à ce formulaire</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardContent>
                    <CardFooter>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={saveForm}>
                              <Save className="mr-2 h-4 w-4" /> Enregistrer le
                              formulaire
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Sauvegarder les modifications apportées à ce
                              formulaire
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lier au formulaire</DialogTitle>
            <DialogDescription>
              Sélectionnez un formulaire à lier à cette question
            </DialogDescription>
          </DialogHeader>
          <Select onValueChange={(value) => linkForms(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un formulaire" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectGroup key={section.id}>
                  <SelectLabel>{section.name}</SelectLabel>
                  {section.forms
                    .filter((form) => form.id !== currentForm?.id)
                    .map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.name || "Formulaire sans nom"}
                      </SelectItem>
                    ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNewSectionModalOpen}
        onOpenChange={setIsNewSectionModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle section</DialogTitle>
            <DialogDescription>
              Entrez un nom pour la nouvelle section
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Nom de la section"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewSectionModalOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={addNewSection}>Ajouter la section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
