import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Toolbar,
  Divider,
  Chip,
  LinearProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { CodingPanel } from './components/CodingPanel';

interface ReviewDocument {
  id: string;
  batesNumber: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  custodian: string;
  documentDate: Date;
  subject?: string;
  sender?: string;
  recipients?: string[];
  extractedText: string;
  reviewStatus: string;
  responsivenessCode: string;
  privilegeCode: string;
  issueTags: Array<{ issueId: string; issueName: string }>;
  tags: string[];
  hotDocument: boolean;
  pageCount: number;
  tarScore?: number;
}

interface ReviewSession {
  projectId: string;
  projectName: string;
  totalDocuments: number;
  reviewedDocuments: number;
  assignedDocuments: string[];
  currentIndex: number;
}

export const ReviewPlatform: React.FC = () => {
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [currentDocument, setCurrentDocument] = useState<ReviewDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showCodingPanel, setShowCodingPanel] = useState(true);

  useEffect(() => {
    loadReviewSession();
  }, []);

  const loadReviewSession = async () => {
    try {
      setLoading(true);
      // In production, fetch from API
      // const response = await fetch('/api/discovery/review/session');
      // const data = await response.json();

      // Mock data
      const mockSession: ReviewSession = {
        projectId: 'proj-1',
        projectName: 'Smith v. Johnson Discovery',
        totalDocuments: 500,
        reviewedDocuments: 125,
        assignedDocuments: Array.from({ length: 500 }, (_, i) => `doc-${i + 1}`),
        currentIndex: 125,
      };

      setSession(mockSession);
      await loadDocument(mockSession.assignedDocuments[mockSession.currentIndex]);
    } catch (error) {
      console.error('Failed to load review session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocument = async (documentId: string) => {
    try {
      setLoading(true);
      // In production, fetch from API
      // const response = await fetch(`/api/discovery/documents/${documentId}`);
      // const data = await response.json();

      // Mock data
      const mockDoc: ReviewDocument = {
        id: documentId,
        batesNumber: `ABC${String(parseInt(documentId.split('-')[1]) + 1000).padStart(7, '0')}`,
        fileName: 'Email_Meeting_Notes_2024.eml',
        fileType: 'email',
        fileSize: 45678,
        custodian: 'John Smith',
        documentDate: new Date('2024-01-15T14:30:00'),
        subject: 'RE: Q4 Financial Review Meeting',
        sender: 'john.smith@company.com',
        recipients: ['jane.doe@company.com', 'bob.johnson@company.com'],
        extractedText: `From: john.smith@company.com
To: jane.doe@company.com; bob.johnson@company.com
Subject: RE: Q4 Financial Review Meeting
Date: January 15, 2024 2:30 PM

Jane and Bob,

Following up on our discussion this morning regarding the Q4 financial review. I've attached the preliminary numbers for your review.

Key points:
- Revenue increased 12% YoY
- Operating expenses up 8%
- Net margin improved to 15.2%

Please review and let me know if you have any questions before the board meeting on Friday.

Best regards,
John

CONFIDENTIAL - ATTORNEY CLIENT PRIVILEGED`,
        reviewStatus: 'not_started',
        responsivenessCode: 'not_reviewed',
        privilegeCode: 'none',
        issueTags: [],
        tags: [],
        hotDocument: false,
        pageCount: 1,
        tarScore: 0.75,
      };

      setCurrentDocument(mockDoc);
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (!session || session.currentIndex === 0) return;

    const newIndex = session.currentIndex - 1;
    setSession({ ...session, currentIndex: newIndex });
    loadDocument(session.assignedDocuments[newIndex]);
  };

  const handleNext = () => {
    if (!session || session.currentIndex >= session.assignedDocuments.length - 1) return;

    const newIndex = session.currentIndex + 1;
    setSession({ ...session, currentIndex: newIndex });
    loadDocument(session.assignedDocuments[newIndex]);
  };

  const handleToggleHotDoc = () => {
    if (!currentDocument) return;
    setCurrentDocument({ ...currentDocument, hotDocument: !currentDocument.hotDocument });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(200, prev + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(50, prev - 10));
  };

  const handleCodingSubmit = async (coding: any) => {
    if (!session || !currentDocument) return;

    try {
      // In production, submit to API
      // await fetch(`/api/discovery/documents/${currentDocument.id}/code`, {
      //   method: 'POST',
      //   body: JSON.stringify(coding),
      // });

      console.log('Coding submitted:', coding);

      // Update session progress
      setSession({
        ...session,
        reviewedDocuments: session.reviewedDocuments + 1,
      });

      // Move to next document
      handleNext();
    } catch (error) {
      console.error('Failed to submit coding:', error);
    }
  };

  if (loading && !currentDocument) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!session || !currentDocument) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No review session active</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {session.projectName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Document {session.currentIndex + 1} of {session.totalDocuments}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(session.reviewedDocuments / session.totalDocuments) * 100}
              sx={{ width: 200, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="primary" fontWeight="medium">
              {((session.reviewedDocuments / session.totalDocuments) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Toolbar>
      </Box>

      {/* Document Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default', p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handlePrevious} disabled={session.currentIndex === 0}>
              <PrevIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              disabled={session.currentIndex >= session.totalDocuments - 1}
            >
              <NextIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <IconButton onClick={handleToggleHotDoc} color={currentDocument.hotDocument ? 'warning' : 'default'}>
              {currentDocument.hotDocument ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
            <IconButton onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
            <Typography variant="body2">{zoomLevel}%</Typography>
            <IconButton onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={currentDocument.batesNumber}
              color="primary"
              size="small"
            />
            {currentDocument.tarScore && (
              <Chip
                label={`TAR: ${(currentDocument.tarScore * 100).toFixed(0)}%`}
                color={currentDocument.tarScore > 0.7 ? 'success' : 'warning'}
                size="small"
              />
            )}
            <Tooltip title="Download">
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton size="small">
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fullscreen">
              <IconButton size="small">
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Document Viewer */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Card>
            <CardContent>
              {/* Document Metadata */}
              <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      File Name
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {currentDocument.fileName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Custodian
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {currentDocument.custodian}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Date
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {new Date(currentDocument.documentDate).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Size
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {(currentDocument.fileSize / 1024).toFixed(1)} KB
                    </Typography>
                  </Grid>
                  {currentDocument.subject && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">
                        Subject
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {currentDocument.subject}
                      </Typography>
                    </Grid>
                  )}
                  {currentDocument.sender && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="textSecondary">
                        From
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {currentDocument.sender}
                      </Typography>
                    </Grid>
                  )}
                  {currentDocument.recipients && currentDocument.recipients.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="textSecondary">
                        To
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {currentDocument.recipients.join(', ')}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Document Content */}
              <Box
                sx={{
                  fontSize: `${zoomLevel}%`,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {currentDocument.extractedText}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Coding Panel */}
        {showCodingPanel && (
          <Box
            sx={{
              width: 400,
              borderLeft: 1,
              borderColor: 'divider',
              overflow: 'auto',
              bgcolor: 'background.default',
            }}
          >
            <CodingPanel
              document={currentDocument}
              onSubmit={handleCodingSubmit}
              onClose={() => setShowCodingPanel(false)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReviewPlatform;
