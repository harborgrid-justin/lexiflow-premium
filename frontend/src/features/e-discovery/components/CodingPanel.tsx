import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface CodingPanelProps {
  document: any;
  onSubmit: (coding: CodingDecision) => void;
  onClose?: () => void;
}

interface CodingDecision {
  responsivenessCode: string;
  privilegeCode: string;
  confidentialityLevel: string;
  issueTags: Array<{ issueId: string; issueName: string; relevance: string }>;
  tags: string[];
  hotDocument: boolean;
  redactionRequired: boolean;
  notes: string;
  reviewTimeSeconds: number;
}

const issueOptions = [
  { id: 'issue-1', name: 'Contract Terms', relevance: 'High' },
  { id: 'issue-2', name: 'Liability', relevance: 'High' },
  { id: 'issue-3', name: 'Damages', relevance: 'Medium' },
  { id: 'issue-4', name: 'Timeline', relevance: 'Low' },
  { id: 'issue-5', name: 'Evidence', relevance: 'High' },
];

const tagOptions = [
  'Key Document',
  'Financial',
  'Communication',
  'Agreement',
  'Policy',
  'Meeting Notes',
  'Internal',
  'External',
];

export const CodingPanel: React.FC<CodingPanelProps> = ({ document, onSubmit, onClose }) => {
  const [startTime] = useState(Date.now());
  const [responsivenessCode, setResponsivenessCode] = useState<string>('not_reviewed');
  const [privilegeCode, setPrivilegeCode] = useState<string>('none');
  const [confidentialityLevel, setConfidentialityLevel] = useState<string>('internal');
  const [selectedIssues, setSelectedIssues] = useState<typeof issueOptions>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hotDocument, setHotDocument] = useState(false);
  const [redactionRequired, setRedactionRequired] = useState(false);
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    const reviewTimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    const coding: CodingDecision = {
      responsivenessCode,
      privilegeCode,
      confidentialityLevel,
      issueTags: selectedIssues.map((issue) => ({
        issueId: issue.id,
        issueName: issue.name,
        relevance: issue.relevance,
      })),
      tags: selectedTags,
      hotDocument,
      redactionRequired,
      notes,
      reviewTimeSeconds,
    };

    setShowSuccess(true);
    setTimeout(() => {
      onSubmit(coding);
      setShowSuccess(false);
    }, 500);
  };

  const isValid = responsivenessCode !== 'not_reviewed';

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Document Coding
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {showSuccess && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ mb: 2 }}
        >
          Coding saved successfully!
        </Alert>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Scrollable Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', pr: 1 }}>
        {/* Responsiveness */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Responsiveness</InputLabel>
          <Select
            value={responsivenessCode}
            onChange={(e) => setResponsivenessCode(e.target.value)}
            label="Responsiveness"
          >
            <MenuItem value="not_reviewed">Not Reviewed</MenuItem>
            <MenuItem value="responsive">Responsive</MenuItem>
            <MenuItem value="partially_responsive">Partially Responsive</MenuItem>
            <MenuItem value="non_responsive">Non-Responsive</MenuItem>
          </Select>
        </FormControl>

        {/* Privilege */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Privilege</InputLabel>
          <Select
            value={privilegeCode}
            onChange={(e) => setPrivilegeCode(e.target.value)}
            label="Privilege"
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="attorney_client">Attorney-Client</MenuItem>
            <MenuItem value="work_product">Work Product</MenuItem>
            <MenuItem value="attorney_client_work_product">Attorney-Client & Work Product</MenuItem>
            <MenuItem value="common_interest">Common Interest</MenuItem>
            <MenuItem value="joint_defense">Joint Defense</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>

        {/* Confidentiality Level */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Confidentiality</InputLabel>
          <Select
            value={confidentialityLevel}
            onChange={(e) => setConfidentialityLevel(e.target.value)}
            label="Confidentiality"
          >
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="internal">Internal</MenuItem>
            <MenuItem value="confidential">Confidential</MenuItem>
            <MenuItem value="highly_confidential">Highly Confidential</MenuItem>
            <MenuItem value="attorneys_eyes_only">Attorneys' Eyes Only</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* Issue Tags */}
        <Typography variant="subtitle2" gutterBottom fontWeight="medium">
          Issue Tags
        </Typography>
        <Autocomplete
          multiple
          options={issueOptions}
          getOptionLabel={(option) => option.name}
          value={selectedIssues}
          onChange={(_, newValue) => setSelectedIssues(newValue)}
          renderInput={(params) => (
            <TextField {...params} placeholder="Select issues" size="small" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.name}
                size="small"
                color={
                  option.relevance === 'High'
                    ? 'error'
                    : option.relevance === 'Medium'
                    ? 'warning'
                    : 'default'
                }
                {...getTagProps({ index })}
              />
            ))
          }
          sx={{ mb: 3 }}
        />

        {/* Document Tags */}
        <Typography variant="subtitle2" gutterBottom fontWeight="medium">
          Document Tags
        </Typography>
        <Autocomplete
          multiple
          freeSolo
          options={tagOptions}
          value={selectedTags}
          onChange={(_, newValue) => setSelectedTags(newValue)}
          renderInput={(params) => (
            <TextField {...params} placeholder="Add tags" size="small" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option} size="small" {...getTagProps({ index })} />
            ))
          }
          sx={{ mb: 3 }}
        />

        <Divider sx={{ my: 2 }} />

        {/* Checkboxes */}
        <FormControlLabel
          control={
            <Checkbox
              checked={hotDocument}
              onChange={(e) => setHotDocument(e.target.checked)}
            />
          }
          label="Hot Document"
          sx={{ mb: 1 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={redactionRequired}
              onChange={(e) => setRedactionRequired(e.target.checked)}
            />
          }
          label="Redaction Required"
          sx={{ mb: 3 }}
        />

        {/* Notes */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Reviewer Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any relevant notes about this document..."
        />
      </Box>

      {/* Actions */}
      <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!isValid}
          startIcon={<SaveIcon />}
        >
          Save & Next
        </Button>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
          Review time: {Math.floor((Date.now() - startTime) / 1000)}s
        </Typography>
      </Box>
    </Box>
  );
};

export default CodingPanel;
