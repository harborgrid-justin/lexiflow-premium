
import React from 'react';
import { CustodianInterview } from '../../../types';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { User, Calendar, CheckSquare } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface InterviewListProps {
  interviews: CustodianInterview[];
  onManage: (interview: CustodianInterview) => void;
}

export const InterviewList: React.FC<InterviewListProps> = ({ interviews, onManage }) => {
  const { theme } = useTheme();

  return (
    <TableContainer>
      <TableHeader>
        <TableHead>Custodian</TableHead>
        <TableHead>Department</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Notes</TableHead>
        <TableHead className="text-right">Action</TableHead>
      </TableHeader>
      <TableBody>
        {interviews.map(int => (
          <TableRow key={int.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <User className={cn("h-4 w-4", theme.text.tertiary)}/>
                <span className={cn("font-bold", theme.text.primary)}>{int.custodianName}</span>
              </div>
            </TableCell>
            <TableCell>{int.department}</TableCell>
            <TableCell>
              <div className={cn("flex items-center text-xs", theme.text.secondary)}>
                <Calendar className="h-3 w-3 mr-1"/> {int.interviewDate || 'Unscheduled'}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={int.status === 'Completed' ? 'success' : int.status === 'Scheduled' ? 'info' : 'warning'}>
                {int.status}
              </Badge>
            </TableCell>
            <TableCell className={cn("max-w-xs truncate text-xs", theme.text.secondary)}>{int.notes}</TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="ghost" icon={CheckSquare} onClick={() => onManage(int)}>Manage</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
};
