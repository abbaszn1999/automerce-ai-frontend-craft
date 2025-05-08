
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Database, FileSearch } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const AnalyticsConfig: React.FC = () => {
  const [gscVerified, setGscVerified] = useState(false);
  const [gscVerificationCode, setGscVerificationCode] = useState("");
  const [selectedCms, setSelectedCms] = useState<string | null>(null);

  const handleVerifyGSC = () => {
    if (gscVerificationCode.trim()) {
      toast.success("Google Search Console verified successfully!");
      setGscVerified(true);
    } else {
      toast.error("Please enter a verification code");
    }
  };

  const handleConnectCMS = (cms: string) => {
    setSelectedCms(cms);
    toast.success(`Connected to ${cms} successfully!`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Analytics Configuration</h2>
        <p className="text-gray-600">
          Connect your analytics and CMS platforms for enhanced data insights
        </p>
      </div>

      <div className="space-y-8">
        {/* Google Search Console Integration */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileSearch size={20} />
              Google Search Console
            </CardTitle>
            <CardDescription>
              Connect your Google Search Console to import performance data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!gscVerified ? (
              <div>
                <p className="mb-4 text-sm text-gray-600">
                  To connect your Google Search Console, enter the verification code from your GSC account
                </p>
                <div className="flex gap-3 mb-4">
                  <input 
                    type="text" 
                    placeholder="Verification code" 
                    className="p-2 border rounded flex-1"
                    value={gscVerificationCode}
                    onChange={(e) => setGscVerificationCode(e.target.value)}
                  />
                  <Button 
                    onClick={handleVerifyGSC} 
                    className="btn-primary"
                  >
                    Verify
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-600 flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Connected Successfully
                  </div>
                  <p className="text-sm text-gray-600">Your GSC data will be imported automatically</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setGscVerified(false)}
                >
                  Disconnect
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CMS Connection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Database size={20} />
              CMS Platform Integration
            </CardTitle>
            <CardDescription>
              Connect your Content Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Select your CMS platform to connect for automatic data synchronization
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${selectedCms === "WordPress" ? "border-primary ring-2 ring-primary/20" : ""}`}
                onClick={() => handleConnectCMS("WordPress")}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <Code className="h-10 w-10 mb-2 text-gray-600" />
                  <h3 className="font-medium">WordPress</h3>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${selectedCms === "Shopify" ? "border-primary ring-2 ring-primary/20" : ""}`}
                onClick={() => handleConnectCMS("Shopify")}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <Code className="h-10 w-10 mb-2 text-gray-600" />
                  <h3 className="font-medium">Shopify</h3>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 cursor-not-allowed">
                <CardContent className="p-4 flex flex-col items-center">
                  <Code className="h-10 w-10 mb-2 text-gray-400" />
                  <h3 className="font-medium text-gray-400">Magento</h3>
                  <span className="text-xs mt-1 bg-gray-200 px-2 py-1 rounded">Coming Soon</span>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsConfig;
