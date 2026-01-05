
import React, { useState } from 'react';
import { 
  FileText, Folder, Image, UploadCloud, Search, MoreVertical, 
  CheckSquare, List, Clock, Star, 
  Shield, Lock, Eye, Download, Trash2, 
  Edit2, Share2, RefreshCw, 
  Minimize2, Maximize2, Paperclip,
  Archive, FileCode, FileSpreadsheet,
  ChevronRight, Copy, X,
  PenTool, Grid
} from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';
import { Badge } from '../common/Badge.tsx';
import { FileIcon, TagList } from '../common/Primitives.tsx';

export const DesignDocuments = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isStarred, setIsStarred] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(45);

  return (
    <div className="space-y-8 animate-fade-in">
        <SectionHeading title="Document Management" icon={Folder} count="DOC-01 to DOC-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* --- ICONS & THUMBNAILS --- */}
            <DemoContainer>
                <ComponentLabel id="DOC-01" name="PDF Asset" />
                <div className="group flex flex-col items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer w-full">
                    <div className="relative w-12 h-16 bg-gradient-to-tr from-red-50 to-white border border-red-200 rounded-lg shadow-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <div className="absolute top-0 right-0 border-t-[12px] border-r-[12px] border-t-transparent border-r-red-100 rounded-bl-md"></div>
                        <FileText className="text-red-500" size={24}/>
                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded-sm">PDF</div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 truncate w-full text-center">contract_final.pdf</span>
                    <span className="text-[9px] text-slate-400">1.2 MB</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-02" name="Word Document" />
                <div className="group flex flex-col items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer w-full">
                    <div className="relative w-12 h-16 bg-gradient-to-tr from-blue-50 to-white border border-blue-200 rounded-lg shadow-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                         <div className="absolute top-0 right-0 border-t-[12px] border-r-[12px] border-t-transparent border-r-blue-100 rounded-bl-md"></div>
                        <FileText className="text-blue-600" size={24}/>
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[8px] font-bold px-1 rounded-sm">DOCX</div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 truncate w-full text-center">brief_draft_v2.docx</span>
                    <span className="text-[9px] text-slate-400">450 KB</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-03" name="Spreadsheet" />
                <div className="group flex flex-col items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer w-full">
                    <div className="relative w-12 h-16 bg-gradient-to-tr from-emerald-50 to-white border border-emerald-200 rounded-lg shadow-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <div className="absolute top-0 right-0 border-t-[12px] border-r-[12px] border-t-transparent border-r-emerald-100 rounded-bl-md"></div>
                        <FileSpreadsheet className="text-emerald-600" size={24}/>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-sm">XLSX</div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 truncate w-full text-center">damages_calc.xlsx</span>
                    <span className="text-[9px] text-slate-400">89 KB</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-04" name="Folder Row" />
                <div className="flex items-center gap-3 p-2 w-full hover:bg-slate-50 rounded-lg cursor-pointer group border border-transparent hover:border-slate-200 transition-all">
                    <div className="w-10 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors relative">
                        <Folder size={18} fill="currentColor" fillOpacity={0.2} />
                         <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-700">Discovery Production</div>
                        <div className="text-[9px] text-slate-400 flex gap-2">
                            <span>12 items</span>
                            <span>•</span>
                            <span>Updated today</span>
                        </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500"/>
                </div>
            </DemoContainer>

            {/* --- LIST ITEMS --- */}
            <DemoContainer>
                <ComponentLabel id="DOC-05" name="Document List Row" />
                <div className="flex items-center p-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer group">
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-500 mr-3">
                         <FileText size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                             <span className="text-xs font-medium text-slate-700 truncate">motion_dismiss_draft.pdf</span>
                        </div>
                        <div className="text-[9px] text-slate-400 flex gap-2">
                             <span>PDF</span><span>•</span><span>2.4 MB</span><span>•</span><span>J. Doe</span>
                        </div>
                    </div>
                    <div className="hidden group-hover:flex gap-1">
                        <button className="p-1 hover:bg-slate-200 rounded text-slate-500"><Download size={12}/></button>
                        <button className="p-1 hover:bg-slate-200 rounded text-slate-500"><MoreVertical size={12}/></button>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-06" name="List Row (Selected)" />
                <div className="flex items-center p-2 bg-blue-50/50 border border-blue-200 rounded cursor-pointer relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <div className="p-1.5 bg-white border border-blue-100 rounded text-blue-600 mr-3 shadow-sm">
                         <FileCode size={14} />
                    </div>
                    <span className="text-xs text-blue-900 font-medium flex-1 truncate">src_code_exhibit.js</span>
                    {/* <CheckCircle className="h-4 w-4 text-blue-600 fill-blue-50"/>  Removed as it was unused import before but seems useful here. Keeping if I re-add import.*/}
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-07" name="Version History Row" />
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                             <span className="text-[9px] font-bold uppercase">Ver</span>
                             <span className="text-xs font-bold">2.1</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">Edited by J. Doe</span>
                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                                <Clock size={8}/> 2 hours ago
                            </span>
                        </div>
                    </div>
                    <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">Current</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-08" name="Grid View Card" />
                <div className="border border-slate-200 rounded-lg p-2 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white group relative">
                    <div className="aspect-[4/3] bg-slate-100 rounded mb-2 flex items-center justify-center relative overflow-hidden">
                        <Image className="h-8 w-8 text-slate-300"/>
                        {/* Mock Image Content */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 p-1 rounded-full shadow-sm"><Maximize2 size={10} className="text-slate-700"/></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-1">
                            <p className="text-xs font-semibold text-slate-700 truncate" title="Evidence_Photo_A.jpg">Evidence_Photo_A.jpg</p>
                            <p className="text-[10px] text-slate-400">IMG • 4.2 MB</p>
                        </div>
                        <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={12}/></button>
                    </div>
                </div>
            </DemoContainer>

            {/* --- UPLOAD & STATUS --- */}
            <DemoContainer>
                <ComponentLabel id="DOC-09" name="Upload Zone" />
                <div className="border-2 border-dashed border-blue-200 rounded-lg h-24 flex flex-col items-center justify-center text-blue-500 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer gap-2">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                        <UploadCloud className="h-5 w-5"/>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] font-bold block">Click to upload</span>
                        <span className="text-[9px] text-blue-400">or drag and drop</span>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-10" name="Upload Progress" />
                <div className="p-3 border border-slate-200 rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <FileText size={14} className="text-blue-600"/>
                            <span className="text-xs font-medium text-slate-700">scan_001.pdf</span>
                        </div>
                        <button className="text-slate-400 hover:text-red-500"><X size={12}/></button>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-300 relative overflow-hidden" style={{width: `${uploadProgress}%`}}>
                            <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_1s_infinite]"></div>
                        </div>
                    </div>
                    <div className="mt-1 flex justify-between text-[9px] text-slate-400">
                        <span>{uploadProgress}% • 450 KB of 1.2 MB</span>
                        <span>12s left</span>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-11" name="Processing State" />
                <div className="flex items-center gap-3 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="relative">
                         <RefreshCw className="h-4 w-4 animate-spin text-indigo-600"/>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">OCR Processing</div>
                        <div className="text-[10px] text-slate-400">Extracting text layers...</div>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-12" name="Security Check" />
                <div className="flex items-center gap-2 text-xs text-green-800 bg-green-50 p-2 rounded border border-green-200">
                    <Shield className="h-4 w-4 text-green-600 shrink-0"/>
                    <div className="flex-1">
                        <span className="font-bold block text-[10px] uppercase tracking-wider">Scan Passed</span>
                        <span className="text-[10px] opacity-80">No malware detected.</span>
                    </div>
                </div>
            </DemoContainer>

            {/* --- METADATA & TAGS --- */}
            <DemoContainer>
                <ComponentLabel id="DOC-13" name="Metadata Tag" />
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                    <Archive size={10} className="mr-1.5"/> Evidence
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-14" name="Confidential Badge" />
                <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                    <Lock size={10} className="mr-1"/> Confidential
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-15" name="Privilege Flag" />
                <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
                    <Shield size={10} className="mr-1"/> Attorney-Client
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-16" name="Breadcrumb Path" />
                <div className="flex items-center text-[10px] text-slate-500 overflow-hidden whitespace-nowrap bg-slate-50 p-1 rounded border border-slate-200">
                    <Folder size={10} className="mr-1"/>
                    <span className="hover:text-blue-600 cursor-pointer">Root</span>
                    <ChevronRight size={10} className="mx-0.5 text-slate-300"/>
                    <span className="hover:text-blue-600 cursor-pointer">Case 101</span>
                    <ChevronRight size={10} className="mx-0.5 text-slate-300"/>
                    <span className="font-bold text-slate-800">Pleadings</span>
                </div>
            </DemoContainer>

            {/* --- ACTIONS & CONTROLS --- */}
            <DemoContainer>
                <ComponentLabel id="DOC-17" name="Action Toolbar" />
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit">
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Preview"><Eye size={14}/></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Download"><Download size={14}/></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Share"><Share2 size={14}/></button>
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                    <button className="p-1.5 hover:bg-red-50 rounded text-red-500" title="Delete"><Trash2 size={14}/></button>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-18" name="View Toggle" />
                <div className="flex bg-slate-100 p-0.5 rounded-lg w-fit border border-slate-200 shadow-inner">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List size={14}/>
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Grid size={14}/>
                    </button>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-19" name="Sort Header" />
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded border border-transparent hover:border-slate-200 transition-all select-none">
                    <span>Date Modified</span>
                    <div className="flex flex-col -space-y-1 ml-2 text-slate-400">
                        <ChevronRight size={10} className="-rotate-90"/>
                        <ChevronRight size={10} className="rotate-90 text-slate-800"/>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-20" name="Bulk Actions" />
                <div className="bg-slate-900 text-white p-2 rounded-lg flex justify-between items-center shadow-lg">
                    <div className="flex items-center">
                        <div className="bg-slate-700 w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold mr-2">3</div>
                        <span className="text-xs font-medium">Selected</span>
                    </div>
                    <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"><Download size={14}/></button>
                        <button className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"><Archive size={14}/></button>
                    </div>
                </div>
            </DemoContainer>

            {/* --- MISC UI ELEMENTS --- */}
            <DemoContainer>
                <ComponentLabel id="DOC-21" name="Empty Folder State" />
                <div className="flex flex-col items-center justify-center py-6 text-slate-300 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                    <Folder className="h-10 w-10 mb-2 opacity-50"/>
                    <span className="text-[10px] font-medium text-slate-400">No documents found</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-22" name="Favorite Toggle" />
                <div 
                    onClick={() => setIsStarred(!isStarred)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all ${isStarred ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                    <Star size={14} className={isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}/>
                    <span className="text-xs font-medium">{isStarred ? 'Starred' : 'Star this'}</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-23" name="Search Field" />
                <div className="relative group">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
                    <input 
                        className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
                        placeholder="Filter documents..."
                    />
                    <div className="absolute right-2 top-2 p-0.5 bg-slate-200 rounded text-[8px] text-slate-500 font-mono">/</div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-24" name="Tree Navigator" />
                <div className="pl-3 border-l border-slate-200 ml-1.5">
                    <div className="flex items-center gap-2 py-1 text-xs text-slate-600 hover:text-blue-600 cursor-pointer group">
                        <div className="w-3 h-px bg-slate-200 -ml-3 group-hover:bg-blue-300"></div>
                        <FileCode size={12} className="text-slate-400 group-hover:text-blue-500"/> 
                        <span className="truncate">index.ts</span>
                    </div>
                     <div className="flex items-center gap-2 py-1 text-xs text-slate-600 hover:text-blue-600 cursor-pointer group">
                        <div className="w-3 h-px bg-slate-200 -ml-3 group-hover:bg-blue-300"></div>
                        <FileText size={12} className="text-slate-400 group-hover:text-blue-500"/> 
                        <span className="truncate">styles.css</span>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-25" name="Draft Watermark" />
                <div className="relative h-16 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                    <span className="absolute text-slate-100 text-3xl font-black -rotate-12 select-none pointer-events-none tracking-widest">DRAFT</span>
                    <div className="relative z-10 text-[9px] text-slate-600 text-center px-4 leading-relaxed opacity-60">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-26" name="Inline Redaction" />
                <div className="text-xs bg-white p-2 border border-slate-200 rounded">
                    Defendant <span className="bg-slate-900 text-slate-900 select-none rounded-sm px-1 cursor-help" title="Redacted for Privacy">REDACTED</span> stated...
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-27" name="Signature Block" />
                <div className="border border-slate-200 bg-slate-50/50 p-3 rounded flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Sign Here</span>
                        <div className="h-8 border-b border-slate-300 w-24"></div>
                    </div>
                    <PenTool size={16} className="text-slate-300"/>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-28" name="Locked File" />
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200 opacity-75 cursor-not-allowed w-full">
                    <div className="p-1.5 bg-slate-200 rounded text-slate-500"><Lock size={12}/></div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-700 truncate">budget_2024.xlsx</div>
                        <div className="text-[9px] text-slate-400">Locked by Admin</div>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-29" name="Recent Access" />
                <div className="flex items-center text-[10px] text-slate-500 bg-white border border-slate-100 px-2 py-1 rounded shadow-sm w-fit">
                    <Clock size={10} className="mr-1.5 text-blue-500"/> Accessed 2m ago
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-30" name="Preview Overlay" />
                <div className="bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center text-white h-24 relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=100&fit=crop')] bg-cover opacity-30"></div>
                    <FileText size={24} className="relative z-10 mb-1"/>
                    <span className="text-[9px] relative z-10 opacity-80 group-hover:opacity-100">Click to Preview</span>
                    <div className="absolute top-1 right-1"><Maximize2 size={10}/></div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-31" name="Bates Stamp" />
                <div className="text-[9px] font-mono text-right text-slate-400 border-t border-slate-100 pt-1 mt-2">
                    <span className="bg-slate-50 px-1 border border-slate-100 rounded">XYZ-PROD-000142</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-32" name="Share Link Input" />
                <div className="flex bg-white border border-slate-200 rounded-md p-0.5 shadow-sm">
                    <div className="flex-1 px-2 py-1 flex items-center bg-slate-50 rounded-l border-r border-slate-100">
                         <span className="text-[10px] text-slate-500 truncate max-w-[100px]">lexi.link/d/x9s8...</span>
                    </div>
                    <button className="p-1.5 hover:bg-slate-50 text-blue-600 rounded-md transition-colors font-medium text-xs px-2 flex items-center gap-1">
                        <Copy size={10}/> Copy
                    </button>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-33" name="Metadata Panel" />
                <div className="text-[10px] bg-slate-50 rounded border border-slate-100 p-2 space-y-1.5">
                    <div className="flex justify-between items-center"><span className="text-slate-400">Author</span> <span className="font-medium text-slate-700">J. Smith</span></div>
                    <div className="w-full h-px bg-slate-200"></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Created</span> <span className="font-medium text-slate-700">Oct 12, 2023</span></div>
                    <div className="w-full h-px bg-slate-200"></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Size</span> <span className="font-mono text-slate-600">1.2 MB</span></div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-34" name="Compare Toggle" />
                <div className="flex items-center justify-between w-full">
                    <label htmlFor="compare-mode" className="text-xs font-medium text-slate-700 cursor-pointer">Diff Mode</label>
                    <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="compare-mode" className="peer absolute block w-4 h-4 rounded-full bg-white border-2 border-slate-300 appearance-none cursor-pointer checked:right-0 checked:border-blue-600 transition-all"/>
                        <label htmlFor="compare-mode" className="block overflow-hidden h-4 rounded-full bg-slate-200 cursor-pointer peer-checked:bg-blue-600 transition-colors"></label>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-35" name="Retention Policy" />
                <div className="flex items-center gap-1.5 text-[9px] text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm w-fit">
                    <Clock size={10} className="text-orange-500"/> 
                    <span>Retain until <span className="font-bold">2030</span></span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-36" name="Tag Input Area" />
                <div className="flex flex-wrap gap-1 p-1.5 border border-slate-200 rounded-md bg-white min-h-[36px] items-center focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
                    <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded border border-blue-100 flex items-center">
                        Tag <X size={8} className="ml-1 cursor-pointer hover:text-blue-900"/>
                    </span>
                    <input className="text-[10px] outline-none flex-1 min-w-[40px] bg-transparent placeholder:text-slate-400" placeholder="Add tag..."/>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-37" name="Export Options" />
                <div className="flex gap-2">
                    <button className="flex-1 text-[10px] border border-slate-200 bg-white px-2 py-1.5 rounded hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-1 text-slate-600 transition-colors">
                        <FileText size={10} className="text-red-500"/> PDF
                    </button>
                    <button className="flex-1 text-[10px] border border-slate-200 bg-white px-2 py-1.5 rounded hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-1 text-slate-600 transition-colors">
                        <FileCode size={10} className="text-blue-500"/> XML
                    </button>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-38" name="Annotation Dot" />
                <div className="relative border p-3 h-16 bg-white text-[10px] text-slate-500 leading-relaxed rounded">
                    Lorem ipsum document content...
                    <div className="absolute top-2 right-4 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-[9px] cursor-pointer shadow-sm hover:scale-110 transition-transform ring-2 ring-white">
                        1
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-39" name="Processing Badge" />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>
                    Processing...
                </span>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DOC-40" name="Archive Action" />
                <button className="w-full py-2 border border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 rounded-md text-xs flex items-center justify-center transition-colors">
                    <Archive size={12} className="mr-1.5"/> Archive File
                </button>
            </DemoContainer>

        </div>
    </div>
  );
};
