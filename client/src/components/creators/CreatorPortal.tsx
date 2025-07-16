import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCreatorSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, AlertTriangle, FileText, Globe, Copy } from "lucide-react";

const formSchema = insertCreatorSchema.extend({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
}).omit({ userId: true });

type FormData = z.infer<typeof formSchema>;

export default function CreatorPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainVerification, setDomainVerification] = useState<any>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [isDomainVerified, setIsDomainVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      websiteUrl: "",
      walletAddress: "",
      contentCategory: "",
      termsAccepted: false
    }
  });

  const checkDomainMutation = useMutation({
    mutationFn: async (websiteUrl: string) => {
      return await apiRequest("POST", "/api/domain/check", { websiteUrl });
    },
    onSuccess: (data: any) => {
      setDomainVerification(data);
      if (data.requiresVerification) {
        toast({
          title: "Domain Verification Required",
          description: data.reason || "This domain requires verification for security purposes.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Domain Check Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startVerificationMutation = useMutation({
    mutationFn: async (data: { websiteUrl: string; verificationMethod: string }) => {
      return await apiRequest("POST", "/api/domain/verify/start", {
        creatorId: 1, // Demo user ID
        websiteUrl: data.websiteUrl,
        verificationMethod: data.verificationMethod
      });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setDomainVerification(data);
        toast({
          title: "Verification Started",
          description: "Follow the instructions to verify your domain ownership.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createCreatorMutation = useMutation({
    mutationFn: async (data: any) => {
      const { termsAccepted, ...creatorData } = data;
      const response = await apiRequest("POST", "/api/creators", creatorData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You have been successfully registered as a content creator!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      reset();
      setDomainVerification(null);
      setIsDomainVerified(false);
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDomainCheck = async (websiteUrl: string) => {
    if (!websiteUrl) return;
    setIsCheckingDomain(true);
    checkDomainMutation.mutate(websiteUrl);
    setIsCheckingDomain(false);
  };

  const handleStartVerification = (websiteUrl: string, method: string) => {
    startVerificationMutation.mutate({ websiteUrl, verificationMethod: method });
  };

  const verifyDomainMutation = useMutation({
    mutationFn: async (verificationId: number) => {
      return await apiRequest("POST", `/api/domain/verify/${verificationId}`);
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setIsDomainVerified(true);
        toast({
          title: "Domain Verified!",
          description: "Your domain has been successfully verified.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Domain verification failed. Please check your setup.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Verification Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerifyDomain = (verificationId: number) => {
    verifyDomainMutation.mutate(verificationId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Token copied to clipboard",
    });
  };

  const renderDomainVerificationStatus = () => {
    if (!domainVerification) return null;

    const isHighSecurity = domainVerification.securityLevel === 'high';
    const needsVerification = domainVerification.requiresVerification;
    const hasInstructions = domainVerification.verification?.instructions;
    
    // Debug log to see what we're getting
    console.log('Domain verification data:', domainVerification);
    console.log('Needs verification:', needsVerification);
    console.log('Is verified:', isDomainVerified);
    console.log('Security level:', domainVerification.securityLevel);

    return (
      <div className="mt-4 p-4 rounded-lg border border-white/10 bg-glass-dark">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-electric-blue" />
          <h3 className="font-semibold text-white">Domain Security Check</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {needsVerification && !isDomainVerified ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : isDomainVerified ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : !needsVerification ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-sm text-gray-300">
              Security Level: <span className="font-semibold text-white">{domainVerification.securityLevel?.toUpperCase()}</span>
            </span>
          </div>
          
          {needsVerification && !isDomainVerified && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-red-400">VERIFICATION REQUIRED</span>
              </div>
              <p className="text-sm text-red-300">This domain must be verified before registration can proceed.</p>
            </div>
          )}
          
          {domainVerification.reason && (
            <p className="text-sm text-gray-300">{domainVerification.reason}</p>
          )}
          
          {needsVerification && !hasInstructions && (
            <div className="space-y-2">
              <p className="text-sm text-yellow-400">Domain verification required</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleStartVerification(watch("websiteUrl"), "file_upload")}
                  className="bg-electric-blue hover:bg-electric-blue/80"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  File Upload
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStartVerification(watch("websiteUrl"), "dns_txt")}
                  className="bg-electric-blue hover:bg-electric-blue/80"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  DNS TXT
                </Button>
              </div>
            </div>
          )}
          
          {hasInstructions && (
            <div className="space-y-2">
              <p className="text-sm text-green-400">✓ Verification in progress</p>
              <div className="p-3 bg-black/20 rounded text-sm font-mono">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Verification Token:</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(domainVerification.verification.verificationToken)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-white break-all">{domainVerification.verification.verificationToken}</p>
              </div>
              <div className="text-sm text-gray-300">
                <p className="mb-1">Instructions:</p>
                <p className="whitespace-pre-line">{domainVerification.verification.instructions}</p>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => handleVerifyDomain(domainVerification.verification.id)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={verifyDomainMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {verifyDomainMutation.isPending ? "Verifying..." : "Verify Domain"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Always check domain before registration
    if (!domainVerification) {
      setIsCheckingDomain(true);
      try {
        const domainCheckResult = await apiRequest("POST", "/api/domain/check", { websiteUrl: data.websiteUrl });
        setDomainVerification(domainCheckResult);
        
        if (domainCheckResult.requiresVerification) {
          toast({
            title: "Domain Verification Required",
            description: domainCheckResult.reason || "This domain requires verification for security purposes.",
            variant: "default",
          });
          setIsSubmitting(false);
          setIsCheckingDomain(false);
          return;
        }
      } catch (error: any) {
        toast({
          title: "Domain Check Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        setIsCheckingDomain(false);
        return;
      }
      setIsCheckingDomain(false);
    }
    
    // If domain verification is required but not completed, block registration
    if (domainVerification?.requiresVerification && !isDomainVerified) {
      toast({
        title: "Domain Verification Required",
        description: "Please complete domain verification before registration.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Add userId to the data
    const creatorData = {
      ...data,
      userId: 1 // Demo user ID
    };
    
    createCreatorMutation.mutate(creatorData);
    setIsSubmitting(false);
  };

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold gradient-text">Creator Registration Portal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="websiteUrl" className="block text-sm font-medium mb-2">
              Website URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://your-website.com"
                className="flex-1 bg-glass-dark border border-white/10 rounded-lg px-4 py-2 focus:border-electric-blue focus:outline-none text-white"
                {...register("websiteUrl")}
              />
              <Button
                type="button"
                onClick={() => handleDomainCheck(watch("websiteUrl"))}
                disabled={isCheckingDomain || !watch("websiteUrl")}
                className="bg-electric-blue hover:bg-electric-blue/80 px-4"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isCheckingDomain ? "Checking..." : "Check Domain"}
              </Button>
            </div>
            {errors.websiteUrl && (
              <p className="text-red-400 text-sm mt-1">{errors.websiteUrl.message}</p>
            )}
            {renderDomainVerificationStatus()}
          </div>
          
          <div>
            <Label htmlFor="contentCategory" className="block text-sm font-medium mb-2">
              Content Category
            </Label>
            <Select onValueChange={(value) => setValue("contentCategory", value)}>
              <SelectTrigger className="w-full bg-glass-dark border border-white/10 rounded-lg px-4 py-2 focus:border-electric-blue focus:outline-none text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Blog/Articles</SelectItem>
                <SelectItem value="news">News/Journalism</SelectItem>
                <SelectItem value="educational">Educational Content</SelectItem>
                <SelectItem value="technical">Technical Documentation</SelectItem>
                <SelectItem value="creative">Creative Writing</SelectItem>
                <SelectItem value="art">Art/Visual Content</SelectItem>
                <SelectItem value="music">Music/Audio Content</SelectItem>
                <SelectItem value="gaming">Videogame/Gaming</SelectItem>
                <SelectItem value="sports">Sports/Fitness</SelectItem>
              </SelectContent>
            </Select>
            {errors.contentCategory && (
              <p className="text-red-400 text-sm mt-1">{errors.contentCategory.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="walletAddress" className="block text-sm font-medium mb-2">
              Wallet Address
            </Label>
            <Input
              id="walletAddress"
              type="text"
              placeholder="0x..."
              className="w-full bg-glass-dark border border-white/10 rounded-lg px-4 py-2 focus:border-electric-blue focus:outline-none font-mono text-white"
              {...register("walletAddress")}
            />
            {errors.walletAddress && (
              <p className="text-red-400 text-sm mt-1">{errors.walletAddress.message}</p>
            )}
          </div>
          
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="termsAccepted"
              className="w-4 h-4 text-electric-blue bg-glass-dark border-white/10 rounded focus:ring-electric-blue"
              onCheckedChange={(checked) => setValue("termsAccepted", checked as boolean)}
            />
            <Label htmlFor="termsAccepted" className="text-sm text-gray-300">
              I agree to the WebPayback Protocol Terms
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-red-400 text-sm">{errors.termsAccepted.message}</p>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting || createCreatorMutation.isPending}
            className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {isSubmitting || createCreatorMutation.isPending ? "Registering..." : "Register for WebPayback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}