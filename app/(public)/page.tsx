"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  BarChart3,
  Database,
  Download,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

const features = [
  {
    title: "Natural Language Queries",
    description:
      "Ask questions about land use transitions in plain English. AI translates your questions into optimized database queries.",
    icon: MessageSquare,
    color: "text-blue-600",
  },
  {
    title: "Interactive Analytics",
    description:
      "Explore choropleth maps, Sankey diagrams, and scenario comparisons with pre-built visualizations.",
    icon: BarChart3,
    color: "text-green-600",
  },
  {
    title: "Data Explorer",
    description:
      "Write custom SQL queries with an intelligent editor, schema browser, and example templates.",
    icon: Database,
    color: "text-purple-600",
  },
  {
    title: "Data Extraction",
    description:
      "Export filtered datasets in CSV, Excel, JSON, or Parquet formats for your own analysis.",
    icon: Download,
    color: "text-orange-600",
  },
];

const stats = [
  { value: "5.4M+", label: "Transition Records" },
  { value: "3,075", label: "US Counties" },
  { value: "20", label: "Climate Scenarios" },
  { value: "2020-2070", label: "Projection Period" },
];

export default function LandingPage() {
  const router = useRouter();
  const { registerEmail, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await registerEmail(email);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-green-600" />
            <span className="font-semibold">RPA Land Use Analytics</span>
          </div>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 dark:to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
              <GraduationCap className="h-3 w-3 mr-1" />
              Free for Academic Use
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              AI-Powered Land Use Analytics{" "}
              <span className="text-green-600">for Researchers</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Query 50 years of USDA Forest Service land use projections with natural language.
              No programming required. Just ask a question.
            </p>

            {/* Email Capture Form */}
            <Card className="max-w-md mx-auto shadow-lg">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting || authLoading}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting || authLoading || !email}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "..." : "Get Free Access"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="text-left">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <p className="text-xs text-muted-foreground">
                    No password required. Get 50 AI queries per day.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-green-600">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Everything You Need for Land Use Research
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From natural language queries to data exports, our platform provides
            comprehensive tools for analyzing land use projections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* AI Highlight Section */}
      <section className="bg-gradient-to-r from-green-800 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-green-200" />
            <h2 className="text-3xl font-bold mb-4">
              Natural Language to SQL in Seconds
            </h2>
            <p className="text-green-100 text-lg mb-6">
              Ask questions like "What counties in California are projected to have
              the largest increase in urban land by 2070?" and get instant answers
              with the underlying SQL query.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>50 queries/day</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Unlimited exports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>No credit card</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Source Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-green-600" />
              <CardTitle>About the 2020 RPA Assessment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              The Resources Planning Act (RPA) Assessment provides long-term projections
              of land use changes across the United States, prepared by the USDA Forest Service.
            </p>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Land Use Types:</strong> Cropland, Pasture, Forest, Urban, and Rangeland</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Climate Scenarios:</strong> RCP 4.5 and RCP 8.5 paired with SSP 1-5</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Time Periods:</strong> Projections from 2020 to 2070</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Geographic Coverage:</strong> All 3,075 US counties</span>
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Data source: USDA Forest Service, 2020 RPA Assessment
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer CTA */}
      <section className="bg-muted/30 border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to explore?</h2>
          <p className="text-muted-foreground mb-6">
            Enter your email above to get started with free academic access.
          </p>
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>RPA Land Use Analytics</span>
            </div>
            <div>
              Data: USDA Forest Service 2020 RPA Assessment
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
