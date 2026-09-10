import { useState, useEffect } from 'react';
import { api } from '../api/ippanel';
import { toPersianDateTime, toPersianNumber, formatCost } from '../utils/format';
import { CheckCircle, FileText, Inbox, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchReports(1); }, []);

  const fetchReports = async (pageNum: number) => {
    setLoading(true);
    try {
      const result = await api.getOutboxReport({ page: pageNum, limit: 50 });
      if (result.meta.status) {
        setReports(result.data || []);
        setTotalPages(result.meta.last_page || 1);
        setTotal(result.meta.total || 0);
      }
    } catch (err: any) { 
      console.error(err);
    }
    finally { setLoading(false); }
  };

  return (
    <div className="px-4 pt-6 pb-28 space-y-5">
      <header className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-text">گزارشات</h1>
          <p className="text-xs text-text-dim mt-0.5">تمامی پیام‌های ارسالی از ابتدا تاکنون</p>
        </div>
        <button onClick={() => fetchReports(page)} className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>
      <div className="card flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-text-dim">مجموع کل گزارشات</p>
            <p className="text-lg font-bold text-text">{toPersianNumber(total)}</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-text-dim">صفحه</p>
          <p className="text-sm font-medium text-text">{toPersianNumber(page)} از {toPersianNumber(totalPages)}</p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin text-2xl">⏳</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-text-dim mx-auto mb-3" />
          <p className="text-sm text-text-dim">گزارشی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report, idx) => (
            <div key={idx} className="card p-3.5">
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="badge badge-success">ارسال شده</span>
                    <p className="text-[11px] text-text-dim mt-1 font-mono" dir="ltr">{report.number}</p>
                  </div>
                </div>
                <span className="text-[11px] text-text-dim">{toPersianDateTime(report.time)}</span>
              </div>
              <p className="text-sm text-text mb-2.5 line-clamp-2">{report.message}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3 text-[11px] text-text-dim">
                  <span>گیرندگان: <span className="text-text-muted">{toPersianNumber(report.rcpts_count)}</span></span>
                  <span>ارسال: <span className="text-text-muted">{toPersianNumber(report.exit_count)}</span></span>
                </div>
                <span className="text-xs font-medium text-emerald-400">{formatCost(report.cost)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => { setPage(page - 1); fetchReports(page - 1); }} disabled={page <= 1} className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-muted px-2">{toPersianNumber(page)} / {toPersianNumber(totalPages)}</span>
          <button onClick={() => { setPage(page + 1); fetchReports(page + 1); }} disabled={page >= totalPages} className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
