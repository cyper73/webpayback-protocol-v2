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

const formSchema = insertCreatorSchema.extend({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

type FormData = z.infer<typeof formSchema>;

export default function CreatorPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      userId: 1, // Default user ID for demo
      websiteUrl: "",
      walletAddress: "",
      contentCategory: "",
      termsAccepted: false
    }
  });

  const createCreatorMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { termsAccepted, ...creatorData } = data;
      const response = await apiRequest("POST", "/api/creators", creatorData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You have been successfully registered as a content creator!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      reset();
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    createCreatorMutation.mutate(data);
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
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://your-website.com"
              className="w-full bg-glass-dark border border-white/10 rounded-lg px-4 py-2 focus:border-electric-blue focus:outline-none"
              {...register("websiteUrl")}
            />
            {errors.websiteUrl && (
              <p className="text-red-400 text-sm mt-1">{errors.websiteUrl.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="contentCategory" className="block text-sm font-medium mb-2">
              Content Category
            </Label>
            <Select onValueChange={(value) => setValue("contentCategory", value)}>
              <SelectTrigger className="w-full bg-glass-dark border border-white/10 rounded-lg px-4 py-2 focus:border-electric-blue focus:outline-none">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Blog/Articles</SelectItem>
                <SelectItem value="news">News/Journalism</SelectItem>
                <SelectItem value="educational">Educational Content</SelectItem>
                <SelectItem value="technical">Technical Documentation</SelectItem>
                <SelectItem value="creative">Creative Writing</SelectItem>
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
              className="w-full bg-glass-dark border border-white/10 rounded-lg px-4 py-2 focus:border-electric-blue focus:outline-none font-mono"
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
