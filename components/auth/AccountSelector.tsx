/**
 * AccountSelector Component
 * Allows users to select from multiple accounts or organizations
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface Account {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: string;
  organizationName?: string;
  avatar?: string;
  isDefault?: boolean;
}

interface AccountSelectorProps {
  open: boolean;
  accounts: Account[];
  onSelect: (account: Account) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  open,
  accounts,
  onSelect,
  onClose,
  title = 'Select an Account',
  subtitle = 'Choose which account you want to use',
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (account: Account) => {
    setSelectedId(account.id);
    // Small delay for visual feedback
    setTimeout(() => {
      onSelect(account);
      setSelectedId(null);
    }, 200);
  };

  const getRoleBadgeColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'partner':
        return 'primary';
      case 'attorney':
        return 'success';
      case 'paralegal':
        return 'info';
      case 'staff':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      {/* Header */}
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      {/* Account List */}
      <DialogContent sx={{ p: 0 }}>
        <List sx={{ p: 0 }}>
          {accounts.map((account, index) => (
            <React.Fragment key={account.id}>
              <ListItem
                disablePadding
                sx={{
                  bgcolor: selectedId === account.id ? 'action.selected' : 'transparent',
                }}
              >
                <ListItemButton
                  onClick={() => handleSelect(account)}
                  sx={{ py: 2, px: 3 }}
                >
                  {/* Avatar */}
                  <ListItemAvatar>
                    <Avatar
                      src={account.avatar}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: account.organizationId ? 'primary.main' : 'secondary.main',
                      }}
                    >
                      {account.organizationId ? (
                        <BusinessIcon />
                      ) : (
                        <PersonIcon />
                      )}
                    </Avatar>
                  </ListItemAvatar>

                  {/* Account Info */}
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {account.name}
                        </Typography>
                        {account.isDefault && (
                          <Chip
                            label="Default"
                            size="small"
                            color="primary"
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {account.email}
                        </Typography>
                        {account.organizationName && (
                          <Typography variant="caption" color="text.secondary">
                            {account.organizationName}
                          </Typography>
                        )}
                      </Box>
                    }
                  />

                  {/* Role Badge */}
                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={account.role}
                      size="small"
                      color={getRoleBadgeColor(account.role)}
                      variant="outlined"
                    />
                    {selectedId === account.id && (
                      <CheckCircleIcon color="primary" />
                    )}
                  </Box>
                </ListItemButton>
              </ListItem>
              {index < accounts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* Empty State */}
        {accounts.length === 0 && (
          <Box
            sx={{
              py: 6,
              px: 3,
              textAlign: 'center',
            }}
          >
            <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No accounts available
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccountSelector;
