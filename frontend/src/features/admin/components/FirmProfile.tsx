/**
 * @module components/admin/FirmProfile
 * @category Admin Panel
 * @description Firm profile management with organization details, branding, and configuration.
 * 
 * THEME SYSTEM USAGE:
 * - theme.surface.default/highlight - Card backgrounds
 * - theme.text.primary/secondary - Labels and content
 * - theme.border.default - Card and input borders
 */

import React, { useState } from 'react';
import { 
  Building2, Mail, MapPin, Upload, Save,
  Edit2, Users, Briefcase, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useTheme } from '@/providers';
import { cn } from '@/utils';
import { Card } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { Input } from '@/components/atoms';
import { useNotify } from '@/hooks';

interface FirmDetails {
  name: string;
  legalName: string;
  taxId: string;
  website: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  practiceAreas: string[];
  foundedYear: number;
  attorneyCount: number;
  barAssociations: string[];
}

export const FirmProfile: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [firmDetails, setFirmDetails] = useState<FirmDetails>({
    name: 'LexiFlow Legal Group',
    legalName: 'LexiFlow Legal Group LLP',
    taxId: '**-*******45',
    website: 'https://lexiflow.law',
    email: 'contact@lexiflow.law',
    phone: '+1 (555) 123-4567',
    address: {
      street: '1200 Constitution Ave NW',
      city: 'Washington',
      state: 'DC',
      zip: '20002',
      country: 'United States'
    },
    practiceAreas: ['Corporate Law', 'Intellectual Property', 'Litigation', 'Employment Law'],
    foundedYear: 1985,
    attorneyCount: 127,
    barAssociations: ['DC Bar', 'NY Bar', 'CA Bar']
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    setIsSaving(false);
    notify.success('Firm profile updated successfully');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        notify.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateField = (path: string, value: unknown) => {
    setFirmDetails(prev => {
      const keys = path.split('.');
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: value };
      }
      // Handle nested updates
      const newData = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className={cn(
        "flex justify-between items-start p-6 rounded-lg border shadow-sm",
        theme.surface.default,
        theme.border.default
      )}>
        <div className="flex gap-4">
          {/* Logo */}
          <div className={cn(
            "w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden",
            theme.border.default,
            theme.surface.highlight
          )}>
            {logoPreview ? (
              <img src={logoPreview} alt="Firm Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className={cn("h-10 w-10", theme.text.tertiary)} />
            )}
          </div>
          
          <div>
            <h3 className={cn("text-xl font-bold flex items-center gap-2", theme.text.primary)}>
              {firmDetails.name}
            </h3>
            <p className={cn("text-sm", theme.text.secondary)}>{firmDetails.legalName}</p>
            <div className="flex gap-4 mt-2">
              <span className={cn("text-xs flex items-center gap-1", theme.text.tertiary)}>
                <Users className="h-3 w-3" /> {firmDetails.attorneyCount} Attorneys
              </span>
              <span className={cn("text-xs flex items-center gap-1", theme.text.tertiary)}>
                <Briefcase className="h-3 w-3" /> Est. {firmDetails.foundedYear}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                icon={Save}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button variant="primary" icon={Edit2} onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card title={<span className="flex items-center gap-2"><Building2 className="h-4 w-4" />Basic Information</span>}>
          <div className="space-y-4">
            <Input 
              label="Firm Name"
              value={firmDetails.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)}
              disabled={!isEditing}
            />
            <Input 
              label="Legal Name"
              value={firmDetails.legalName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('legalName', e.target.value)}
              disabled={!isEditing}
            />
            <Input 
              label="Tax ID / EIN"
              value={firmDetails.taxId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('taxId', e.target.value)}
              disabled={!isEditing}
              type="password"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Founded Year"
                value={firmDetails.foundedYear.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('foundedYear', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                type="number"
              />
              <Input 
                label="Attorney Count"
                value={firmDetails.attorneyCount.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('attorneyCount', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                type="number"
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card title={<span className="flex items-center gap-2"><Mail className="h-4 w-4" />Contact Information</span>}>
          <div className="space-y-4">
            <Input 
              label="Website"
              value={firmDetails.website}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('website', e.target.value)}
              disabled={!isEditing}
            />
            <Input 
              label="Main Email"
              value={firmDetails.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('email', e.target.value)}
              disabled={!isEditing}
              type="email"
            />
            <Input 
              label="Main Phone"
              value={firmDetails.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('phone', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </Card>

        {/* Address */}
        <Card title={<span className="flex items-center gap-2"><MapPin className="h-4 w-4" />Primary Office Address</span>}>
          <div className="space-y-4">
            <Input 
              label="Street Address"
              value={firmDetails.address.street}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('address.street', e.target.value)}
              disabled={!isEditing}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="City"
                value={firmDetails.address.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('address.city', e.target.value)}
                disabled={!isEditing}
              />
              <Input 
                label="State"
                value={firmDetails.address.state}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('address.state', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="ZIP Code"
                value={firmDetails.address.zip}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('address.zip', e.target.value)}
                disabled={!isEditing}
              />
              <Input 
                label="Country"
                value={firmDetails.address.country}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('address.country', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Branding */}
        <Card title={<span className="flex items-center gap-2"><Upload className="h-4 w-4" />Branding & Logo</span>}>
          <div className="space-y-4">
            <div>
              <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>
                Firm Logo
              </label>
              <div className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center",
                theme.border.default,
                isEditing ? 'cursor-pointer hover:bg-slate-50' : ''
              )}>
                {logoPreview ? (
                  <div className="space-y-2">
                    <img src={logoPreview} alt="Logo preview" className="max-h-32 mx-auto" />
                    {isEditing && (
                      <Button size="sm" variant="ghost" onClick={() => setLogoPreview(null)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className={cn("h-8 w-8 mx-auto mb-2", theme.text.tertiary)} />
                    <p className={cn("text-sm", theme.text.secondary)}>
                      {isEditing ? 'Click to upload logo' : 'No logo uploaded'}
                    </p>
                    <p className={cn("text-xs mt-1", theme.text.tertiary)}>
                      PNG, JPG up to 2MB
                    </p>
                  </>
                )}
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                )}
              </div>
              {isEditing && !logoPreview && (
                <label htmlFor="logo-upload">
                  <Button 
                    variant="secondary" 
                    icon={Upload} 
                    className="w-full mt-2"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    Choose File
                  </Button>
                </label>
              )}
            </div>
          </div>
        </Card>

        {/* Practice Areas */}
        <Card title={<span className="flex items-center gap-2"><Briefcase className="h-4 w-4" />Practice Areas</span>} className="lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {firmDetails.practiceAreas.map((area, idx) => (
              <span
                key={idx}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border",
                  theme.surface.highlight,
                  theme.border.default,
                  theme.text.primary
                )}
              >
                {area}
              </span>
            ))}
            {isEditing && (
              <Button size="sm" variant="ghost" icon={Edit2}>
                Manage Practice Areas
              </Button>
            )}
          </div>
        </Card>

        {/* Bar Associations */}
        <Card title={<span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Bar Associations</span>} className="lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {firmDetails.barAssociations.map((bar, idx) => (
              <span
                key={idx}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium",
                  "bg-emerald-50 text-emerald-700 border border-emerald-200"
                )}
              >
                <CheckCircle className="h-3 w-3 inline mr-1" />
                {bar}
              </span>
            ))}
            {isEditing && (
              <Button size="sm" variant="ghost" icon={Edit2}>
                Manage Bar Associations
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card title="Compliance & Verification Status">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-sm font-medium", theme.text.secondary)}>Bar Verification</span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <p className={cn("text-xs", theme.text.tertiary)}>Last verified: Jan 1, 2024</p>
          </div>
          <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-sm font-medium", theme.text.secondary)}>Tax Registration</span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <p className={cn("text-xs", theme.text.tertiary)}>Valid through 2025</p>
          </div>
          <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-sm font-medium", theme.text.secondary)}>Insurance Coverage</span>
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <p className={cn("text-xs", theme.text.tertiary)}>Renewal due in 30 days</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
