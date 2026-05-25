import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { WalletVerification } from '@/components/wallet/WalletVerification';
import { apiRequest } from '@/lib/queryClient';

interface Creator {
  id: number;
  websiteUrl: string;
  walletAddress: string;
  isWalletVerified: boolean;
  twoFactorEnabled: boolean;
  contentCategory: string;
}

interface WalletLoginProps {
  onLoginSuccess: (session: { walletAddress: string; creators: Creator[]; sessionToken: string }) => void;
}

export function WalletLogin({ onLoginSuccess }: WalletLoginProps) {
  const [step, setStep] = useState<'wallet-input' | 'wallet-verify' | 'completed'>('wallet-input');
  const [walletAddress, setWalletAddress] = useState('');
  const [foundCreators, setFoundCreators] = useState<Creator[]>([]);
  const [error, setError] = useState('');

  const { toast } = useToast();

  const checkWalletMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest('POST', '/api/auth/wallet/check', {
        walletAddress: address
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.creators?.length > 0) {
        setFoundCreators(data.creators);
        const verifiedCreators = data.creators.filter((c: Creator) => c.isWalletVerified);
        if (verifiedCreators.length > 0) {
          setStep('wallet-verify');
          toast({
            title: "Wallet Found",
            description: `Found ${data.creators.length} registered site(s) for this wallet`,
          });
        } else {
          setError('Wallet found but not cryptographically verified. Please complete wallet verification in Creator Portal first.');
        }
      } else {
        setError('Wallet not registered. Please register your wallet in Creator Portal first.');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to check wallet registration');
    }
  });

  const handleWalletVerificationComplete = async (_signature: string, _message: string) => {
    await completeLogin();
  };

  const completeLogin = async () => {
    try {
      const response = await apiRequest('POST', '/api/auth/wallet/login', {
        walletAddress,
        creatorIds: foundCreators.map(c => c.id)
      });
      const data = await response.json();

      if (data.success) {
        setStep('completed');
        onLoginSuccess({
          walletAddress,
          creators: foundCreators,
          sessionToken: data.sessionToken
        });
        toast({
          title: "Login Successful",
          description: "Welcome to WebPayback Protocol",
        });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
    }
  };

  const handleWalletSubmit = () => {
    if (!walletAddress.trim()) {
      setError('Please enter your wallet address');
      return;
    }
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setError('Please enter a valid Ethereum wallet address');
      return;
    }
    setError('');
    checkWalletMutation.mutate(walletAddress.toLowerCase());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWalletSubmit();
    }
  };

  if (step === 'completed') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Login Successful
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back! You now have access to all WebPayback Protocol modules.
            </p>
            <div className="flex items-center gap-2 justify-center">
              <Badge variant="secondary">{foundCreators.length} site(s)</Badge>
              <Badge variant="secondary">{walletAddress.substring(0, 6)}...{walletAddress.substring(38)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'wallet-verify') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Step 2: Verify Wallet Ownership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Found {foundCreators.length} registered site(s) for wallet: {walletAddress}
                </p>
                <div className="mt-2 space-y-1">
                  {foundCreators.map((creator, index) => (
                    <div key={creator.id} className="text-xs text-blue-700 dark:text-blue-300">
                      {index + 1}. {creator.websiteUrl}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚡ Multi-Wallet Support
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Connect with MetaMask, Coinbase, Trust Wallet, WalletConnect, or any other supported wallet to sign the verification message.
                </p>
              </div>

              <WalletVerification
                walletAddress={walletAddress}
                onVerificationComplete={handleWalletVerificationComplete}
                onWalletChange={setWalletAddress}
                showMultiWalletSupport={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          Login to WebPayback Protocol
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your registered wallet address to access all modules
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet Address</label>
            <Input
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              className="font-mono"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleWalletSubmit}
            disabled={checkWalletMutation.isPending}
            className="w-full"
          >
            {checkWalletMutation.isPending ? 'Checking...' : 'Check Wallet'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
