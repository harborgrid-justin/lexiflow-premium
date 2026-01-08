import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  CloudDownload as DownloadIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface Production {
  id: string;
  productionName: string;
  productionNumber: string;
  status: string;
  format: string;
  totalDocuments: number;
  totalPages: number;
  batesRange: { start: string; end: string } | null;
  productionDate: Date | null;
  recipientParty: string;
}

const productionSteps = ['Define Criteria', 'Apply Numbering', 'Generate Files', 'QC Review', 'Deliver'];

export const ProductionManager: React.FC = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newProduction, setNewProduction] = useState({
    name: '',
    format: 'native',
    includeResponsive: true,
    excludePrivileged: true,
    excludeDuplicates: true,
    batesPrefix: 'PROD',
  });

  useEffect(() => {
    loadProductions();
  }, []);

  const loadProductions = async () => {
    // Mock data
    setProductions([
      {
        id: 'prod-1',
        productionName: 'Initial Production Set 1',
        productionNumber: 'PROD-001',
        status: 'completed',
        format: 'native',
        totalDocuments: 1250,
        totalPages: 8432,
        batesRange: { start: 'PROD0001000', end: 'PROD0009431' },
        productionDate: new Date('2024-02-15'),
        recipientParty: 'Plaintiff',
      },
      {
        id: 'prod-2',
        productionName: 'Supplemental Production',
        productionNumber: 'PROD-002',
        status: 'in_progress',
        format: 'pdf',
        totalDocuments: 450,
        totalPages: 2100,
        batesRange: { start: 'PROD0010000', end: 'PROD0012099' },
        productionDate: null,
        recipientParty: 'Plaintiff',
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      planned: 'default',
      in_progress: 'warning',
      qc_review: 'info',
      ready: 'success',
      produced: 'success',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  const handleCreateProduction = () => {
    if (activeStep === productionSteps.length - 1) {
      // Submit production
      console.log('Creating production:', newProduction);
      setOpenDialog(false);
      setActiveStep(0);
      setNewProduction({
        name: '',
        format: 'native',
        includeResponsive: true,
        excludePrivileged: true,
        excludeDuplicates: true,
        batesPrefix: 'PROD',
      });
      loadProductions();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Production Name"
                value={newProduction.name}
                onChange={(e) => setNewProduction({ ...newProduction, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={newProduction.format}
                  onChange={(e) => setNewProduction({ ...newProduction, format: e.target.value })}
                  label="Format"
                >
                  <MenuItem value="native">Native Files</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="tiff">TIFF</MenuItem>
                  <MenuItem value="load_file">Load File Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newProduction.includeResponsive}
                    onChange={(e) =>
                      setNewProduction({ ...newProduction, includeResponsive: e.target.checked })
                    }
                  />
                }
                label="Include only responsive documents"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newProduction.excludePrivileged}
                    onChange={(e) =>
                      setNewProduction({ ...newProduction, excludePrivileged: e.target.checked })
                    }
                  />
                }
                label="Exclude privileged documents"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newProduction.excludeDuplicates}
                    onChange={(e) =>
                      setNewProduction({ ...newProduction, excludeDuplicates: e.target.checked })
                    }
                  />
                }
                label="Exclude duplicate documents"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bates Prefix"
                value={newProduction.batesPrefix}
                onChange={(e) =>
                  setNewProduction({ ...newProduction, batesPrefix: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Number each page separately"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Estimated range: {newProduction.batesPrefix}0000001 - {newProduction.batesPrefix}
                0005432
              </Typography>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              The following files will be generated:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>Native files or rendered images</li>
              <li>Load file (DAT format)</li>
              <li>Text files</li>
              <li>Privilege log (if applicable)</li>
              <li>Production report</li>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Quality control review will check:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>Bates numbering sequence</li>
              <li>File integrity</li>
              <li>Privilege log accuracy</li>
              <li>Metadata completeness</li>
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Ready to create production. Review summary:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Name:
                </Typography>
                <Typography variant="body2">{newProduction.name || 'Not set'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Format:
                </Typography>
                <Typography variant="body2">{newProduction.format.toUpperCase()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Bates Prefix:
                </Typography>
                <Typography variant="body2">{newProduction.batesPrefix}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Estimated Docs:
                </Typography>
                <Typography variant="body2">~1,200 documents</Typography>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Production Manager
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          New Production
        </Button>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Productions
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {productions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Documents Produced
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {productions.reduce((sum, p) => sum + p.totalDocuments, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Pages
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {productions.reduce((sum, p) => sum + p.totalPages, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                In Progress
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {productions.filter((p) => p.status === 'in_progress').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Productions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Production Name</TableCell>
              <TableCell>Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Format</TableCell>
              <TableCell align="right">Documents</TableCell>
              <TableCell align="right">Pages</TableCell>
              <TableCell>Bates Range</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productions.map((production) => (
              <TableRow key={production.id} hover>
                <TableCell>{production.productionName}</TableCell>
                <TableCell>{production.productionNumber}</TableCell>
                <TableCell>
                  <Chip
                    label={production.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(production.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{production.format.toUpperCase()}</TableCell>
                <TableCell align="right">{production.totalDocuments.toLocaleString()}</TableCell>
                <TableCell align="right">{production.totalPages.toLocaleString()}</TableCell>
                <TableCell>
                  {production.batesRange ? (
                    <Typography variant="body2" noWrap>
                      {production.batesRange.start} - {production.batesRange.end}
                    </Typography>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {production.productionDate
                    ? new Date(production.productionDate).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small">
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Production Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Production</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            {productionSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 3 }}>{renderStepContent()}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep((prev) => prev - 1)}>Back</Button>
          )}
          <Button variant="contained" onClick={handleCreateProduction}>
            {activeStep === productionSteps.length - 1 ? 'Create Production' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionManager;
