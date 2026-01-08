import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Folder as FolderIcon,
  Assessment as AssessmentIcon,
  CloudDownload as CloudDownloadIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';

interface DiscoveryProject {
  id: string;
  name: string;
  status: string;
  custodianCount: number;
  totalItemsCollected: number;
  totalItemsProcessed: number;
  totalItemsReviewed: number;
  totalItemsProduced: number;
  responsivenessRate: number;
  privilegeRate: number;
  deduplicationRate: number;
  createdAt: Date;
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  totalDocuments: number;
  totalSizeGB: number;
  avgResponseRate: number;
}

export const DiscoveryDashboard: React.FC = () => {
  const [projects, setProjects] = useState<DiscoveryProject[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In production, fetch from API
      // const response = await fetch('/api/discovery/dashboard');
      // const data = await response.json();

      // Mock data for demonstration
      setProjects([
        {
          id: '1',
          name: 'Smith v. Johnson - Discovery',
          status: 'review',
          custodianCount: 15,
          totalItemsCollected: 45000,
          totalItemsProcessed: 42000,
          totalItemsReviewed: 25000,
          totalItemsProduced: 0,
          responsivenessRate: 32.5,
          privilegeRate: 8.2,
          deduplicationRate: 15.3,
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          name: 'SEC Investigation - 2024',
          status: 'processing',
          custodianCount: 8,
          totalItemsCollected: 28000,
          totalItemsProcessed: 18000,
          totalItemsReviewed: 0,
          totalItemsProduced: 0,
          responsivenessRate: 0,
          privilegeRate: 0,
          deduplicationRate: 22.1,
          createdAt: new Date('2024-02-01'),
        },
      ]);

      setStats({
        totalProjects: 12,
        activeProjects: 5,
        totalDocuments: 285000,
        totalSizeGB: 1247.5,
        avgResponseRate: 28.3,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      planning: 'default',
      collection: 'primary',
      processing: 'secondary',
      review: 'warning',
      production: 'success',
      completed: 'success',
    };
    return statusColors[status] || 'default';
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const calculateProgress = (project: DiscoveryProject): number => {
    const weights = {
      collection: 0.25,
      processing: 0.25,
      review: 0.40,
      production: 0.10,
    };

    let progress = 0;

    if (project.totalItemsCollected > 0) {
      progress += weights.collection * 100;
    }

    if (project.totalItemsProcessed > 0) {
      progress += weights.processing * (project.totalItemsProcessed / project.totalItemsCollected) * 100;
    }

    if (project.totalItemsReviewed > 0) {
      progress += weights.review * (project.totalItemsReviewed / project.totalItemsProcessed) * 100;
    }

    if (project.totalItemsProduced > 0) {
      progress += weights.production * 100;
    }

    return Math.min(100, progress);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          E-Discovery Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          New Discovery Project
        </Button>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Projects
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.totalProjects}
                </Typography>
                <Typography variant="caption" color="primary">
                  {stats.activeProjects} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Documents
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatNumber(stats.totalDocuments)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Size
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.totalSizeGB.toFixed(1)} GB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Avg. Response Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.avgResponseRate.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Tooltip title="Collections">
                    <IconButton size="small" color="primary">
                      <FolderIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reports">
                    <IconButton size="small" color="primary">
                      <AssessmentIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export">
                    <IconButton size="small" color="primary">
                      <CloudDownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Projects" />
          <Tab label="Active" />
          <Tab label="In Review" />
          <Tab label="Completed" />
        </Tabs>
      </Card>

      {/* Projects Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Custodians</TableCell>
              <TableCell align="right">Collected</TableCell>
              <TableCell align="right">Processed</TableCell>
              <TableCell align="right">Reviewed</TableCell>
              <TableCell align="right">Response Rate</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {project.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={project.status.toUpperCase()}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{project.custodianCount}</TableCell>
                <TableCell align="right">{formatNumber(project.totalItemsCollected)}</TableCell>
                <TableCell align="right">{formatNumber(project.totalItemsProcessed)}</TableCell>
                <TableCell align="right">{formatNumber(project.totalItemsReviewed)}</TableCell>
                <TableCell align="right">
                  {project.responsivenessRate > 0 ? `${project.responsivenessRate.toFixed(1)}%` : '-'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(project)}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {calculateProgress(project).toFixed(0)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Open Project">
                      <IconButton size="small">
                        <FolderIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Settings">
                      <IconButton size="small">
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DiscoveryDashboard;
