import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface TARModel {
  id: string;
  modelName: string;
  modelVersion: string;
  status: string;
  totalTrainingDocs: number;
  positiveTrainingDocs: number;
  negativeTrainingDocs: number;
  currentPrecision: number;
  currentRecall: number;
  f1Score: number;
  documentsScored: number;
  isStabilized: boolean;
  currentIteration: number;
}

interface PerformanceMetric {
  iteration: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingDocsAdded: number;
}

export const TARTrainingPanel: React.FC = () => {
  const [model, setModel] = useState<TARModel | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetric[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [modelName, setModelName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTARModel();
  }, []);

  const loadTARModel = async () => {
    // Mock data
    setModel({
      id: 'tar-1',
      modelName: 'Smith v. Johnson TAR Model',
      modelVersion: '1.3',
      status: 'active',
      totalTrainingDocs: 250,
      positiveTrainingDocs: 120,
      negativeTrainingDocs: 130,
      currentPrecision: 0.82,
      currentRecall: 0.78,
      f1Score: 0.80,
      documentsScored: 15000,
      isStabilized: true,
      currentIteration: 5,
    });

    setPerformanceHistory([
      { iteration: 1, precision: 0.65, recall: 0.70, f1Score: 0.67, trainingDocsAdded: 50 },
      { iteration: 2, precision: 0.72, recall: 0.73, f1Score: 0.72, trainingDocsAdded: 50 },
      { iteration: 3, precision: 0.77, recall: 0.75, f1Score: 0.76, trainingDocsAdded: 50 },
      { iteration: 4, precision: 0.80, recall: 0.77, f1Score: 0.78, trainingDocsAdded: 50 },
      { iteration: 5, precision: 0.82, recall: 0.78, f1Score: 0.80, trainingDocsAdded: 50 },
    ]);
  };

  const handleCreateModel = async () => {
    setLoading(true);
    // In production, create model via API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShowCreateDialog(false);
    setLoading(false);
    loadTARModel();
  };

  const handleTrainModel = async () => {
    if (!model) return;
    setLoading(true);
    // In production, train model via API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    loadTARModel();
  };

  const handleScoreDocuments = async () => {
    if (!model) return;
    setLoading(true);
    // In production, score documents via API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    loadTARModel();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      training: 'warning',
      active: 'success',
      paused: 'default',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  if (!model) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No TAR Model Active
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 3 }}>
              Create a Technology Assisted Review model to leverage machine learning for document review
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => setShowCreateDialog(true)}
            >
              Create TAR Model
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            TAR Training Panel
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            {model.modelName} - Version {model.modelVersion}
          </Typography>
        </Box>
        <Chip
          label={model.status.toUpperCase()}
          color={getStatusColor(model.status)}
          icon={model.isStabilized ? <CheckCircleIcon /> : <WarningIcon />}
        />
      </Box>

      {/* Status Alert */}
      {model.isStabilized ? (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
          Model has stabilized! Performance is consistent and ready for production use.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Model is still training. Add more training documents to improve performance.
        </Alert>
      )}

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Precision
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {(model.currentPrecision * 100).toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={model.currentPrecision * 100}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Recall
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {(model.currentRecall * 100).toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={model.currentRecall * 100}
                color="success"
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                F1 Score
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="secondary">
                {(model.f1Score * 100).toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={model.f1Score * 100}
                color="secondary"
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Documents Scored
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {model.documentsScored.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Iteration {model.currentIteration}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Training Data */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Training Documents
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {model.totalTrainingDocs}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total training docs
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {model.positiveTrainingDocs}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Responsive
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main" fontWeight="bold">
                      {model.negativeTrainingDocs}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Non-Responsive
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(model.positiveTrainingDocs / model.totalTrainingDocs) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                {((model.positiveTrainingDocs / model.totalTrainingDocs) * 100).toFixed(1)}% positive
                training examples
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Add Training Documents"
                    secondary="Review and code documents to improve model accuracy"
                  />
                  <Button variant="outlined" startIcon={<PlayIcon />}>
                    Start
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Train Model"
                    secondary="Run training iteration with current training set"
                  />
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={handleTrainModel}
                    disabled={loading}
                  >
                    Train
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Score Documents"
                    secondary="Apply model predictions to remaining documents"
                  />
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleScoreDocuments}
                    disabled={loading}
                  >
                    Score
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Iteration</TableCell>
                  <TableCell align="right">Precision</TableCell>
                  <TableCell align="right">Recall</TableCell>
                  <TableCell align="right">F1 Score</TableCell>
                  <TableCell align="right">Training Docs Added</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceHistory.map((metric) => (
                  <TableRow key={metric.iteration}>
                    <TableCell>{metric.iteration}</TableCell>
                    <TableCell align="right">{(metric.precision * 100).toFixed(1)}%</TableCell>
                    <TableCell align="right">{(metric.recall * 100).toFixed(1)}%</TableCell>
                    <TableCell align="right">{(metric.f1Score * 100).toFixed(1)}%</TableCell>
                    <TableCell align="right">{metric.trainingDocsAdded}</TableCell>
                    <TableCell>
                      {metric.iteration === model.currentIteration && (
                        <Chip label="Current" color="primary" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Model Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
        <DialogTitle>Create TAR Model</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Model Name"
            fullWidth
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateModel} disabled={loading || !modelName}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TARTrainingPanel;
