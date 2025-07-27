import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calculator, ExternalLink, CheckCircle, AlertCircle, Zap, Target } from "lucide-react";

const BalancerV2Setup = () => {
  const [investmentAmount, setInvestmentAmount] = useState(200);
  
  const calculateLiquidity = (total: number) => {
    const usdtAmount = Math.floor(total * 0.8); // 80%
    const wptValue = Math.floor(total * 0.2);   // 20%
    const wptPrice = 0.01; // Assumed price
    const wptTokens = Math.floor(wptValue / wptPrice);
    
    return {
      total,
      usdt: usdtAmount,
      wptValue,
      wptTokens,
      wptPrice
    };
  };

  const calc = calculateLiquidity(investmentAmount);

  const addresses = {
    vault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    usdt: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    wpt: "0x9408f17a8B4666f8cb8231BA213DE04137dc3825"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Balancer V2 Pool Setup - USDT/WPT
          </CardTitle>
          <CardDescription>
            Elimina "out of gas" e "out of range" con pool weighted stabile
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Why V2 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Perché Balancer V2 Risolve i Tuoi Problemi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">❌ Problemi Uniswap V3</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• "Out of gas" frequente</li>
                <li>• "Out of range" continuo</li>
                <li>• Range management complesso</li>
                <li>• Gas costs elevati</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">✅ Soluzioni Balancer V2</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Gas 30% più basso</li>
                <li>• Zero range issues</li>
                <li>• Set-and-forget</li>
                <li>• Impermanent loss ridotto</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pool Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configurazione Pool Ottimale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">Weighted</div>
              <div className="text-sm text-muted-foreground">Pool Type</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">80/20</div>
              <div className="text-sm text-muted-foreground">USDT/WPT</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">0.5%</div>
              <div className="text-sm text-muted-foreground">Swap Fee</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">$100+</div>
              <div className="text-sm text-muted-foreground">Min Liquidity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Calcolatore Liquidità</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="investment">Investimento Totale ($USD)</Label>
            <Input
              id="investment"
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              className="w-32"
              min="100"
              step="50"
            />
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">80% USDT (Stabile)</h4>
              <div className="text-2xl font-bold text-green-600">{calc.usdt} USDT</div>
              <p className="text-sm text-muted-foreground">Fornisce stabilità alla pool</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">20% WPT (Growth)</h4>
              <div className="text-2xl font-bold text-blue-600">{calc.wptTokens.toLocaleString()} WPT</div>
              <p className="text-sm text-muted-foreground">
                ${calc.wptValue} valore (@ ${calc.wptPrice} per WPT)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Guida Implementazione</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Prepara USDT su Polygon</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Compra USDT su exchange (Binance, Coinbase)</li>
                  <li>• Invia a Polygon network</li>
                  <li>• Verifica address: <code className="text-xs bg-muted px-1 rounded">{addresses.usdt}</code></li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Accedi a Balancer V2</h4>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://app.balancer.fi" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      app.balancer.fi
                    </a>
                  </Button>
                  <span className="text-sm text-muted-foreground">→ Pools → Create Pool</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Configura Pool</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Badge variant="secondary">Weighted Pool</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Seleziona questo tipo</p>
                  </div>
                  <div>
                    <Badge variant="secondary">Weights: 80/20</Badge>
                    <p className="text-sm text-muted-foreground mt-1">80% USDT, 20% WPT</p>
                  </div>
                  <div>
                    <Badge variant="secondary">Fee: 0.5%</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Ottimale per token nuovo</p>
                  </div>
                  <div>
                    <Badge variant="secondary">Swap Fee</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Guadagni su ogni scambio</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 4 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                ✓
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Aggiungi Liquidità</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Approva USDT e WPT token</li>
                  <li>• Conferma creazione (gas basso!)</li>
                  <li>• Ricevi BPT (Balancer Pool Tokens)</li>
                  <li>• Goditi liquidità stabile</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Benefici Attesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Zero "out of range" (impossibile)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Gas 30% più basso vs Uniswap</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Set-and-forget management</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Impermanent loss ridotto (80/20)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">BAL token rewards settimanali</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Protocollo mature (3+ anni)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Indirizzi Verificati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Balancer Vault:</span>
            <code className="bg-background px-2 py-1 rounded text-xs">{addresses.vault}</code>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">USDT (Polygon):</span>
            <code className="bg-background px-2 py-1 rounded text-xs">{addresses.usdt}</code>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">WPT Token:</span>
            <code className="bg-background px-2 py-1 rounded text-xs">{addresses.wpt}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalancerV2Setup;