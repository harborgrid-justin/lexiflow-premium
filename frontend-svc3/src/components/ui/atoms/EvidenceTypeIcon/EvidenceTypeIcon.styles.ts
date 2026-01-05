export const getIconClass = (type: string, className: string) => {
  let colorClass = '';
  switch(type) {
    case 'Physical': colorClass = 'text-amber-600'; break;
    case 'Digital': colorClass = 'text-blue-600'; break;
    case 'Document': colorClass = 'text-slate-600'; break;
    default: colorClass = 'text-purple-600'; break;
  }
  return `${colorClass} ${className}`;
};
