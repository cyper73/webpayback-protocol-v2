import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, XCircle, Info } from "lucide-react";

interface FraudAlert {
  id: number;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'ignored';
  createdAt: string;
  details: {
    riskScore: number;
    reasons: string[];
    recommendedAction: string;
  };
  creatorId: number;
}

interface FraudAlertsProps {
  alerts?: FraudAlert[];
}

const MOCK_ALERTS: FraudAlert[] = [
  {
    id: 1,
    alertType: "domain_concentration",
    severity: "high",
    status: "active",
    createdAt: "2025-01-14T22:00:00Z",
    details: {
      riskScore: 75,
      reasons: ["Traffico concentrato da singolo dominio", "Superato limite giornaliero"],
      recommendedAction: "Monitoraggio intensivo"
    },
    creatorId: 1
  },
  {
    id: 2,
    alertType: "low_ai_diversity",
    severity: "medium",
    status: "active",
    createdAt: "2025-01-14T21:30:00Z",
    details: {
      riskScore: 45,
      reasons: ["Bassa diversità di modelli AI", "Solo 2 AI models utilizzati"],
      recommendedAction: "Verifica pattern di utilizzo"
    },
    creatorId: 2
  },
  {
    id: 3,
    alertType: "suspicious_pattern",
    severity: "critical",
    status: "resolved",
    createdAt: "2025-01-14T20:15:00Z",
    details: {
      riskScore: 95,
      reasons: ["Pattern di auto-farming detectato", "Richieste coordinate in burst"],
      recommendedAction: "Sospensione immediata account"
    },
    creatorId: 3
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
    case 'ignored':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <AlertTriangle className="h-4 w-4" />;
    case 'resolved':
      return <CheckCircle className="h-4 w-4" />;
    case 'ignored':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getAlertTypeLabel = (alertType: string) => {
  switch (alertType) {
    case 'domain_concentration':
      return 'Concentrazione Dominio';
    case 'ip_concentration':
      return 'Concentrazione IP';
    case 'low_ai_diversity':
      return 'Bassa Diversità AI';
    case 'repetitive_pattern':
      return 'Pattern Ripetitivo';
    case 'suspicious_pattern':
      return 'Pattern Sospetto';
    case 'reward_threshold_breach':
      return 'Superamento Soglia Reward';
    case 'low_reputation':
      return 'Bassa Reputazione';
    case 'sybil_attack':
      return 'Attacco Sybil';
    case 'auto_farming':
      return 'Auto-Farming';
    default:
      return alertType;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function FraudAlerts({ alerts = MOCK_ALERTS }: FraudAlertsProps) {
  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-5 w-5" />
              Allerte Frode Attive ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <Alert key={alert.id} className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(alert.status)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {getAlertTypeLabel(alert.alertType)}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`${getSeverityColor(alert.severity)} text-white border-0 text-xs`}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Creator ID: {alert.creatorId} • {formatDate(alert.createdAt)}
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="font-medium text-red-800 dark:text-red-200">
                            Risk Score: {alert.details.riskScore}%
                          </div>
                          <div>
                            <span className="font-medium">Motivi:</span>
                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                              {alert.details.reasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium">Azione Consigliata:</span> {alert.details.recommendedAction}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(alert.status)}
                    >
                      {alert.status.toUpperCase()}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Alerts History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Storico Allerte Frode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="flex items-start justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(alert.status)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {getAlertTypeLabel(alert.alertType)}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`${getSeverityColor(alert.severity)} text-white border-0 text-xs`}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Creator ID: {alert.creatorId} • Risk: {alert.details.riskScore}% • {formatDate(alert.createdAt)}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={getStatusColor(alert.status)}
                >
                  {alert.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {activeAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">Allerte Attive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {resolvedAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">Allerte Risolte</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {alerts.filter(a => a.severity === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Allerte Critiche</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}