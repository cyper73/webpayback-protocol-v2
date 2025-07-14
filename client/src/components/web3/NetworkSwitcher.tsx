import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Network, Globe } from "lucide-react";

export default function NetworkSwitcher() {
  const [selectedNetwork, setSelectedNetwork] = useState<'polygon' | 'ethereum'>('polygon');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const switchNetworkMutation = useMutation({
    mutationFn: async (network: 'polygon' | 'ethereum') => {
      return apiRequest('/api/web3/switch-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ network })
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Network cambiato",
        description: `Ora utilizzi la rete ${selectedNetwork === 'ethereum' ? 'Ethereum Mainnet' : 'Polygon'}`,
      });
      
      // Invalida tutte le query web3 per aggiornare i dati
      queryClient.invalidateQueries({ queryKey: ['/api/web3/token-info'] });
      queryClient.invalidateQueries({ queryKey: ['/api/web3/pool-info'] });
      queryClient.invalidateQueries({ queryKey: ['/api/web3/network-status'] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile cambiare network",
        variant: "destructive"
      });
    }
  });

  const handleNetworkSwitch = () => {
    switchNetworkMutation.mutate(selectedNetwork);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="text-electric-blue" />
          <span>Network Blockchain</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Network Attuale</label>
            <Badge variant="outline" className="w-full justify-center">
              <Network className="w-4 h-4 mr-2" />
              Polygon
            </Badge>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Cambia Network</label>
            <div className="space-y-2">
              <Button
                variant={selectedNetwork === 'polygon' ? 'default' : 'outline'}
                onClick={() => setSelectedNetwork('polygon')}
                className="w-full justify-start"
              >
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Polygon
              </Button>
              <Button
                variant={selectedNetwork === 'ethereum' ? 'default' : 'outline'}
                onClick={() => setSelectedNetwork('ethereum')}
                className="w-full justify-start"
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Ethereum Mainnet
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleNetworkSwitch}
            disabled={switchNetworkMutation.isPending}
            className="w-full"
          >
            {switchNetworkMutation.isPending ? 'Cambiando...' : 'Cambia Network'}
          </Button>
          
          <div className="text-sm text-gray-400">
            <p>
              <strong>Polygon:</strong> Token WPT attualmente attivo
            </p>
            <p>
              <strong>Ethereum:</strong> Pronto per quando WPT sarà su mainnet
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}