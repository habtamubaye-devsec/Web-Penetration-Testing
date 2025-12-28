
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'notifications@example.com',
    fromEmail: 'security@example.com',
  });
  const [scanSettings, setScanSettings] = useState({
    maxConcurrentScans: '5',
    scanTimeout: '60',
    enableCustomScans: true,
    enableAdvancedScans: true,
  });
  const { toast } = useToast();

  const handleEmailSettingsChange = (field: string, value: string) => {
    setEmailSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleScanSettingsChange = (field: string, value: string | boolean) => {
    setScanSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure global platform settings and options
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="scanning">Scanning</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveSettings}>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic platform settings
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Platform Name</Label>
                  <Input 
                    id="siteName" 
                    defaultValue="AI Enhanced Penetration Testing"
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="domain">Platform Domain</Label>
                  <Input 
                    id="domain" 
                    defaultValue="security.example.com"
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input 
                    id="supportEmail" 
                    type="email"
                    defaultValue="support@example.com"
                    disabled={saving}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="userRegistration">User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register on the platform
                    </p>
                  </div>
                  <Switch 
                    id="userRegistration"
                    defaultChecked
                    disabled={saving}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="demo">Demo Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable demo mode with sample data
                    </p>
                  </div>
                  <Switch 
                    id="demo"
                    defaultChecked
                    disabled={saving}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="scanning" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveSettings}>
              <CardHeader>
                <CardTitle>Scanning Configuration</CardTitle>
                <CardDescription>
                  Configure scanning engine settings and options
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxConcurrentScans">Max Concurrent Scans</Label>
                  <Input 
                    id="maxConcurrentScans"
                    type="number"
                    min="1"
                    max="50"
                    value={scanSettings.maxConcurrentScans}
                    onChange={(e) => handleScanSettingsChange('maxConcurrentScans', e.target.value)}
                    disabled={saving}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of scans that can run simultaneously
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scanTimeout">Scan Timeout (minutes)</Label>
                  <Input 
                    id="scanTimeout"
                    type="number"
                    min="1"
                    max="180"
                    value={scanSettings.scanTimeout}
                    onChange={(e) => handleScanSettingsChange('scanTimeout', e.target.value)}
                    disabled={saving}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum time a scan can run before timing out
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableCustomScans">Custom Scans</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to create custom scans with specific modules
                    </p>
                  </div>
                  <Switch 
                    id="enableCustomScans"
                    checked={scanSettings.enableCustomScans}
                    onCheckedChange={(checked) => handleScanSettingsChange('enableCustomScans', checked)}
                    disabled={saving}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableAdvancedScans">Advanced Scan Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable advanced scanning features like NSE scripts
                    </p>
                  </div>
                  <Switch 
                    id="enableAdvancedScans"
                    checked={scanSettings.enableAdvancedScans}
                    onCheckedChange={(checked) => handleScanSettingsChange('enableAdvancedScans', checked)}
                    disabled={saving}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveSettings}>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure email notifications and alerts
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input 
                    id="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={(e) => handleEmailSettingsChange('smtpServer', e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input 
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) => handleEmailSettingsChange('smtpPort', e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input 
                    id="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={(e) => handleEmailSettingsChange('smtpUser', e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <PasswordInput 
                    id="smtpPassword"
                    defaultValue="**********"
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input 
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => handleEmailSettingsChange('fromEmail', e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="scanComplete">Scan Completion Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications when scans are completed
                    </p>
                  </div>
                  <Switch 
                    id="scanComplete"
                    defaultChecked
                    disabled={saving}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="highSeverity">High Severity Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send immediate alerts for high severity findings
                    </p>
                  </div>
                  <Switch 
                    id="highSeverity"
                    defaultChecked
                    disabled={saving}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveSettings}>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Manage API access and integration settings
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="apiKey"
                      defaultValue="sk_live_1234567890abcdef"
                      disabled
                      className="font-mono"
                    />
                    <Button variant="outline">
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This key provides full access to the API
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableApi">API Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable API access to the platform
                    </p>
                  </div>
                  <Switch 
                    id="enableApi"
                    defaultChecked
                    disabled={saving}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="rateLimit">Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable API rate limiting
                    </p>
                  </div>
                  <Switch 
                    id="rateLimit"
                    defaultChecked
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input 
                    id="webhookUrl"
                    placeholder="https://your-server.com/webhook"
                    disabled={saving}
                  />
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via webhook when scans are completed
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
