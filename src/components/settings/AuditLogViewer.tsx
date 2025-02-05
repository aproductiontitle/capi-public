import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

type AuditAction = 'login' | 'logout' | 'password_change' | 'profile_update' | 'api_key_access' | 'data_export' | 'settings_change';

const AuditLogViewer = () => {
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['auditLogs', actionFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (searchTerm) {
        query = query.or(`ip_address.ilike.%${searchTerm}%,user_agent.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleExport = () => {
    if (!auditLogs) return;
    
    const csv = [
      ['Timestamp', 'Action', 'IP Address', 'User Agent', 'Details'],
      ...auditLogs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.action,
        log.ip_address || '',
        log.user_agent || '',
        JSON.stringify(log.details || ''),
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by IP or User Agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={actionFilter}
          onValueChange={(value) => setActionFilter(value as AuditAction | 'all')}
        >
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="password_change">Password Change</SelectItem>
            <SelectItem value="profile_update">Profile Update</SelectItem>
            <SelectItem value="api_key_access">API Key Access</SelectItem>
            <SelectItem value="data_export">Data Export</SelectItem>
            <SelectItem value="settings_change">Settings Change</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>User Agent</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : auditLogs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No audit logs found</TableCell>
              </TableRow>
            ) : (
              auditLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.ip_address || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.user_agent || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AuditLogViewer;