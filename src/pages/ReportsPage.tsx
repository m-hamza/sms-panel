import { useState, useEffect } from 'react';
import api from '../api/ippanel';
import {
  Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertCircle, RefreshCw,
  FileText, Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Select, Badge, EmptyState, LoadingState, SectionHeader } from '../components/ui';

const STATE_MAP: Record<number, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info'; icon: any }> = {
  0: { label: 'در حال ایجاد', variant: 'neutral', icon: Clock },
  1: { label: 'در صف نظارت', variant: 'info', icon: Clock },
  2: { label: 'در حال ارسال', variant: 'warning', icon: RefreshCw },
  3: { label: 'رد شده توسط سیستم', variant: 'danger', icon: XCircle },
  4: { label: 'گیرندگان نامعتبر', variant: 'danger', icon: AlertCircle },
  5: { label: 'در صف ارسال', variant: 'warning', icon: Clock },
  6: { label: 'ارسال شده', variant: 'success', icon: CheckCircle },
  7: { label: 'لغو شده', variant: 'neutral', icon: XCircle },
  8: { label: 'اعتبار ناکافی', variant: 'danger', icon: AlertCircle },
  9: { label: 'خطای سیستمی', variant: 'danger', icon: XCircle },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    number: '',
    message: '',
    state_id: '',
  });

  const fetchReports = async (pageNum = 1) => {
    setLoading(true);
    try {
      const filterObj: Record<string, any> = {};
      if (filters.number) filterObj.number = filters.number;
      if (filters.message) filterObj.message = filters.message;
      if (filters.state_id) filterObj.state_id = filters.state_id;

      const result = await api.getOutboxReport({
        page: pageNum,
        limit: 15,
        filters: Object.keys(filterObj).length > 0 ? filterObj : undefined,
      });

      if (result.meta.status) {
        setReports(result.data || []);
        setTotalPages(result.meta.last_page || 1);
        setTotal(result.meta.total || 0);
      } else {
        toast.error(result.meta.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در دریافت گزارشات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchReports(newPage);
  };

  const handleFilter = () => {
    setPage(1);
    fetchReports(1);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({ number: '', message: '', state_id: '' });
    setPage(1);
    fetchReports(1);
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(Number(ts) * 1000);
      return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  const formatCost = (cost: number) => {
    return Number(cost).toLocaleString('fa-IR', { maximumFractionDigits: 0 });
  };

  return (
    <div className="px-4 pt-6 pb-28 space-y-5">
      {/* Header */}
      <header className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-text tracking-tight">گزارشات</h1>
          <p className="text-xs text-text-dim mt-0.5">تاریخچه پیام‌های ارسالی</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchReports(page)}
            disabled={loading}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              showFilters 
                ? 'bg-accent/10 border-accent/30 text-accent' 
                : 'bg-surface-2 border-border text-text-muted hover:text-text'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Summary Card */}
      <Card className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/0 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-text-dim">مجموع پیام‌ها</p>
            <p className="text-lg font-bold text-text">{total.toLocaleString('fa-IR')}</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-text-dim">صفحه</p>
          <p className="text-sm font-medium text-text">{page.toLocaleString('fa-IR')} / {totalPages.toLocaleString('fa-IR')}</p>
        </div>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card className="space-y-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">شماره فرستنده</label>
            <Input
              type="text"
              value={filters.number}
              onChange={(e) => setFilters({ ...filters, number: e.target.value })}
              placeholder="+983000..."
              dir="ltr"
              className="font-mono"
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">متن پیام</label>
            <Input
              type="text"
              value={filters.message}
              onChange={(e) => setFilters({ ...filters, message: e.target.value })}
              placeholder="جستجو در متن..."
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">وضعیت</label>
            <Select
              value={filters.state_id}
              onChange={(e) => setFilters({ ...filters, state_id: e.target.value })}
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(STATE_MAP).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="primary" size="sm" onClick={handleFilter} className="flex-1">
              اعمال فیلتر
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="flex-1">
              حذف فیلترها
            </Button>
          </div>
        </Card>
      )}

      {/* Reports List */}
      {loading ? (
        <LoadingState text="در حال دریافت گزارشات..." />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="گزارشی یافت نشد"
          description="هیچ پیامکی با فیلترهای فعلی وجود ندارد"
        />
      ) : (
        <div className="space-y-2 stagger">
          {reports.map((report, idx) => {
            const state = STATE_MAP[report.state_id] || STATE_MAP[0];
            const StateIcon = state.icon;
            return (
              <Card key={report.messages_outbox_id || idx} className="p-3.5">
                {/* Top row */}
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      state.variant === 'success' ? 'bg-success/10' :
                      state.variant === 'danger' ? 'bg-danger/10' :
                      state.variant === 'warning' ? 'bg-warning/10' :
                      'bg-surface-2 border border-border'
                    }`}>
                      <StateIcon className={`w-4 h-4 ${
                        state.variant === 'success' ? 'text-success' :
                        state.variant === 'danger' ? 'text-danger' :
                        state.variant === 'warning' ? 'text-warning' :
                        'text-text-muted'
                      }`} strokeWidth={1.5} />
                    </div>
                    <div>
                      <Badge variant={state.variant}>{state.label}</Badge>
                      <p className="text-[11px] text-text-dim mt-1 font-mono" dir="ltr">{report.number}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-text-dim whitespace-nowrap">{formatTimestamp(report.time)}</span>
                </div>
                
                {/* Message */}
                <p className="text-sm text-text mb-2.5 line-clamp-2 leading-relaxed">{report.message}</p>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-3 text-[11px] text-text-dim">
                    <span>گیرندگان: <span className="text-text-muted">{Number(report.rcpts_count).toLocaleString('fa-IR')}</span></span>
                    <span>ارسال: <span className="text-text-muted">{Number(report.exit_count).toLocaleString('fa-IR')}</span></span>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">{formatCost(report.cost)} ریال</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted disabled:opacity-30 hover:text-text transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-muted px-2">
            {page.toLocaleString('fa-IR')} / {totalPages.toLocaleString('fa-IR')}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted disabled:opacity-30 hover:text-text transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
