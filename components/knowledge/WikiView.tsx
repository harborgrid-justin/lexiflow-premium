import React, { useState, useTransition } from 'react';
import { Search, ChevronRight, Book, Star, Loader2 } from 'lucide-react';
import { DataService } from '../../services/dataService';
import { WikiArticle } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

export const WikiView: React.FC = () => {
  const { theme, mode } = useTheme();
  const [activeArticleId, setActiveArticleId] = useState('ca-employment');
  const [search, setSearch] = useState('');
  const [isPending, startTransition