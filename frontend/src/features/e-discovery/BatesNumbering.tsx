import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface BatesJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  documentsNumbered: number;
  totalDocuments: number;
  batesRange: { start: string; end: string } | null;
  startTime: Date;
  endTime?: Date;
}

export const BatesNumbering: React.FC = () => {
  const [prefix, setPrefix] = useState('PROD');
  const [startNumber, setStartNumber] = useState(1);
  const [numberLength, setNumberLength] = useState(7);
  const [suffix, setSuffix] = useState('');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [estimatedDocs, setEstimatedDocs] = useState(1200);
  const [jobs, setJobs] = useState<BatesJob[]>([]);

  const generatePreview = (): string => {
    const paddedNumber = startNumber.toString().padStart(numberLength, '0');
    let preview = `${prefix}${paddedNumber}`;
    if (suffix) {
      preview += suffix;
    }
    if (includePageNumbers) {
      preview += '.0001';
    }
    return preview;
  };

  const generateEndPreview = (): string => {
    const endNumber = startNumber + estimatedDocs - 1;
    const paddedNumber = endNumber.toString().padStart(numberLength, '0');
    let preview = `${prefix}${paddedNumber}`;
    if (suffix) {
      preview += suffix;
    }
    if (includePageNumbers) {
      preview += '.9999';
    }
    return preview;
  };

  const handleApplyNumbering = async () => {
    const newJob: BatesJob = {
      id: `job-${Date.now()}`,
      status: 'pending',
      documentsNumbered: 0,
      totalDocuments: estimatedDocs,
      batesRange: null,
      startTime: new Date(),
    };

    setJobs([newJob, ...jobs]);

    // Simulate numbering process
    setTimeout(() => {
      const updatedJob = {
        ...newJob,
        status: 'running' as const,
      };
      setJobs([updatedJob, ...jobs.slice(1)]);
    }, 500);

    setTimeout(() => {
      const completedJob = {
        ...newJob,
        status: 'completed' as const,
        documentsNumbered: estimatedDocs,
        batesRange: {
          start: generatePreview(),
          end: generateEndPreview(),
        },
        endTime: new Date(),
      };
      setJobs([completedJob, ...jobs.slice(1)]);
    }, 3000);
  };

  const isValid = prefix.length > 0 && /^[A-Z]+$/.test(prefix);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
        Bates Numbering
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Numbering Configuration
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Prefix"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    helperText="Uppercase letters only"
                    error={!isValid && prefix.length > 0}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Number"
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Number Length</InputLabel>
                    <Select
                      value={numberLength}
                      onChange={(e) => setNumberLength(e.target.value as number)}
                      label="Number Length"
                    >
                      <MenuItem value={4}>4 digits</MenuItem>
                      <MenuItem value={5}>5 digits</MenuItem>
                      <MenuItem value={6}>6 digits</MenuItem>
                      <MenuItem value={7}>7 digits</MenuItem>
                      <MenuItem value={8}>8 digits</MenuItem>
                      <MenuItem value={9}>9 digits</MenuItem>
                      <MenuItem value={10}>10 digits</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Suffix (Optional)"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value.toUpperCase())}
                    helperText="Uppercase letters only"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includePageNumbers}
                        onChange={(e) => setIncludePageNumbers(e.target.checked)}
                      />
                    }
                    label="Include page numbers (e.g., .0001)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Estimated Document Count"
                    type="number"
                    value={estimatedDocs}
                    onChange={(e) => setEstimatedDocs(parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleApplyNumbering}
                  disabled={!isValid}
                  startIcon={<PlayIcon />}
                >
                  Apply Bates Numbering
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>

              <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  First Document
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
                  {generatePreview()}
                </Typography>

                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Last Document (estimated)
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {generateEndPreview()}
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Format Breakdown:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <li>Prefix: {prefix || '(none)'}</li>
                  <li>
                    Number: {numberLength} digits, starting at {startNumber}
                  </li>
                  <li>Suffix: {suffix || '(none)'}</li>
                  <li>Page Numbers: {includePageNumbers ? 'Yes' : 'No'}</li>
                </Box>
              </Alert>

              <Alert severity="warning" sx={{ mt: 2 }}>
                Bates numbering is permanent. Please verify your configuration before applying.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Jobs History */}
        {jobs.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Numbering Jobs
                </Typography>

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Job ID</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Progress</TableCell>
                        <TableCell>Bates Range</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>{job.id}</TableCell>
                          <TableCell>
                            <Chip
                              label={job.status.toUpperCase()}
                              color={
                                job.status === 'completed'
                                  ? 'success'
                                  : job.status === 'failed'
                                  ? 'error'
                                  : job.status === 'running'
                                  ? 'warning'
                                  : 'default'
                              }
                              size="small"
                              icon={job.status === 'completed' ? <CheckCircleIcon /> : undefined}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {job.documentsNumbered} / {job.totalDocuments}
                          </TableCell>
                          <TableCell>
                            {job.batesRange ? (
                              <Typography variant="body2" noWrap>
                                {job.batesRange.start} - {job.batesRange.end}
                              </Typography>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{job.startTime.toLocaleTimeString()}</TableCell>
                          <TableCell>
                            {job.endTime ? job.endTime.toLocaleTimeString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default BatesNumbering;
