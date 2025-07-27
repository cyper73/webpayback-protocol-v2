import { useQuery } from "@tanstack/react-query";
import { ContentCertificateManager } from "@/components/content-certificate/ContentCertificateManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";

export function ContentCertificatePage() {
  const { data: user } = useQuery<{ id: number; username: string } | null>({
    queryKey: ['/api/user'],
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the Content Certificate system
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // For demo purposes, using user ID as creator ID
  // In production, you'd fetch the actual creator ID from the creators table
  const creatorId = user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Anti-AI Scraping Protection</h1>
              <p className="text-muted-foreground text-lg">
                Protect your content against Google AI Overview and earn WPT rewards
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                    Google AI Overview Impact
                  </h4>
                  <div className="text-sm text-amber-700 dark:text-amber-200 mt-2">
                    <p className="mb-2">
                      <strong>Traffic Loss:</strong> Creators are experiencing 15-40% traffic drops due to Google AI Overview scraping content without compensation.
                    </p>
                    <p className="mb-2">
                      <strong>No API Access:</strong> Google doesn't provide APIs to track when your content is used in AI Overviews.
                    </p>
                    <p>
                      <strong>Our Solution:</strong> Content Certificate NFTs provide ownership proof and automatic WPT rewards when unauthorized use is detected.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ContentCertificateManager creatorId={creatorId} />
      </div>
    </div>
  );
}