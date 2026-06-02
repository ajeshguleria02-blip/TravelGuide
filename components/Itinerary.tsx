"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, UploadCloud } from "lucide-react";

export default function Itinerary({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [yourCity, setYourCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");

  // Array of documents to upload
  const [documents, setDocuments] = useState<{ id: number; type: string; file: File | null }[]>([
    { id: Date.now(), type: "flight", file: null },
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [itinerary, setItinerary] = useState<any>(null);

  const addDocument = () => {
    setDocuments([...documents, { id: Date.now(), type: "other", file: null }]);
  };

  const removeDocument = (id: number) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const updateDocument = (id: number, field: "type" | "file", value: any) => {
    setDocuments(
      documents.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yourCity || !destinationCity) {
      setError("Please provide your city and destination city");
      return;
    }

    const validDocs = documents.filter((doc) => doc.file !== null);
    if (validDocs.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const token = Cookies.get("token");
    const formData = new FormData();
    formData.append("yourCity", yourCity);
    formData.append("destinationCity", destinationCity);

    validDocs.forEach((doc) => {
      formData.append("files", doc.file!);
      formData.append("document_types", doc.type);
    });

    try {
      const res = await fetch("http://localhost:5000/api/travel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        // Extract and store the itinerary from the response
        const generatedItinerary = data.data?.destination?.travel_itinerary ?? null;
        setItinerary(generatedItinerary);
        // Notify parent to refresh the list
        onCreated?.();
        // Reset form
        setYourCity("");
        setDestinationCity("");
        setDocuments([{ id: Date.now(), type: "flight", file: null }]);
      } else {
        setError(data.message || "Upload failed");
      }
    } catch (err) {
      setError("Network error during upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8 bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg flex flex-col items-center justify-center py-10">
      <CardHeader className="w-full text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold w-full">Plan Your Trip</CardTitle>
        <CardDescription className="text-base">Upload all your travel documents in one place.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setSuccess(false);
            setError("");
          }
        }}>
          <DialogTrigger
            render={
              <Button size="lg" className="w-full text-lg rounded-full font-bold shadow-md hover:shadow-lg transition-all" />
            }
          >
            Create Travel Itinerary
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">New Itinerary</DialogTitle>
              <DialogDescription>
                Enter your travel details and attach as many documents as you need.
              </DialogDescription>
            </DialogHeader>

            {success ? (
              <div className="flex flex-col py-6 space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center justify-center space-y-2 text-green-600 dark:text-green-400">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-inner">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">Successfully created!</p>
                </div>

                {itinerary && (
                  <div className="bg-muted/30 p-6 rounded-xl border space-y-6 text-left">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{itinerary.title || "Your Travel Itinerary"}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{itinerary.summary}</p>
                    </div>

                    <div className="space-y-4">
                      {itinerary.days?.map((day: any, i: number) => (
                        <div key={i} className="space-y-2">
                          <h4 className="font-semibold text-foreground bg-primary/10 px-3 py-1 rounded-md inline-block">
                            Day {day.day} {day.date ? `- ${day.date}` : ""}
                          </h4>
                          <ul className="space-y-2 mt-2">
                            {day.activities?.map((act: any, j: number) => (
                              <li key={j} className="text-sm border-l-2 border-primary/40 pl-3 py-1">
                                <span className="font-medium text-foreground">{act.time}:</span>{" "}
                                <span className="text-muted-foreground">{act.description}</span>
                                {act.type && (
                                  <span className="ml-2 text-[10px] uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                                    {act.type}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {itinerary.tips && itinerary.tips.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-sm mb-2 text-foreground">Travel Tips 💡</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {itinerary.tips.map((tip: string, k: number) => (
                            <li key={k}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <Button variant="outline" onClick={() => {
                  setSuccess(false);
                  setItinerary(null);
                }} className="mt-6 rounded-full px-8">
                  Create Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yourCity">Your City</Label>
                    <Input
                      id="yourCity"
                      placeholder="e.g., New York"
                      value={yourCity}
                      onChange={(e) => setYourCity(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destCity">Destination City</Label>
                    <Input
                      id="destCity"
                      placeholder="e.g., Paris"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Travel Documents</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addDocument} disabled={loading}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Document
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <div key={doc.id} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30 relative group">
                        {documents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocument(doc.id)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm disabled:opacity-50"
                            disabled={loading}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <div className="w-1/3">
                          <Select
                            disabled={loading}
                            value={doc.type}
                            onValueChange={(val) => updateDocument(doc.id, "type", val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flight">Flight ✈️</SelectItem>
                              <SelectItem value="hotel">Hotel 🏨</SelectItem>
                              <SelectItem value="train">Train 🚆</SelectItem>
                              <SelectItem value="other">Other 📄</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-2/3">
                          <Input
                            type="file"
                            className="h-10 cursor-pointer file:cursor-pointer"
                            onChange={(e) => updateDocument(doc.id, "file", e.target.files?.[0] || null)}
                            accept="image/*,.pdf"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                    {loading ? "Uploading..." : "Save Itinerary"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
