import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Email as EmailIcon,
  Folder as FolderIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const steps = ['Project Setup', 'Data Sources', 'Custodians', 'Filters & Scope', 'Review & Launch'];

interface CollectionSource {
  id: string;
  type: 'email' | 'file_share' | 'cloud_storage' | 'database' | 'other';
  name: string;
  location: string;
  credentials?: Record<string, string>;
}

interface Custodian {
  id: string;
  name: string;
  email: string;
  department?: string;
  dataSources: string[];
}

export const CollectionWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<string>('litigation');
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [sources, setSources] = useState<CollectionSource[]>([]);
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddSource = (type: CollectionSource['type']) => {
    const newSource: CollectionSource = {
      id: `source-${Date.now()}`,
      type,
      name: '',
      location: '',
    };
    setSources([...sources, newSource]);
  };

  const handleRemoveSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
  };

  const handleAddCustodian = () => {
    const newCustodian: Custodian = {
      id: `custodian-${Date.now()}`,
      name: '',
      email: '',
      dataSources: [],
    };
    setCustodians([...custodians, newCustodian]);
  };

  const handleRemoveCustodian = (id: string) => {
    setCustodians(custodians.filter((c) => c.id !== id));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSubmit = async () => {
    // In production, submit to API
    console.log('Starting collection:', {
      projectName,
      projectType,
      dateRange: { start: dateRangeStart, end: dateRangeEnd },
      sources,
      custodians,
      keywords,
    });
  };

  const getSourceIcon = (type: CollectionSource['type']) => {
    const icons = {
      email: <EmailIcon />,
      file_share: <FolderIcon />,
      cloud_storage: <CloudIcon />,
      database: <CloudUploadIcon />,
      other: <CloudUploadIcon />,
    };
    return icons[type];
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                helperText="Enter a descriptive name for this discovery project"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  label="Project Type"
                >
                  <MenuItem value="litigation">Litigation</MenuItem>
                  <MenuItem value="investigation">Investigation</MenuItem>
                  <MenuItem value="regulatory">Regulatory</MenuItem>
                  <MenuItem value="audit">Audit</MenuItem>
                  <MenuItem value="information_governance">Information Governance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Matter ID"
                helperText="Optional - Link to existing matter"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                helperText="Provide details about the scope and purpose of this collection"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => handleAddSource('email')}
              >
                Email Source
              </Button>
              <Button
                variant="outlined"
                startIcon={<FolderIcon />}
                onClick={() => handleAddSource('file_share')}
              >
                File Share
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudIcon />}
                onClick={() => handleAddSource('cloud_storage')}
              >
                Cloud Storage
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => handleAddSource('database')}
              >
                Database
              </Button>
            </Box>

            {sources.length === 0 ? (
              <Alert severity="info">
                No data sources added yet. Click a button above to add a data source.
              </Alert>
            ) : (
              <List>
                {sources.map((source, index) => (
                  <Card key={source.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            {getSourceIcon(source.type)}
                            <Typography variant="h6">
                              {source.type.replace('_', ' ').toUpperCase()} #{index + 1}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveSource(source.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Source Name"
                            value={source.name}
                            onChange={(e) => {
                              const updated = sources.map((s) =>
                                s.id === source.id ? { ...s, name: e.target.value } : s,
                              );
                              setSources(updated);
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Location/Server"
                            value={source.location}
                            onChange={(e) => {
                              const updated = sources.map((s) =>
                                s.id === source.id ? { ...s, location: e.target.value } : s,
                              );
                              setSources(updated);
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCustodian}
              >
                Add Custodian
              </Button>
            </Box>

            {custodians.length === 0 ? (
              <Alert severity="info">
                No custodians added yet. Click "Add Custodian" to identify data custodians for this collection.
              </Alert>
            ) : (
              <List>
                {custodians.map((custodian, index) => (
                  <Card key={custodian.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Custodian #{index + 1}</Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveCustodian(custodian.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            value={custodian.name}
                            onChange={(e) => {
                              const updated = custodians.map((c) =>
                                c.id === custodian.id ? { ...c, name: e.target.value } : c,
                              );
                              setCustodians(updated);
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={custodian.email}
                            onChange={(e) => {
                              const updated = custodians.map((c) =>
                                c.id === custodian.id ? { ...c, email: e.target.value } : c,
                              );
                              setCustodians(updated);
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Department"
                            value={custodian.department || ''}
                            onChange={(e) => {
                              const updated = custodians.map((c) =>
                                c.id === custodian.id ? { ...c, department: e.target.value } : c,
                              );
                              setCustodians(updated);
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
            )}
          </Box>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Date Range
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={dateRangeStart}
                  onChange={setDateRangeStart}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={dateRangeEnd}
                  onChange={setDateRangeEnd}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Keywords
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Keyword"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddKeyword();
                    }
                  }}
                />
                <Button variant="contained" onClick={handleAddKeyword}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {keywords.map((keyword) => (
                  <Chip
                    key={keyword}
                    label={keyword}
                    onDelete={() => handleRemoveKeyword(keyword)}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox />}
                label="Include email attachments"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Deduplicate documents"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Extract text from documents"
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Review your collection settings before launching. You can modify these settings later if needed.
            </Alert>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Project Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="textSecondary">Name:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontWeight="medium">{projectName || 'Not set'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary">Type:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontWeight="medium">{projectType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary">Date Range:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontWeight="medium">
                      {dateRangeStart && dateRangeEnd
                        ? `${dateRangeStart.toLocaleDateString()} - ${dateRangeEnd.toLocaleDateString()}`
                        : 'Not set'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Sources
                </Typography>
                <Typography>
                  {sources.length} source(s) configured
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Custodians
                </Typography>
                <Typography>
                  {custodians.length} custodian(s) identified
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Keywords
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {keywords.map((keyword) => (
                    <Chip key={keyword} label={keyword} size="small" />
                  ))}
                  {keywords.length === 0 && <Typography color="textSecondary">None</Typography>}
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
        Data Collection Wizard
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ minHeight: 400 }}>
          {renderStepContent()}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              size="large"
            >
              Launch Collection
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CollectionWizard;
