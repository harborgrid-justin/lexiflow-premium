
import { PATHS } from '../constants/paths';

export const HolographicRouting = {
  /**
   * Resolves a specific tab/view within a module based on the user's natural language context.
   * This enables "Deep Linking" via Neural Commands.
   */
  resolveTab: (moduleId: string, context: string = ''): string | undefined => {
    const ctx = context.toLowerCase();
    
    // --- MAIN MODULES ---
    
    if (moduleId === PATHS.DASHBOARD) {
      if (ctx.includes('money') || ctx.includes('financ') || ctx.includes('bill') || ctx.includes('revenue')) return 'financials';
      if (ctx.includes('task') || ctx.includes('todo') || ctx.includes('work')) return 'tasks';
      if (ctx.includes('alert') || ctx.includes('notif')) return 'notifications';
      return 'overview';
    }

    if (moduleId === PATHS.CASES) {
        if (ctx.includes('docket') || ctx.includes('calendar')) return 'docket';
        if (ctx.includes('task') || ctx.includes('todo')) return 'tasks';
        if (ctx.includes('intake') || ctx.includes('lead') || ctx.includes('new')) return 'intake';
        if (ctx.includes('conflict') || ctx.includes('check')) return 'conflicts';
        if (ctx.includes('resource') || ctx.includes('staff')) return 'resources';
        if (ctx.includes('trust') || ctx.includes('account') || ctx.includes('iolta')) return 'trust';
        if (ctx.includes('expert')) return 'experts';
        if (ctx.includes('report') || ctx.includes('steno')) return 'reporters';
        if (ctx.includes('clos') || ctx.includes('binder')) return 'closing';
        if (ctx.includes('archiv') || ctx.includes('old') || ctx.includes('cold')) return 'archived';
        return 'active';
    }

    if (moduleId === PATHS.WORKFLOWS) {
        if (ctx.includes('template') || ctx.includes('library')) return 'templates';
        if (ctx.includes('firm') || ctx.includes('process')) return 'firm';
        if (ctx.includes('op') || ctx.includes('center')) return 'ops_center';
        if (ctx.includes('anal') || ctx.includes('stat') || ctx.includes('metric')) return 'analytics';
        if (ctx.includes('conf') || ctx.includes('setting')) return 'settings';
        return 'cases';
    }

    if (moduleId === PATHS.CORRESPONDENCE) {
        if (ctx.includes('serv') || ctx.includes('process') || ctx.includes('job')) return 'process';
        return 'communications';
    }

    // --- LITIGATION TOOLS ---

    if (moduleId === PATHS.EXHIBITS) {
        if (ctx.includes('sticker') || ctx.includes('label') || ctx.includes('design')) return 'sticker';
        if (ctx.includes('stat') || ctx.includes('anal') || ctx.includes('count')) return 'stats';
        return 'list';
    }

    if (moduleId === PATHS.ANALYTICS) {
        if (ctx.includes('counsel') || ctx.includes('oppos') || ctx.includes('firm')) return 'counsel';
        if (ctx.includes('predict') || ctx.includes('outcome') || ctx.includes('forecast')) return 'prediction';
        return 'judge';
    }

    if (moduleId === PATHS.CITATIONS) {
        if (ctx.includes('shep') || ctx.includes('key') || ctx.includes('check') || ctx.includes('signal')) return 'shepard';
        if (ctx.includes('blue') || ctx.includes('format')) return 'bluebook';
        return 'library';
    }

    if (moduleId === PATHS.WAR_ROOM) {
      if (ctx.includes('evid') || ctx.includes('wall')) return 'evidence';
      if (ctx.includes('witness')) return 'witnesses';
      if (ctx.includes('binder') || ctx.includes('notebook')) return 'binder';
      if (ctx.includes('oppos') || ctx.includes('intel')) return 'opposition';
      if (ctx.includes('adv') || ctx.includes('expert')) return 'advisory';
      return 'command';
    }

    if (moduleId === PATHS.DISCOVERY) {
      if (ctx.includes('request') || ctx.includes('rog') || ctx.includes('rfa')) return 'requests';
      if (ctx.includes('depos') || ctx.includes('witnes')) return 'depositions';
      if (ctx.includes('prod')) return 'productions';
      if (ctx.includes('esi') || ctx.includes('data')) return 'esi';
      if (ctx.includes('privilege')) return 'privilege';
      if (ctx.includes('hold')) return 'holds';
      if (ctx.includes('interview')) return 'interviews';
      return 'dashboard';
    }

    if (moduleId === PATHS.EVIDENCE) {
      if (ctx.includes('custody') || ctx.includes('chain')) return 'custody';
      if (ctx.includes('invent') || ctx.includes('list')) return 'inventory';
      if (ctx.includes('intake') || ctx.includes('log') || ctx.includes('add')) return 'intake';
      return 'dashboard';
    }

    if (moduleId === PATHS.RESEARCH) {
      if (ctx.includes('his')) return 'history';
      if (ctx.includes('sav') || ctx.includes('book')) return 'saved';
      if (ctx.includes('set') || ctx.includes('config')) return 'settings';
      return 'active';
    }

    if (moduleId === PATHS.JURISDICTION) {
        if (ctx.includes('state')) return 'state';
        if (ctx.includes('map') || ctx.includes('geo')) return 'map';
        if (ctx.includes('reg') || ctx.includes('admin')) return 'regulatory';
        if (ctx.includes('inter') || ctx.includes('hague')) return 'international';
        if (ctx.includes('arb') || ctx.includes('adr')) return 'arbitration';
        if (ctx.includes('rule') || ctx.includes('local')) return 'local';
        return 'federal';
    }

    // --- OPERATIONS & ADMIN ---
    
    if (moduleId === PATHS.BILLING) {
      if (ctx.includes('invoice')) return 'invoices';
      if (ctx.includes('wip') || ctx.includes('work') || ctx.includes('time')) return 'wip';
      if (ctx.includes('expense') || ctx.includes('ledger') || ctx.includes('trust')) return 'expenses';
      if (ctx.includes('anal')) return 'analytics';
      return 'overview';
    }
    
    if (moduleId === PATHS.PRACTICE) {
      if (ctx.includes('hr') || ctx.includes('staff')) return 'hr';
      if (ctx.includes('asset') || ctx.includes('it')) return 'assets';
      if (ctx.includes('financ') || ctx.includes('bank')) return 'finance';
      if (ctx.includes('market') || ctx.includes('lead')) return 'marketing';
      return 'hr';
    }

    if (moduleId === PATHS.CRM) {
      if (ctx.includes('direct') || ctx.includes('list')) return 'directory';
      if (ctx.includes('pipe') || ctx.includes('intake')) return 'pipeline';
      if (ctx.includes('anal')) return 'analytics';
      return 'dashboard';
    }

    if (moduleId === PATHS.COMPLIANCE) {
      if (ctx.includes('conflict')) return 'conflicts';
      if (ctx.includes('wall') || ctx.includes('barrier')) return 'walls';
      if (ctx.includes('policy') || ctx.includes('regulat')) return 'policies';
      return 'overview';
    }

    if (moduleId === PATHS.ADMIN) {
      if (ctx.includes('user') || ctx.includes('role') || ctx.includes('hierarchy')) return 'hierarchy';
      if (ctx.includes('secur')) return 'security';
      if (ctx.includes('db') || ctx.includes('data')) return 'db';
      if (ctx.includes('log') || ctx.includes('audit')) return 'logs';
      if (ctx.includes('integrat')) return 'integrations';
      return 'hierarchy';
    }

    if (moduleId === PATHS.DATA_PLATFORM) {
        if (ctx.includes('schema') || ctx.includes('model') || ctx.includes('diagram')) return 'schema-designer';
        if (ctx.includes('migrat') || ctx.includes('change')) return 'schema-migrations';
        if (ctx.includes('query') || ctx.includes('sql') || ctx.includes('select')) return 'query-editor';
        if (ctx.includes('history') && ctx.includes('sql')) return 'query-history';
        if (ctx.includes('pipeline') || ctx.includes('etl') || ctx.includes('job')) return 'pipeline-dag';
        if (ctx.includes('connect')) return 'pipeline-connectors';
        if (ctx.includes('lake') || ctx.includes('s3') || ctx.includes('store')) return 'lake';
        if (ctx.includes('lineage') || ctx.includes('depend')) return 'lineage-graph';
        if (ctx.includes('quality') || ctx.includes('clean')) return 'quality-dashboard';
        if (ctx.includes('rule') || ctx.includes('valid')) return 'quality-rules';
        if (ctx.includes('govern') || ctx.includes('compliance')) return 'governance-overview';
        if (ctx.includes('catalog') || ctx.includes('diction')) return 'catalog-dictionary';
        if (ctx.includes('secur') || ctx.includes('rls') || ctx.includes('policy')) return 'security-policies';
        if (ctx.includes('role') || ctx.includes('access')) return 'security-roles';
        if (ctx.includes('replic') || ctx.includes('failover')) return 'replication';
        if (ctx.includes('api') || ctx.includes('key')) return 'api';
        if (ctx.includes('backup') || ctx.includes('recover') || ctx.includes('vault')) return 'backup';
        if (ctx.includes('cost') || ctx.includes('finops') || ctx.includes('spend')) return 'cost';
        return 'overview';
    }

    // --- DOCUMENT & KNOWLEDGE ---

    if (moduleId === PATHS.DOCUMENTS) {
      if (ctx.includes('template') || ctx.includes('draft')) return 'templates';
      if (ctx.includes('recent')) return 'recent';
      if (ctx.includes('favor')) return 'favorites';
      return 'browse';
    }

    if (moduleId === PATHS.LIBRARY) {
        if (ctx.includes('prec')) return 'precedents';
        if (ctx.includes('qa') || ctx.includes('ask')) return 'qa';
        if (ctx.includes('anal') || ctx.includes('usage')) return 'insights';
        return 'wiki';
    }
    
    if (moduleId === PATHS.RULES_ENGINE) {
        if (ctx.includes('frcp') || ctx.includes('civ')) return 'federal_civil';
        if (ctx.includes('fre') || ctx.includes('evid')) return 'federal_evidence';
        if (ctx.includes('local') || ctx.includes('court')) return 'local';
        if (ctx.includes('order') || ctx.includes('stand')) return 'standing_orders';
        if (ctx.includes('search') || ctx.includes('find')) return 'search';
        if (ctx.includes('dash') || ctx.includes('over')) return 'dashboard';
        return 'dashboard';
    }

    if (moduleId === PATHS.CLAUSES) {
        if (ctx.includes('fav')) return 'favorites';
        if (ctx.includes('anal')) return 'analytics';
        return 'browse';
    }

    if (moduleId === PATHS.MESSAGES) {
      if (ctx.includes('contact') || ctx.includes('people')) return 'contacts';
      if (ctx.includes('file') || ctx.includes('doc')) return 'files';
      if (ctx.includes('arch')) return 'archived';
      return 'chats';
    }
    
    if (moduleId === PATHS.DOCKET) {
      if (ctx.includes('calendar') || ctx.includes('deadline')) return 'calendar';
      if (ctx.includes('stat') || ctx.includes('analytic')) return 'stats';
      if (ctx.includes('setting') || ctx.includes('sync') || ctx.includes('pacer')) return 'sync';
      if (ctx.includes('order') || ctx.includes('judgment')) return 'orders';
      return 'all';
    }

    return undefined;
  }
};
