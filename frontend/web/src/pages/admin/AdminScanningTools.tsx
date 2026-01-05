
import React, { useState, useEffect } from 'react';
import {
    getScanningTools,
    getAllScanningTools,
    createScanningTool,
    updateScanningTool,
    deleteScanningTool,
    getScanModes,
    getAllScanModes,
    createScanMode,
    updateScanMode,
    deleteScanMode,
    type ScanningTool,
    type ScanMode
} from '@/api-service/scanning-management.service';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    Plus,
    Pencil,
    Trash2,
    Shield,
    Layers,
    Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminScanningTools() {
    const [tools, setTools] = useState<ScanningTool[]>([]);
    const [modes, setModes] = useState<ScanMode[]>([]);
    const [loadingTools, setLoadingTools] = useState(true);
    const [loadingModes, setLoadingModes] = useState(true);
    const { toast } = useToast();

    const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);
    const [isModeDialogOpen, setIsModeDialogOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<ScanningTool | null>(null);
    const [editingMode, setEditingMode] = useState<ScanMode | null>(null);

    const [toolForm, setToolForm] = useState({
        name: '',
        description: '',
        type: '',
        isActive: true
    });

    const [modeForm, setModeForm] = useState({
        name: '',
        description: '',
        estimatedTime: '',
        scanType: 'full' as 'full' | 'fast' | 'custom',
        isActive: true,
        tools: [] as string[]
    });

    useEffect(() => {
        fetchTools();
        fetchModes();
    }, []);

    const fetchTools = async () => {
        try {
            const response = await getAllScanningTools();
            setTools(response.data.data);
        } catch (error) {
            console.error('Error fetching tools:', error);
            toast({ title: "Error", description: "Failed to fetch scanning tools", variant: "destructive" });
        } finally {
            setLoadingTools(false);
        }
    };

    const fetchModes = async () => {
        try {
            const response = await getAllScanModes();
            setModes(response.data.data);
        } catch (error) {
            console.error('Error fetching modes:', error);
            toast({ title: "Error", description: "Failed to fetch scan modes", variant: "destructive" });
        } finally {
            setLoadingModes(false);
        }
    };

    const handleToolSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTool) {
                await updateScanningTool(editingTool._id, toolForm);
                toast({ title: "Success", description: "Scanning tool updated successfully" });
            } else {
                await createScanningTool(toolForm);
                toast({ title: "Success", description: "Scanning tool created successfully" });
            }
            setIsToolDialogOpen(false);
            setEditingTool(null);
            setToolForm({ name: '', description: '', type: '', isActive: true });
            fetchTools();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save scanning tool",
                variant: "destructive"
            });
        }
    };

    const handleModeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMode) {
                await updateScanMode(editingMode._id, modeForm);
                toast({ title: "Success", description: "Scan mode updated successfully" });
            } else {
                await createScanMode(modeForm);
                toast({ title: "Success", description: "Scan mode created successfully" });
            }
            setIsModeDialogOpen(false);
            setEditingMode(null);
            setModeForm({ name: '', description: '', estimatedTime: '', scanType: 'full', isActive: true, tools: [] });
            fetchModes();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save scan mode",
                variant: "destructive"
            });
        }
    };

    const handleDeleteTool = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tool?')) return;
        try {
            await deleteScanningTool(id);
            toast({ title: "Success", description: "Scanning tool deleted" });
            fetchTools();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete scanning tool", variant: "destructive" });
        }
    };

    const handleDeleteMode = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mode?')) return;
        try {
            await deleteScanMode(id);
            toast({ title: "Success", description: "Scan mode deleted" });
            fetchModes();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete scan mode", variant: "destructive" });
        }
    };

    const openEditTool = (tool: ScanningTool) => {
        setEditingTool(tool);
        setToolForm({
            name: tool.name,
            description: tool.description,
            type: tool.type,
            isActive: tool.isActive
        });
        setIsToolDialogOpen(true);
    };

    const openEditMode = (mode: ScanMode) => {
        setEditingMode(mode);
        setModeForm({
            name: mode.name,
            description: mode.description,
            estimatedTime: mode.estimatedTime,
            scanType: mode.scanType,
            isActive: mode.isActive,
            tools: mode.tools ? (typeof mode.tools[0] === 'string' ? mode.tools as string[] : (mode.tools as ScanningTool[]).map(t => t._id)) : []
        });
        setIsModeDialogOpen(true);
    };

    const toggleToolInMode = (toolId: string) => {
        setModeForm(prev => {
            const tools = prev.tools.includes(toolId)
                ? prev.tools.filter(id => id !== toolId)
                : [...prev.tools, toolId];
            return { ...prev, tools };
        });
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Scanning Management</h1>
                    <p className="text-muted-foreground">Manage scanning tools and modes available to users</p>
                </div>
            </div>

            {/* Scanning Tools Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Scanning Tools
                        </CardTitle>
                        <CardDescription>Individual components used in scans</CardDescription>
                    </div>
                    <Dialog open={isToolDialogOpen} onOpenChange={setIsToolDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" onClick={() => { setEditingTool(null); setToolForm({ name: '', description: '', type: '', isActive: true }); }}>
                                <Plus className="mr-2 h-4 w-4" /> Add Tool
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleToolSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingTool ? 'Edit Tool' : 'Add New Tool'}</DialogTitle>
                                    <DialogDescription>Configure a scanning tool component</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <Input
                                            value={toolForm.name}
                                            onChange={e => setToolForm({ ...toolForm, name: e.target.value })}
                                            placeholder="e.g., SSL Analysis"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Type (Internal Identifier)</label>
                                        <Input
                                            value={toolForm.type}
                                            onChange={e => setToolForm({ ...toolForm, type: e.target.value })}
                                            placeholder="e.g., ssl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            value={toolForm.description}
                                            onChange={e => setToolForm({ ...toolForm, description: e.target.value })}
                                            placeholder="What this tool evaluates..."
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={toolForm.isActive}
                                            onCheckedChange={checked => setToolForm({ ...toolForm, isActive: checked })}
                                        />
                                        <label className="text-sm font-medium">Active</label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">{editingTool ? 'Update Tool' : 'Create Tool'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {loadingTools ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tools.map(tool => (
                                    <TableRow key={tool._id}>
                                        <TableCell className="font-medium">{tool.name}</TableCell>
                                        <TableCell><code className="bg-muted px-1 rounded">{tool.type}</code></TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tool.isActive ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'}`}>
                                                {tool.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openEditTool(tool)}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-status-danger" onClick={() => handleDeleteTool(tool._id)}><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Scan Modes Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            Scan Modes
                        </CardTitle>
                        <CardDescription>Bundled scan configurations for users</CardDescription>
                    </div>
                    <Dialog open={isModeDialogOpen} onOpenChange={setIsModeDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" onClick={() => { setEditingMode(null); setModeForm({ name: '', description: '', estimatedTime: '', scanType: 'full', isActive: true, tools: [] }); }}>
                                <Plus className="mr-2 h-4 w-4" /> Add Mode
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <form onSubmit={handleModeSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingMode ? 'Edit Mode' : 'Add New Mode'}</DialogTitle>
                                    <DialogDescription>Configure a scan mode bundle and associated tools</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-6 py-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Name</label>
                                            <Input
                                                value={modeForm.name}
                                                onChange={e => setModeForm({ ...modeForm, name: e.target.value })}
                                                placeholder="e.g., Quick Scan"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Scan Type</label>
                                            <Select
                                                value={modeForm.scanType}
                                                onValueChange={(val: any) => setModeForm({ ...modeForm, scanType: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fast">Fast (Queued)</SelectItem>
                                                    <SelectItem value="full">Full (Queued)</SelectItem>
                                                    <SelectItem value="custom">Custom (User Selects Tools)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Estimated Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    className="pl-8"
                                                    value={modeForm.estimatedTime}
                                                    onChange={e => setModeForm({ ...modeForm, estimatedTime: e.target.value })}
                                                    placeholder="e.g., 2-5 minutes"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Description</label>
                                            <Textarea
                                                value={modeForm.description}
                                                onChange={e => setModeForm({ ...modeForm, description: e.target.value })}
                                                placeholder="Summary of this scan mode..."
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={modeForm.isActive}
                                                onCheckedChange={checked => setModeForm({ ...modeForm, isActive: checked })}
                                            />
                                            <label className="text-sm font-medium">Active</label>
                                        </div>
                                    </div>

                                    {/* Tool Selection for Mode */}
                                    <div className="space-y-4 border-l pl-6">
                                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Include Tools</label>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                            {tools.map(tool => (
                                                <div key={tool._id} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50 transition-colors">
                                                    <Switch
                                                        checked={modeForm.tools.includes(tool._id)}
                                                        onCheckedChange={() => toggleToolInMode(tool._id)}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium leading-none">{tool.name}</p>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{tool.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {tools.length === 0 && <p className="text-sm text-muted-foreground italic">No tools available</p>}
                                        </div>
                                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                            Selected tools will be used automatically when this mode is chosen (except for Custom scans where users select manually).
                                        </p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">{editingMode ? 'Update Mode' : 'Create Mode'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {loadingModes ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Linked Tools</TableHead>
                                    <TableHead>Est. Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modes.map(mode => (
                                    <TableRow key={mode._id}>
                                        <TableCell className="font-medium">{mode.name}</TableCell>
                                        <TableCell className="capitalize">{mode.scanType}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {mode.tools && (mode.tools as ScanningTool[]).length > 0 ? (
                                                    (mode.tools as ScanningTool[]).map(t => (
                                                        <span key={t._id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-tighter">
                                                            {t.type}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No tools linked</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{mode.estimatedTime || 'N/A'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${mode.isActive ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'}`}>
                                                {mode.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openEditMode(mode)}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-status-danger" onClick={() => handleDeleteMode(mode._id)}><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
