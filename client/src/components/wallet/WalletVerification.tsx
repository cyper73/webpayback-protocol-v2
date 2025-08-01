import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Copy, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface WalletVerificationProps {
  walletAddress: string;
  onVerificationComplete: (signature: string, message: string) => void;
  onWalletChange: (address: string) => void;
}

export function WalletVerification({ 
  walletAddress, 
  onVerificationComplete, 
  onWalletChange 
}: WalletVerificationProps) {
  const [verificationMessage, setVerificationMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const generateVerificationMessage = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address first');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      console.log('🔐 Generating verification message for wallet:', walletAddress);
      const response = await apiRequest('POST', '/api/wallet/generate-verification', { 
        walletAddress 
      });
      const result = await response.json();
      console.log('🔐 Server response:', result);

      if (result.success && result.message) {
        console.log('🔐 Setting verification message:', result.message);
        console.log('🔐 Message length:', result.message.length);
        // Force update without sanitization for display
        setVerificationMessage(String(result.message));
        toast({
          title: "Verification message generated",
          description: "Copy the message and sign it with your wallet",
        });
      } else {
        console.error('🔐 Server error:', result.error);
        setError(result.error || 'Failed to generate verification message');
      }
    } catch (err) {
      console.error('🔐 Network error:', err);
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationMessage);
    toast({
      title: "Message copied",
      description: "Paste it in your wallet to sign",
    });
  };

  const verifySignature = async () => {
    if (!signature.trim()) {
      setError('Please enter the signature from your wallet');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/wallet/verify-signature', {
        walletAddress,
        message: verificationMessage,
        signature
      });
      const result = await response.json();

      if (result.success) {
        setVerificationStatus('success');
        onVerificationComplete(signature, verificationMessage);
        toast({
          title: "Wallet verified successfully",
          description: "Your wallet ownership has been confirmed",
        });
      } else {
        setVerificationStatus('error');
        setError(result.error || 'Signature verification failed');
      }
    } catch (err) {
      setVerificationStatus('error');
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsVerifying(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          onWalletChange(accounts[0]);
          toast({
            title: "Wallet connected",
            description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        }
      } catch (err) {
        toast({
          title: "Connection failed",
          description: "Failed to connect to wallet",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Wallet Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> We require cryptographic proof that you own the wallet address. 
            This prevents others from registering with addresses they don't control.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium">Wallet Address</label>
          <div className="flex gap-2">
            <Input
              value={walletAddress}
              onChange={(e) => onWalletChange(e.target.value)}
              placeholder="0x..."
              className="font-mono text-sm"
            />
            <Button onClick={connectWallet} variant="outline">
              Connect Wallet
            </Button>
          </div>
        </div>

        {!verificationMessage && (
          <Button 
            onClick={generateVerificationMessage} 
            disabled={isGenerating || !walletAddress}
            className="w-full"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Verification Message
          </Button>
        )}

        {verificationMessage && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Message to Sign</label>
                <Button onClick={copyToClipboard} size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={verificationMessage}
                readOnly
                className="font-mono text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                rows={8}
                placeholder="Verification message will appear here..."
              />
            </div>

            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <AlertDescription>
                <strong>How to sign the message:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-2">
                  <li><strong>Copy the message above</strong> using the "Copy" button</li>
                  <li><strong>Open MetaMask</strong> (or your wallet)</li>
                  <li>
                    <strong>Sign the message:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li>In MetaMask: go to "⋮" menu → "Sign Data"</li>
                      <li>Or use keyboard shortcut <code>Ctrl+Shift+S</code> in MetaMask</li>
                      <li>Paste the message and click "Sign"</li>
                    </ul>
                  </li>
                  <li><strong>Copy the signature</strong> and paste it below</li>
                </ol>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  ⚠️ Important: This is not a transaction, just proving wallet ownership.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">Signature from Wallet</label>
              <Textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Paste the signature from your wallet here..."
                className="font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                rows={3}
              />
            </div>

            <Button 
              onClick={verifySignature} 
              disabled={isVerifying || !signature}
              className="w-full"
            >
              {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Signature
            </Button>
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {verificationStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              ✅ Wallet ownership verified! You can now complete your registration.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}