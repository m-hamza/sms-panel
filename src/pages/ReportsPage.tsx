import { useState, useEffect } from 'react';
import api from '../api/ippanel';
import {
  Filter, Loader2, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertCircle, RefreshCw,
  FileText, BarChart3, SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATE_MAP: Record<number, { label: string; color: string; bg: string; border: string; icon: any }> = {
  0: { label: 'در حال ایجاد', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Clock },
  1: { label: 'در صف نظارت', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock },
  2: { label: 'در حال ارسال', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: RefreshCw },
  3: { label: 'رد شده', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
  4: { label: 'گیرندگان نامعتبر', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle },
  5: { label: 'در صف ارسال', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Clock },
  6: { label: 'ارسال شده', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
  7: { label: 'لغو شده', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: XCircle },
  8: { label: 'اعتبار ناکافی', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle },
  9: { label: 'خطای سیستمی', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
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
    <div className="p-4 pb-28 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">گزارشات ارسال</h1>
          <p className="text-xs text-slate-500 mt-0.5">تاریخچه و وضعیت پیامک‌ها</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchReports(page)}
            className="w-9 h-9 glass-card rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 glass-card rounded-xl flex items-center justify-center transition-all hover:scale-105 ${
              showFilters ? 'text-blue-400 glow-blue' : 'text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="gradient-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">مجموع پیام‌ها</p>
              <p className="text-lg font-bold text-white">{total.toLocaleString('fa-IR')}</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-[11px] text-slate-500">صفحه فعلی</p>
            <p className="text-sm font-medium text-slate-300">{page.toLocaleString('fa-IR')} / {totalPages.toLocaleString('fa-IR')}</p>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="animated-border animate-slide-up">
          <div className="glass-card rounded-2xl p-4 space-y-3 relative noise-overlay">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">فیلترها</span>
            </div>
            
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">شماره فرستنده</label>
                <input
                  type="text"
                  value={filters.number}
                  onChange={(e) => setFilters({ ...filters, number: e.target.value })}
                  placeholder="+983000..."
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">متن پیام</label>
                <input
                  type="text"
                  value={filters.message}
                  onChange={(e) => setFilters({ ...filters, message: e.target.value })}
                  placeholder="جستجو در متن..."
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">وضعیت</label>
                <select
                  value={filters.state_id}
                  onChange={(e) => setFilters({ ...filters, state_id: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                >
                  <option value="">همه وضعیت‌ها</option>
                  {Object.entries(STATE_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleFilter}
                className="flex-1 relative group overflow-hidden rounded-xl"
              >
                <div className="absolute inset-0 gradient-primary opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative text-white text-sm font-medium py-2.5 block">اعمال فیلتر</span>
              </button>
              <button
                onClick={handleResetFilters}
                className="flex-1 bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm py-2.5 rounded-xl hover:bg-slate-700/50 transition-all"
              >
                حذف فیلترها
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-xs text-slate-500 mt-4">در حال بارگذاری...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">گزارشی یافت نشد</p>
          <p className="text-xs text-slate-600 mt-1">پیامکی ارسال نشده است</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reports.map((report, idx) => {
            const state = STATE_MAP[report.state_id] || STATE_MAP[0];
            const StateIcon = state.icon;
            return (
              <div
                key={report.messages_outbox_id || idx}
                className="glass-card rounded-xl p-4 animate-fade-in card-hover group"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${state.bg} border ${state.border} flex items-center justify-center`}>
                      <StateIcon className={`w-4 h-4 ${state.color}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${state.color}`}>{state.label}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5" dir="ltr">{report.number}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg">{formatTimestamp(report.time)}</span>
                </div>
                
                {/* Message */}
                <div className="bg-slate-900/30 rounded-lg p-2.5 mb-3 border border-slate-800/30">
                  <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{report.message}</p>
                </div>

                {/* Bottom Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
                      <span className="text-[11px] text-slate-500">گیرندگان: <span className="text-slate-300">{Number(report.rcpts_count).toLocaleString('fa-IR')}</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                      <span className="text-[11px] text-slate-500">ارسال: <span className="text-slate-300">{Number(report.exit_count).toLocaleString('fa-IR')}</span></span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">{formatCost(report.cost)} <span className="text-[10px] text-emerald-600">ریال</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-3">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-slate-300 disabled:opacity-20 hover:text-white hover:scale-105 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-white">
              {page.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-slate-500">از</span>
            <span className="text-sm text-slate-400">
              {totalPages.toLocaleString('fa-IR')}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-slate-300 disabled:opacity-20 hover:text-white hover:scale-105 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
