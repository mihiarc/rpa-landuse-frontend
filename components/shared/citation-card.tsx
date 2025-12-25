"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Quote, Copy, Download, Check } from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface CitationResponse {
  format: string;
  citation: string;
  apa: string;
  chicago: string;
}

/**
 * Citation card component that displays BibTeX, APA, and Chicago citations.
 * Provides copy-to-clipboard and download functionality.
 */
export function CitationCard() {
  const [copied, setCopied] = useState<string | null>(null);

  const { data: citation, isLoading } = useQuery<CitationResponse>({
    queryKey: ["citation"],
    queryFn: () => apiClient.get("/citation/bibtex"),
  });

  const handleCopy = async (text: string, format: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading || !citation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5 text-green-600" />
            Cite This Dataset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading citation...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="h-5 w-5 text-green-600" />
          Cite This Dataset
        </CardTitle>
        <CardDescription>
          Please cite this dataset when using it in your research.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bibtex" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bibtex">BibTeX</TabsTrigger>
            <TabsTrigger value="apa">APA</TabsTrigger>
            <TabsTrigger value="chicago">Chicago</TabsTrigger>
          </TabsList>

          <TabsContent value="bibtex" className="space-y-3">
            <Textarea
              value={citation.citation}
              readOnly
              className="font-mono text-sm min-h-[150px]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(citation.citation, "bibtex")}
              >
                {copied === "bibtex" ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleDownload(citation.citation, "rpa-landuse.bib")
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Download .bib
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="apa" className="space-y-3">
            <Textarea
              value={citation.apa}
              readOnly
              className="font-mono text-sm min-h-[80px]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(citation.apa, "apa")}
            >
              {copied === "apa" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="chicago" className="space-y-3">
            <Textarea
              value={citation.chicago}
              readOnly
              className="font-mono text-sm min-h-[80px]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(citation.chicago, "chicago")}
            >
              {copied === "chicago" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
