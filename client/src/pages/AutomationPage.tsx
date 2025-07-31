import React from "react";
import AutomationDashboard from "@/components/automation/AutomationDashboard";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Shield, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AutomationPage() {
  // Check authorization via server API
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["/api/automation/auth-check"],
    retry: false,
  });

  // Show loading during auth check
  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Verifying authorization...</span>
        </div>
      </div>
    );
  }

  // Check server-side authorization
  if (!(authData as any)?.authorized) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Shield className="h-5 w-5 mr-2" />
                Access Restricted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Automated Pool Manager Access Denied</strong>
                  <br />
                  {(authData as any)?.error || "This functionality is restricted to the WebPayback Protocol founder only. Automated pool management requires highest security clearance."}
                </AlertDescription>
              </Alert>
              <div className="mt-4 text-sm text-gray-600">
                <h4 className="font-semibold mb-2">Security Features:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Server-side authentication validation</li>
                  <li>Device fingerprint authentication</li>
                  <li>Emergency stop controls protection</li>
                  <li>Pool configuration security</li>
                  <li>Multi-layer authorization</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <AutomationDashboard />
    </div>
  );
}