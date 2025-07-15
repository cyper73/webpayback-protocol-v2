import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Eye, TrendingUp, Users, Ban } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

interface FraudRule {
  id: number;
  ruleName: string;
  ruleType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  parameters: any;
}

interface FraudDetectionRulesProps {
  rules?: FraudRule[];
}

const FRAUD_RULES = [
  {
    id: 1,
    ruleName: "Limite Dominio/IP",
    ruleType: "domain_limit",
    description: "Limiti per prevenire attacchi da singolo dominio o IP",
    severity: "high" as const,
    isActive: true,
    parameters: {
      maxDailyAccessesPerDomain: 100,
      maxDailyAccessesPerIP: 50,
      maxDomainConcentration: 80,
      maxIPConcentration: 70
    }
  },
  {
    id: 2,
    ruleName: "Proof of Personhood",
    ruleType: "pattern_analysis",
    description: "Verifica diversità e autenticità delle richieste AI",
    severity: "medium" as const,
    isActive: true,
    parameters: {
      minAIModelDiversity: 3,
      minEntropyScore: 0.5,
      maxIdenticalRequests: 10,
      minTimeSpread: 3600
    }
  },
  {
    id: 3,
    ruleName: "Analisi Pattern Sospetti",
    ruleType: "pattern_analysis",
    description: "Detecta pattern di auto-farming e bot coordinati",
    severity: "high" as const,
    isActive: true,
    parameters: {
      maxBurstRequests: 20,
      burstTimeWindow: 300,
      maxRepeatedPatterns: 5,
      minHumanLikeVariation: 0.3
    }
  },
  {
    id: 4,
    ruleName: "Soglia Ricompense",
    ruleType: "threshold_check",
    description: "Controllo soglie per reward legittime",
    severity: "medium" as const,
    isActive: true,
    parameters: {
      minDailyRewardThreshold: 0.1,
      maxDailyRewardThreshold: 50,
      minWeeklyEntropy: 0.4,
      maxSuspiciousScore: 70
    }
  },
  {
    id: 5,
    ruleName: "Sistema Reputazione",
    ruleType: "reputation_check",
    description: "Gestione reputazione e penalità per creator",
    severity: "critical" as const,
    isActive: true,
    parameters: {
      minReputationScore: 30,
      maxFraudCount: 3,
      penaltyMultiplier: 0.5,
      trustScoreThreshold: 70
    }
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

const getRuleIcon = (ruleType: string) => {
  switch (ruleType) {
    case 'domain_limit':
      return <Shield className="h-4 w-4" />;
    case 'pattern_analysis':
      return <Eye className="h-4 w-4" />;
    case 'threshold_check':
      return <TrendingUp className="h-4 w-4" />;
    case 'reputation_check':
      return <Users className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

export default function FraudDetectionRules({ rules = FRAUD_RULES }: FraudDetectionRulesProps) {
  const { t } = useTranslations();
  
  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <Ban className="h-4 w-4" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <strong>{t('fraudWarning')}</strong> {t('fraudWarningText')}
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{t('fraudWarning1')}</li>
            <li>{t('fraudWarning2')}</li>
            <li>{t('fraudWarning3')}</li>
            <li>{t('fraudWarning4')}</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Active Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('activeFraudRules')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getRuleIcon(rule.ruleType)}
                    <div>
                      <h3 className="font-semibold text-sm">{rule.ruleName}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getSeverityColor(rule.severity)} text-white border-0`}
                  >
                    {rule.severity.toUpperCase()}
                  </Badge>
                </div>

                {/* Rule Parameters */}
                <div className="mt-3 pl-7">
                  <div className="text-xs text-muted-foreground space-y-1">
                    {rule.ruleType === 'domain_limit' && (
                      <>
                        <div>• {t('maxDailyAccessesDomain')}: {rule.parameters.maxDailyAccessesPerDomain}</div>
                        <div>• {t('maxDailyAccessesIP')}: {rule.parameters.maxDailyAccessesPerIP}</div>
                        <div>• {t('maxDomainConcentration')}: {rule.parameters.maxDomainConcentration}%</div>
                        <div>• {t('maxIPConcentration')}: {rule.parameters.maxIPConcentration}%</div>
                      </>
                    )}
                    {rule.ruleType === 'pattern_analysis' && rule.parameters.minAIModelDiversity && (
                      <>
                        <div>• {t('minAIModelDiversity')}: {rule.parameters.minAIModelDiversity}</div>
                        <div>• {t('minEntropyScore')}: {rule.parameters.minEntropyScore}</div>
                        <div>• {t('maxIdenticalRequests')}: {rule.parameters.maxIdenticalRequests}</div>
                        <div>• {t('minTimeSpread')}: {rule.parameters.minTimeSpread}s</div>
                      </>
                    )}
                    {rule.ruleType === 'pattern_analysis' && rule.parameters.maxBurstRequests && (
                      <>
                        <div>• Max richieste in burst: {rule.parameters.maxBurstRequests}</div>
                        <div>• Finestra temporale burst: {rule.parameters.burstTimeWindow}s</div>
                        <div>• Max pattern ripetuti: {rule.parameters.maxRepeatedPatterns}</div>
                        <div>• Min variazione human-like: {rule.parameters.minHumanLikeVariation}</div>
                      </>
                    )}
                    {rule.ruleType === 'threshold_check' && (
                      <>
                        <div>• Min reward giornaliero: {rule.parameters.minDailyRewardThreshold} WPT</div>
                        <div>• Max reward giornaliero: {rule.parameters.maxDailyRewardThreshold} WPT</div>
                        <div>• Min entropy settimanale: {rule.parameters.minWeeklyEntropy}</div>
                        <div>• Max punteggio sospetto: {rule.parameters.maxSuspiciousScore}%</div>
                      </>
                    )}
                    {rule.ruleType === 'reputation_check' && (
                      <>
                        <div>• Min punteggio reputazione: {rule.parameters.minReputationScore}</div>
                        <div>• Max frodi prima del ban: {rule.parameters.maxFraudCount}</div>
                        <div>• Moltiplicatore penalità: {rule.parameters.penaltyMultiplier}x</div>
                        <div>• Soglia trust score: {rule.parameters.trustScoreThreshold}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Come Funziona il Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p className="font-medium">Monitoraggio in Tempo Reale</p>
                <p className="text-muted-foreground">
                  Ogni accesso AI viene analizzato per pattern sospetti, concentrazione IP/dominio e diversità delle richieste.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p className="font-medium">Scoring Intelligente</p>
                <p className="text-muted-foreground">
                  Il sistema calcola un punteggio di rischio basato su multiple metriche e comportamenti anomali.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              <div>
                <p className="font-medium">Azioni Automatiche</p>
                <p className="text-muted-foreground">
                  Reward bloccate, penalità reputazione e allerte generate automaticamente per attività sospette.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              <div>
                <p className="font-medium">Trasparenza Totale</p>
                <p className="text-muted-foreground">
                  Tutti i controlli sono visibili e documentati per garantire un sistema equo e trasparente.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}