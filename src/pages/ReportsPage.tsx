import { useState, useEffect } from 'react';
import api from '../api/ippanel';
import {
  Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertCircle, RefreshCw,
  FileText, Inbox, X, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Select, Badge, EmptyState, LoadingState, SectionHeader } from '../components/ui';
import { toPersianDateTime, toPersianNumber, formatCost, formatPhoneNumber } from '../utils/date';
import BottomNav from '../components/BottomNav';

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
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filters, setFilters] = useState({
    number: '',
    message: '',
    state_id: '',
  });

  const fetchReports = async (pageNum = 1) => {
    setLoading(true);
    try {
      const filterObj: Record<string, any> = {};
      if (filters.number) filterObj.number = formatPhoneNumber(filters.number);
      if (filters.message) filterObj.message = filters.message;
      if (filters.state_id) filterObj.state_id = filters.state_id;
      // No date filters - fetch all reports from the beginning

      const result = await api.getOutboxReport({
        page: pageNum,
        limit: 50, // Increased limit to show more reports per page
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

  const fetchReportDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const result = await api.getOutboxReportById(id);
      if (result.meta.status) {
        setSelectedReport(result.data);
      } else {
        toast.error(result.meta.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در دریافت جزئیات');
    } finally {
      setLoadingDetails(false);
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

  return (
    <div className="px-4 pt-6 pb-28 space-y-5">
      {/* Header */}
      <header className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-text tracking-tight">گزارشات</h1>
          <p className="text-xs text-text-dim mt-0.5">تمامی پیام‌های ارسالی از ابتدا تاکنون</p>
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
            <p className="text-xs text-text-dim">مجموع کل گزارشات</p>
            <p className="text-lg font-bold text-text">{toPersianNumber(total)}</p>
            <p className="text-[10px] text-text-dim">از ابتدا تاکنون</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-text-dim">صفحه فعلی</p>
          <p className="text-sm font-medium text-text">{toPersianNumber(page)} از {toPersianNumber(totalPages)}</p>
          <p className="text-[10px] text-text-dim">نمایش {toPersianNumber(reports.length)} مورد</p>
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
      {loading && reports.length === 0 ? (
        <LoadingState text="در حال دریافت گزارشات..." />
      ) : reports.length === 0 && !loading ? (
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
              <Card 
                key={report.messages_outbox_id || idx} 
                className="p-3.5 cursor-pointer card-interactive"
                onClick={() => fetchReportDetails(report.messages_outbox_id)}
              >
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
                  <span className="text-[11px] text-text-dim whitespace-nowrap">{toPersianDateTime(report.time)}</span>
                </div>
                
                {/* Message */}
                <p className="text-sm text-text mb-2.5 line-clamp-2 leading-relaxed">{report.message}</p>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-3 text-[11px] text-text-dim">
                    <span>گیرندگان: <span className="text-text-muted">{toPersianNumber(report.rcpts_count)}</span></span>
                    <span>ارسال: <span className="text-text-muted">{toPersianNumber(report.exit_count)}</span></span>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">{formatCost(report.cost)}</span>
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
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted disabled:opacity-30 hover:text-text transition-colors"
            title="صفحه اول"
          >
            <span className="text-xs">«</span>
          </button>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted disabled:opacity-30 hover:text-text transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 px-3">
            <span className="text-sm font-medium text-text">{toPersianNumber(page)}</span>
            <span className="text-xs text-text-muted">از</span>
            <span className="text-sm text-text-muted">{toPersianNumber(totalPages)}</span>
          </div>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted disabled:opacity-30 hover:text-text transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted disabled:opacity-30 hover:text-text transition-colors"
            title="صفحه آخر"
          >
            <span className="text-xs">»</span>
          </button>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailsModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}

      {/* Loading Details Modal */}
      {loadingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLoadingDetails(false)}></div>
          <div className="relative bg-surface border border-border rounded-2xl p-8">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
            <p className="text-sm text-text-dim text-center">در حال بارگذاری جزئیات...</p>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

// Report Details Modal
function ReportDetailsModal({ report, onClose }: { report: any; onClose: () => void }) {
  const state = STATE_MAP[report.state_id] || STATE_MAP[0];
  const StateIcon = state.icon;

  const details = [
    { label: 'شناسه پیام', value: report.messages_outbox_id, mono: true },
    { label: 'وضعیت', value: state.label, badge: state.variant },
    { label: 'شماره فرستنده', value: report.number, mono: true },
    { label: 'نوع ارسال', value: report.type || 'نامشخص' },
    { label: 'تاریخ ایجاد', value: toPersianDateTime(report.time) },
    { label: 'تاریخ ارسال', value: toPersianDateTime(report.time_send) },
    { label: 'تعداد گیرندگان', value: toPersianNumber(report.rcpts_count) },
    { label: 'تعداد ارسال شده', value: toPersianNumber(report.exit_count) },
    { label: 'هزینه', value: formatCost(report.cost) },
    { label: 'نام کاربری', value: report.username || 'نامشخص' },
    { label: 'شناسه کاربر', value: report.user_id || 'نامشخص', mono: true },
    { label: 'آی‌پی کاربر', value: report.user_ip || 'نامشخص', mono: true },
    { label: 'اعتبارسنجی', value: report.valid || 'نامشخص' },
    { label: 'بخش', value: report.part || 'نامشخص' },
    { label: 'شناسه والد', value: report.parent_id || 'نامشخص', mono: true },
    { label: 'شناسه خط', value: report.number_id || 'نامشخص', mono: true },
    { label: 'خط تحویل', value: report.in_delivery_line ? 'بله' : 'خیر' },
    { label: 'خلاصه', value: report.summary || 'ندارد' },
    { label: 'دلیل رد', value: report.reject_comment || 'ندارد' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 pb-8 sm:pb-5 max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
        <div className="sm:hidden w-10 h-1 bg-border-strong rounded-full mx-auto mb-4"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              state.variant === 'success' ? 'bg-success/10' :
              state.variant === 'danger' ? 'bg-danger/10' :
              state.variant === 'warning' ? 'bg-warning/10' :
              'bg-surface-2 border border-border'
            }`}>
              <StateIcon className={`w-5 h-5 ${
                state.variant === 'success' ? 'text-success' :
                state.variant === 'danger' ? 'text-danger' :
                state.variant === 'warning' ? 'text-warning' :
                'text-text-muted'
              }`} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text">جزئیات پیام</h3>
              <p className="text-xs text-text-dim">{state.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-dim hover:text-text transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Content */}
        <div className="bg-surface-2 border border-border rounded-xl p-3 mb-4">
          <p className="text-xs text-text-dim mb-1">متن پیام:</p>
          <p className="text-sm text-text leading-relaxed">{report.message}</p>
        </div>

        {/* Details Grid */}
        <div className="space-y-2">
          {details.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-xs text-text-dim">{item.label}</span>
              {item.badge ? (
                <Badge variant={item.badge}>{item.value}</Badge>
              ) : (
                <span className={`text-sm text-text ${item.mono ? 'font-mono text-xs' : ''}`} dir={item.mono ? 'ltr' : 'rtl'}>
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
