interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageContainer - React 18 optimized with React.memo
 */
export const PageContainer = React.memo<PageContainerProps>(({ children, className = '' }) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6">
      <div className={`max-w-7xl mx-auto space-y-6 animate-fade-in ${className}`}>
        {children}
      </div>
    </div>
  );
});
