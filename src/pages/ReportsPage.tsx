import { useState, useEffect } from 'react';
import api from '../api/ippanel';
import {
  Search, Filter, Loader2, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertCircle, RefreshCw,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATE_MAP: Record<number, { label: string; color: string; icon: any }> = {
  0: { label: 'در حال ایجاد', color: 'text-slate-400', icon: Clock },
  1: { label: 'در صف نظارت', color: 'text-blue-400', icon: Clock },
  2: { label: 'در حال ارسال', color: 'text-yellow-400', icon: RefreshCw },
  3: { label: 'رد شده توسط سیستم', color: 'text-red-400', icon: XCircle },
  4: { label: 'گیرندگان نامعتبر', color: 'text-red-400', icon: AlertCircle },
  5: { label: 'در صف ارسال', color: 'text-orange-400', icon: Clock },
  6: { label: 'ارسال شده', color: 'text-emerald-400', icon: CheckCircle },
  7: { label: 'لغو شده', color: 'text-slate-400', icon: XCircle },
  8: { label: 'اعتبار ناکافی', color: 'text-red-400', icon: AlertCircle },
  9: { label: 'خطای سیستمی', color: 'text-red-400', icon: XCircle },
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
    <div className="p-4 pb-24 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">گزارشات ارسال</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchReports(page)}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 glass rounded-xl flex items-center justify-center transition-colors ${
              showFilters ? 'text-blue-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="glass rounded-xl p-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">مجموع پیام‌ها</span>
        <span className="text-lg font-bold text-white">{total.toLocaleString('fa-IR')}</span>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 space-y-3 animate-slide-up">
          <div>
            <label className="block text-xs text-slate-400 mb-1">شماره فرستنده</label>
            <input
              type="text"
              value={filters.number}
              onChange={(e) => setFilters({ ...filters, number: e.target.value })}
              placeholder="+983000..."
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">متن پیام</label>
            <input
              type="text"
              value={filters.message}
              onChange={(e) => setFilters({ ...filters, message: e.target.value })}
              placeholder="جستجو در متن..."
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">وضعیت</label>
            <select
              value={filters.state_id}
              onChange={(e) => setFilters({ ...filters, state_id: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(STATE_MAP).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 gradient-primary text-white text-sm font-medium py-2 rounded-xl"
            >
              اعمال فیلتر
            </button>
            <button
              onClick={handleResetFilters}
              className="flex-1 bg-slate-700/50 text-slate-300 text-sm py-2 rounded-xl hover:bg-slate-600/50 transition-colors"
            >
              حذف فیلترها
            </button>
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">گزارشی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report, idx) => {
            const state = STATE_MAP[report.state_id] || STATE_MAP[0];
            const StateIcon = state.icon;
            return (
              <div
                key={report.messages_outbox_id || idx}
                className="glass rounded-xl p-3 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      report.state_id === 6 ? 'bg-emerald-500/20' :
                      report.state_id >= 3 && report.state_id <= 4 ? 'bg-red-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      <StateIcon className={`w-3.5 h-3.5 ${state.color}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${state.color}`}>{state.label}</p>
                      <p className="text-xs text-slate-500" dir="ltr">{report.number}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{formatTimestamp(report.time)}</span>
                </div>
                <p className="text-sm text-slate-200 mb-2 line-clamp-2">{report.message}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>گیرندگان: {Number(report.rcpts_count).toLocaleString('fa-IR')}</span>
                    <span>ارسال شده: {Number(report.exit_count).toLocaleString('fa-IR')}</span>
                  </div>
                  <span className="text-emerald-400">{formatCost(report.cost)} ریال</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-300 disabled:opacity-30 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-300">
            صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-300 disabled:opacity-30 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
