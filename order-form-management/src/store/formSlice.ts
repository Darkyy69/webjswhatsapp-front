import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Question = {
  input: string;
  text_fr: string;
  price?: string;
  linkedForm?: string | null;
  editable: boolean;
  showPrice: boolean;
};

export type Form = {
  id: string;
  name: string;
  type:
    | "accueil"
    | "menu"
    | "personnalise"
    | "nourriture"
    | "supplements"
    | "boissons"
    | "gratins";
  companyName?: string;
  mainQuestion: Question;
  questions: Question[];
  globalLink: string | null;
};

export type FormSection = {
  id: string;
  name: string;
  forms: Form[];
  isDefault: boolean;
};

interface FormsState {
  sections: FormSection[];
  currentSectionId: string | null;
  currentFormId: string | null;
}

const createDefaultQuestion = (
  text_fr: string,
  input: string = "0",
  isMain: boolean = false
): Question => {
  const question: Question = {
    input,
    text_fr,
    editable: true,
    showPrice: false,
  };
  if (!isMain) {
    question.linkedForm = null;
    question.price = "";
  }
  return question;
};

const accueilForm: Form = {
  id: "accueil",
  name: "Message de bienvenue",
  type: "accueil",
  companyName: "",
  mainQuestion: createDefaultQuestion(
    "Bienvenue ! Comment puis-je vous aider ?",
    "0",
    true
  ),
  questions: [
    createDefaultQuestion("Commander maintenant", "1"),
    createDefaultQuestion("Heures d'ouverture", "2"),
    createDefaultQuestion("Notre emplacement", "3"),
  ],
  globalLink: null,
};

const menuForm: Form = {
  id: "menu",
  name: "Menu",
  type: "menu",
  mainQuestion: createDefaultQuestion("Que voulez-vous commander ?", "0", true),
  questions: [
    createDefaultQuestion("Pizza", "1"),
    createDefaultQuestion("Tacos", "2"),
    createDefaultQuestion("Sandwiches", "3"),
  ],
  globalLink: null,
};

const initialState: FormsState = {
  sections: [
    {
      id: "bienvenue",
      name: "Bienvenue",
      forms: [accueilForm],
      isDefault: true,
    },
    {
      id: "menu",
      name: "Menu",
      forms: [menuForm],
      isDefault: true,
    },
    {
      id: "nourriture",
      name: "Nourriture",
      forms: [],
      isDefault: true,
    },
    {
      id: "supplements",
      name: "Suppléments",
      forms: [],
      isDefault: true,
    },
    {
      id: "boissons",
      name: "Boissons",
      forms: [],
      isDefault: true,
    },
    {
      id: "gratins",
      name: "Gratins",
      forms: [],
      isDefault: true,
    },
  ],
  currentSectionId: "bienvenue",
  currentFormId: "accueil",
};

const formsSlice = createSlice({
  name: "forms",
  initialState,
  reducers: {
    addForm: (
      state,
      action: PayloadAction<{ sectionId: string; form: Form }>
    ) => {
      const section = state.sections.find(
        (s) => s.id === action.payload.sectionId
      );
      if (section) {
        section.forms.push(action.payload.form);
        state.currentFormId = action.payload.form.id;
      }
    },
    updateForm: (state, action: PayloadAction<Form>) => {
      const section = state.sections.find((s) =>
        s.forms.some((f) => f.id === action.payload.id)
      );
      if (section) {
        const index = section.forms.findIndex(
          (form) => form.id === action.payload.id
        );
        if (index !== -1) {
          section.forms[index] = action.payload;
        }
      }
    },
    deleteForm: (state, action: PayloadAction<string>) => {
      const section = state.sections.find((s) =>
        s.forms.some((f) => f.id === action.payload)
      );
      if (section) {
        section.forms = section.forms.filter(
          (form) => form.id !== action.payload
        );
        if (state.currentFormId === action.payload) {
          state.currentFormId =
            section.forms.length > 0 ? section.forms[0].id : null;
        }
      }
    },
    setCurrentForm: (state, action: PayloadAction<string | null>) => {
      state.currentFormId = action.payload;
    },
    addSection: (state, action: PayloadAction<FormSection>) => {
      state.sections.push(action.payload);
    },
    updateSection: (state, action: PayloadAction<FormSection>) => {
      const index = state.sections.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.sections[index] = action.payload;
      }
    },
    deleteSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(
        (s) => s.id !== action.payload && !s.isDefault
      );
      if (state.currentSectionId === action.payload) {
        state.currentSectionId =
          state.sections.length > 0 ? state.sections[0].id : null;
      }
    },
    setCurrentSection: (state, action: PayloadAction<string | null>) => {
      state.currentSectionId = action.payload;
    },
    reorderSections: (
      state,
      action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>
    ) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.sections.splice(sourceIndex, 1);
      state.sections.splice(destinationIndex, 0, removed);
    },
  },
});

export const {
  addForm,
  updateForm,
  deleteForm,
  setCurrentForm,
  addSection,
  updateSection,
  deleteSection,
  setCurrentSection,
  reorderSections,
} = formsSlice.actions;

export default formsSlice.reducer;
