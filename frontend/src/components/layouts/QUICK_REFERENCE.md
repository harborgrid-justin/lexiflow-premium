# Layout Quick Reference

## 🚀 Import Syntax
```tsx
import { 
  AppShellLayout,
  PageContainerLayout,
  TabbedPageLayout,
  ManagerLayout,
  SplitViewLayout,
  TwoColumnLayout,
  ThreeColumnLayout,
  GridLayout,
  StackLayout,
  CenteredLayout,
  StickyHeaderLayout
} from '@/components/layouts';
```

## 📋 Layout Cheat Sheet

| Layout | Props | Best For |
|--------|-------|----------|
| **AppShellLayout** | `sidebar`, `headerContent`, `children`, `activeView`, `selectedCaseId` | Full app wrapper |
| **PageContainerLayout** | `children`, `maxWidth`, `className` | Simple pages |
| **TabbedPageLayout** | `pageTitle`, `tabConfig`, `activeTabId`, `onTabChange`, `children` | Multi-section pages |
| **ManagerLayout** | `title`, `actions`, `filterPanel`, `sidebar`, `children`, `sidebarWidth` | Management UIs |
| **SplitViewLayout** | `sidebar`, `content`, `sidebarPosition`, `sidebarWidth` | List/Detail views |
| **TwoColumnLayout** | `leftColumn`, `rightColumn`, `leftWidth`, `gap` | Side-by-side |
| **ThreeColumnLayout** | `leftColumn`, `centerColumn`, `rightColumn`, `leftWidth`, `rightWidth` | Multi-panel |
| **GridLayout** | `children`, `columns`, `gap`, `autoFit`, `minItemWidth` | Card grids |
| **StackLayout** | `children`, `direction`, `spacing`, `align`, `justify` | Linear flow |
| **CenteredLayout** | `children`, `maxWidth`, `verticalCenter` | Auth, empty states |
| **StickyHeaderLayout** | `header`, `children` | Long content |

## 🎯 Common Patterns

### Pattern: Dashboard Page
```tsx
<PageContainerLayout maxWidth="7xl">
  <GridLayout columns={3} gap="lg">
    <MetricCard />
    <MetricCard />
    <MetricCard />
  </GridLayout>
</PageContainerLayout>
```

### Pattern: Document Manager
```tsx
<ManagerLayout
  title="Documents"
  sidebar={<FolderTree />}
  filterPanel={<Filters />}
  actions={<UploadButton />}
>
  <GridLayout columns={4} gap="md">
    {documents.map(doc => <DocumentCard {...doc} />)}
  </GridLayout>
</ManagerLayout>
```

### Pattern: Email/Inbox Interface
```tsx
<SplitViewLayout
  sidebar={<MessageList />}
  content={<MessageDetail />}
  sidebarWidth="md"
  sidebarPosition="left"
/>
```

### Pattern: Editor with Preview
```tsx
<TwoColumnLayout
  leftColumn={<CodeEditor />}
  rightColumn={<LivePreview />}
  leftWidth="1/2"
  gap="md"
/>
```

### Pattern: Form with Actions
```tsx
<StackLayout direction="vertical" spacing="lg">
  <Input label="Name" />
  <Input label="Email" />
  <Textarea label="Message" />
  <StackLayout direction="horizontal" spacing="sm" justify="end">
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </StackLayout>
</StackLayout>
```

### Pattern: Login Page
```tsx
<CenteredLayout maxWidth="md" verticalCenter>
  <Card>
    <CardHeader title="Sign In" />
    <CardContent>
      <StackLayout direction="vertical" spacing="md">
        <Input label="Email" type="email" />
        <Input label="Password" type="password" />
        <Button>Sign In</Button>
      </StackLayout>
    </CardContent>
  </Card>
</CenteredLayout>
```

### Pattern: Tabbed Dashboard
```tsx
<TabbedPageLayout
  pageTitle="Analytics"
  pageSubtitle="View insights and metrics"
  pageActions={<ExportButton />}
  tabConfig={ANALYTICS_TABS}
  activeTabId={activeTab}
  onTabChange={setActiveTab}
>
  <GridLayout columns={2} gap="lg">
    <ChartCard />
    <ChartCard />
  </GridLayout>
</TabbedPageLayout>
```

### Pattern: Three-Panel Workflow
```tsx
<ThreeColumnLayout
  leftColumn={<NavigationTree />}
  centerColumn={<ContentEditor />}
  rightColumn={<PropertiesPanel />}
  leftWidth="md"
  rightWidth="md"
  gap="none"
/>
```

## 🔄 Migration Guide

### From Templates
```tsx
// OLD
import { AppShell } from '@/components/templates/AppShell';
import { PageContainer } from '@/components/templates/PageContainer';
import { TabbedPageLayout } from '@/components/templates/TabbedPageLayout';
import { ManagerLayout } from '@/components/templates/ManagerLayout';

// NEW
import { 
  AppShellLayout,
  PageContainerLayout, 
  TabbedPageLayout,
  ManagerLayout 
} from '@/components/layouts';
```

### From SplitView Organism
```tsx
// OLD
import { SplitView } from '@/components/organisms/SplitView';

// NEW
import { SplitViewLayout } from '@/components/layouts';

// Usage stays similar, just renamed props
<SplitViewLayout sidebar={...} content={...} />
```

## 📱 Responsive Behavior

| Layout | Mobile (< 768px) | Tablet (768px+) | Desktop (1024px+) |
|--------|------------------|-----------------|-------------------|
| SplitViewLayout | Single column* | Side-by-side | Side-by-side |
| TwoColumnLayout | Stacked* | Side-by-side | Side-by-side |
| ThreeColumnLayout | Center only | Left + Center | All columns |
| GridLayout | 1 column | 2 columns | 3-4+ columns |
| ManagerLayout | No sidebar | With sidebar | With sidebar |

*Configurable via props

## 🎨 Width Options

### PageContainerLayout maxWidth
- `sm`: 384px (24rem)
- `md`: 448px (28rem)
- `lg`: 512px (32rem)
- `xl`: 576px (36rem)
- `2xl`: 672px (42rem)
- `3xl`: 768px (48rem)
- `4xl`: 896px (56rem)
- `5xl`: 1024px (64rem)
- `6xl`: 1152px (72rem)
- `7xl`: 1280px (80rem) ← **default**
- `full`: 100%

### Sidebar/Column Widths
- `sm`: 224px (14rem)
- `md`: 256px (16rem) ← **default**
- `lg`: 384px (24rem)
- `xl`: 448px (28rem)

### Gap Sizes
- `none`: 0
- `xs`: 4px (0.25rem)
- `sm`: 8px (0.5rem)
- `md`: 16px (1rem) ← **default**
- `lg`: 24px (1.5rem)
- `xl`: 32px (2rem)

## ⚡ Performance Tips

1. **Lazy Load Content**: Use `React.lazy()` for heavy content in layouts
   ```tsx
   const HeavyContent = lazy(() => import('./HeavyContent'));
   ```

2. **Memo Layout Children**: Wrap expensive children with `React.memo()`
   ```tsx
   const MemoizedSidebar = memo(Sidebar);
   ```

3. **Virtualize Long Lists**: Use VirtualList in Grid or Stack layouts
   ```tsx
   <GridLayout>
     <VirtualList items={1000} renderItem={...} />
   </GridLayout>
   ```

4. **CSS Containment**: AppShellLayout already uses `contain: strict`

## 🐛 Troubleshooting

### Issue: Content overflowing layout
**Solution**: Ensure parent has defined height and use `overflow-auto`

### Issue: Sidebar not showing on mobile
**Solution**: Set `showSidebarOnMobile={true}` on SplitViewLayout

### Issue: Grid columns not responsive
**Solution**: Use `autoFit` prop or predefined column counts (1-6)

### Issue: Theme colors not applying
**Solution**: Ensure ThemeProvider wraps the layout

### Issue: Sticky header not sticking
**Solution**: Use StickyHeaderLayout instead of custom sticky positioning

## 🔗 Related Resources

- **Components**: `/frontend/src/components/`
- **Pages**: `/frontend/src/components/pages/`
- **Templates**: `/frontend/src/components/templates/` (deprecated)
- **Docs**: `/frontend/src/components/layouts/README.md`

---

**Quick Access**: `@/components/layouts`  
**Total Layouts**: 11  
**Status**: ✅ Production Ready
