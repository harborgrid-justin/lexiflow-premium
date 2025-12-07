
import React, { useState } from 'react';
import { KanbanBoard, KanbanColumn, KanbanCard } from '../common/Kanban';
import { Plus, Calendar, DollarSign, User, Briefcase, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService }