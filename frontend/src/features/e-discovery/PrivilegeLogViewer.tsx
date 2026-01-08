import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

interface PrivilegeLogEntry {
  id: string;
  privilegeLogNumber: string;
  batesNumber: string;
  documentDate: Date;
  author: string;
  sender: string;
  recipients: string[];
  subject: string;
  privilegeType: string;
  privilegeBasis: string;
  status: string;
}

export const PrivilegeLogViewer: React.FC = () => {
  const [entries, setEntries] = useState<PrivilegeLogEntry[]>([
    {
      id: '1',
      privilegeLogNumber: 'PRIV-001',
      batesNumber: 'ABC0001234',
      documentDate: new Date('2024-01-15'),
      author: 'John Smith',
      sender: 'john.smith@company.com',
      recipients: ['attorney@lawfirm.com'],
      subject: 'Legal advice regarding contract terms',
      privilegeType: 'attorney_client',
      privilegeBasis: 'Communication between client and attorney seeking legal advice',
      status: 'claimed',
    },
    {
      id: '2',
      privilegeLogNumber: 'PRIV-002',
      batesNumber: 'ABC0002456',
      documentDate: new Date('2024-01-20'),
      author: 'Jane Doe',
      sender: 'jane.doe@company.com',
      recipients: ['counsel@lawfirm.com'],
      subject: 'Draft litigation strategy memo',
      privilegeType: 'work_product',
      privilegeBasis: 'Attorney work product prepared in anticipation of litigation',
      status: 'claimed',
    },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getPrivilegeTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      attorney_client: 'Attorney-Client',
      work_product: 'Work Product',
      attorney_client_work_product: 'Attorney-Client & Work Product',
      common_interest: 'Common Interest',
      joint_defense: 'Joint Defense',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      claimed: 'primary',
      challenged: 'warning',
      upheld: 'success',
      waived: 'default',
      overruled: 'error',
    };
    return colors[status] || 'default';
  };

  const handleExport = () => {
    console.log('Exporting privilege log...');
    // In production, generate and download Excel/PDF
  };

  const filteredEntries = entries.filter((entry) => {
    if (filterType !== 'all' && entry.privilegeType !== filterType) return false;
    if (filterStatus !== 'all' && entry.status !== filterStatus) return false;
    if (searchTerm && !entry.subject.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Privilege Log
        </Typography>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
          Export Log
        </Button>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Entries
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {entries.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Attorney-Client
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {entries.filter((e) => e.privilegeType.includes('attorney_client')).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Work Product
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {entries.filter((e) => e.privilegeType.includes('work_product')).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Challenged
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {entries.filter((e) => e.status === 'challenged').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search by subject or Bates number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Privilege Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Privilege Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="attorney_client">Attorney-Client</MenuItem>
                  <MenuItem value="work_product">Work Product</MenuItem>
                  <MenuItem value="attorney_client_work_product">
                    Attorney-Client & Work Product
                  </MenuItem>
                  <MenuItem value="common_interest">Common Interest</MenuItem>
                  <MenuItem value="joint_defense">Joint Defense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="claimed">Claimed</MenuItem>
                  <MenuItem value="challenged">Challenged</MenuItem>
                  <MenuItem value="upheld">Upheld</MenuItem>
                  <MenuItem value="waived">Waived</MenuItem>
                  <MenuItem value="overruled">Overruled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Privilege Log Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Log #</TableCell>
              <TableCell>Bates #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Author/Sender</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>{entry.privilegeLogNumber}</TableCell>
                <TableCell>{entry.batesNumber}</TableCell>
                <TableCell>{new Date(entry.documentDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Typography variant="body2">{entry.author}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {entry.sender}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {entry.recipients.join(', ')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                    {entry.subject}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getPrivilegeTypeLabel(entry.privilegeType)}
                    size="small"
                    color="secondary"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.status.toUpperCase()}
                    size="small"
                    color={getStatusColor(entry.status)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small">
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
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

export default PrivilegeLogViewer;
