'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Trash2, Link, Save } from 'lucide-react'

type FormField = {
  input: string;
  output: string | null;
  text_ar: string;
  text_fr: string;
  text_en: string;
  shortened_question: string;
}

type Form = {
  id: string;
  name: string;
  fields: FormField[];
}

export function OrderFormManagerComponent() {
  const [forms, setForms] = useState<Form[]>([])
  const [currentForm, setCurrentForm] = useState<Form | null>(null)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkSource, setLinkSource] = useState<{ formId: string, fieldIndex: number } | null>(null)

  const addNewForm = () => {
    const newForm: Form = {
      id: Date.now().toString(),
      name: `New Form ${forms.length + 1}`,
      fields: []
    }
    setForms([...forms, newForm])
    setCurrentForm(newForm)
  }

  const addField = () => {
    if (!currentForm) return
    const newField: FormField = {
      input: (currentForm.fields.length + 1).toString(),
      output: null,
      text_ar: '',
      text_fr: '',
      text_en: '',
      shortened_question: ''
    }
    setCurrentForm({
      ...currentForm,
      fields: [...currentForm.fields, newField]
    })
  }

  const updateField = (index: number, field: Partial<FormField>) => {
    if (!currentForm) return
    const updatedFields = [...currentForm.fields]
    updatedFields[index] = { ...updatedFields[index], ...field }
    setCurrentForm({ ...currentForm, fields: updatedFields })
  }

  const removeField = (index: number) => {
    if (!currentForm) return
    const updatedFields = currentForm.fields.filter((_, i) => i !== index)
    setCurrentForm({ ...currentForm, fields: updatedFields })
  }

  const saveForm = async () => {
    if (!currentForm) return
    // Here you would typically send the form data to your backend
    console.log('Saving form:', currentForm)
    // Update the forms list
    setForms(forms.map(form => form.id === currentForm.id ? currentForm : form))
  }

  const generateCSV = () => {
    if (!currentForm) return
    const csvContent = [
      ['input', 'output', 'text_ar', 'text_fr', 'text_en', 'shortened_question'],
      ...currentForm.fields.map(field => [
        field.input,
        field.output || 'null',
        field.text_ar,
        field.text_fr,
        field.text_en,
        field.shortened_question
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${currentForm.name}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const openLinkModal = (formId: string, fieldIndex: number) => {
    setLinkSource({ formId, fieldIndex })
    setIsLinkModalOpen(true)
  }

  const linkForms = (targetFormId: string) => {
    if (!linkSource || !currentForm) return
    const updatedFields = [...currentForm.fields]
    updatedFields[linkSource.fieldIndex].output = targetFormId
    setCurrentForm({ ...currentForm, fields: updatedFields })
    setIsLinkModalOpen(false)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Restaurant Order Form Manager</h1>
      <div className="flex gap-4">
        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Forms</CardTitle>
              <CardDescription>Manage your order forms</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {forms.map(form => (
                  <li key={form.id} className="flex justify-between items-center">
                    <Button variant="ghost" onClick={() => setCurrentForm(form)}>{form.name}</Button>
                    <Button variant="destructive" size="icon" onClick={() => setForms(forms.filter(f => f.id !== form.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={addNewForm}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Form
              </Button>
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
                    onChange={(e) => setCurrentForm({...currentForm, name: e.target.value})}
                    className="text-2xl font-bold"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentForm.fields.map((field, index) => (
                  <div key={index} className="mb-4 p-4 border rounded">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <Label htmlFor={`input-${index}`}>Input</Label>
                        <Input 
                          id={`input-${index}`}
                          value={field.input} 
                          onChange={(e) => updateField(index, { input: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`output-${index}`}>Output</Label>
                        <div className="flex">
                          <Input 
                            id={`output-${index}`}
                            value={field.output || ''} 
                            onChange={(e) => updateField(index, { output: e.target.value })}
                            className="flex-grow"
                          />
                          <Button variant="outline" size="icon" onClick={() => openLinkModal(currentForm.id, index)} className="ml-2">
                            <Link className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-2">
                      <div>
                        <Label htmlFor={`text_ar-${index}`}>Arabic Text</Label>
                        <Textarea 
                          id={`text_ar-${index}`}
                          value={field.text_ar} 
                          onChange={(e) => updateField(index, { text_ar: e.target.value })}
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`text_fr-${index}`}>French Text</Label>
                        <Textarea 
                          id={`text_fr-${index}`}
                          value={field.text_fr} 
                          onChange={(e) => updateField(index, { text_fr: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`text_en-${index}`}>English Text</Label>
                        <Textarea 
                          id={`text_en-${index}`}
                          value={field.text_en} 
                          onChange={(e) => updateField(index, { text_en: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex-grow mr-2">
                        <Label htmlFor={`shortened_question-${index}`}>Shortened Question</Label>
                        <Input 
                          id={`shortened_question-${index}`}
                          value={field.shortened_question} 
                          onChange={(e) => updateField(index, { shortened_question: e.target.value })}
                        />
                      </div>
                      <Button variant="destructive" size="icon" onClick={() => removeField(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button onClick={addField}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Field
                </Button>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={saveForm}>
                  <Save className="mr-2 h-4 w-4" /> Save Form
                </Button>
                <Button onClick={generateCSV}>Generate CSV</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link to Form</DialogTitle>
            <DialogDescription>
              Select a form to link to this field
            </DialogDescription>
          </DialogHeader>
          <Select onValueChange={(value) => linkForms(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a form" />
            </SelectTrigger>
            <SelectContent>
              {forms.filter(form => form.id !== currentForm?.id).map(form => (
                <SelectItem key={form.id} value={form.id}>{form.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}