"use client";

import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Search, 
  Filter,
  Eye, 
  Printer,
  ChevronLeft, 
  ChevronRight, 
  Banknote,
  CreditCard,
  QrCode,
  FileText,
  Download
} from "lucide-react";
import { PDFViewer, BlobProvider } from "@react-pdf/renderer";
import InvoicePDF from "@/components/admin/InvoicePDF";
import orderService, { Order } from "@/services/order.service";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
  const [pagination, setPagination] = useState({
    total_pages: 1,
    current_page: 1,
  });

  // PDF Preview State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchInvoices = async (page = 1) => {
    console.log(`🔍 [AdminInvoicesPage] Đang tải danh sách hóa đơn - Trang: ${page}, Tìm kiếm: "${searchQuery}", Lọc: ${paymentMethodFilter}`);
    setLoading(true);
    try {
      const res = await orderService.getOrders({ 
        page, 
        order_code: searchQuery,
      });
      console.log(`✅ [AdminInvoicesPage] Danh sách hóa đơn đã tải thành công:`, res.data);
      if (res.success) {
        let finalData = res.data; 
        if (paymentMethodFilter !== 'ALL') {
             finalData = finalData.filter(inv => inv.payment_method === paymentMethodFilter);
        }
        
        setInvoices(finalData);
        setPagination({
          total_pages: res.pagination.total_pages,
          current_page: res.pagination.current_page,
        });
      }
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewInvoice = async (id: number) => {
    setIsFetchingDetail(true);
    try {
      const res = await orderService.getOrderById(id);
      if (res.success) {
        console.log("Dữ liệu hóa đơn chi tiết tải về:", res.data);
        setSelectedOrder(res.data);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch order detail for PDF", error);
      alert("Không thể tải thông tin hóa đơn chi tiết!");
    } finally {
      setIsFetchingDetail(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [searchQuery, paymentMethodFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchInvoices(newPage);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch(method) {
      case 'CASH': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-green-100/50"><Banknote size={12}/> Tiền mặt</span>;
      case 'TRANSFER': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100/50"><QrCode size={12}/> CK</span>;
      case 'CARD': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-purple-100/50"><CreditCard size={12}/> Thẻ</span>;
      default: return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray-100">Khác</span>;
    }
  };

  const getPaymentStatus = (status: string) => {
    if (status === 'PAID') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-sm">
          Đã thanh toán
        </span>
      );
    } else if (status === 'REFUNDED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-rose-500 text-white shadow-sm">
          Đã hoàn tiền
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-400">
        Chưa trả tiền
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100/50">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic flex items-center gap-3">
             <Receipt className="text-primary" size={32} />
             Quản lý Hóa Đơn
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-[3px] text-[11px] mt-2 ml-1">Doanh thu & Lưu trữ: {invoices.length} hóa đơn</p>
        </div>
        <div className="flex gap-4">
           {/* Export button */}
           <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all">
             <Download size={16} />
             Xuất Excel
           </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/50 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm mã hóa đơn/đơn hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-100 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all uppercase tracking-widest font-mono"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto pb-2 lg:pb-0">
          <Filter size={16} className="text-gray-400 mr-2 shrink-0" />
          {['ALL', 'CASH', 'TRANSFER', 'CARD'].map((method) => {
             const labels: any = { ALL: 'Tất cả', CASH: 'Tiền mặt', TRANSFER: 'Chuyển khoản', CARD: 'Thẻ' };
             return (
               <button
                  key={method}
                  onClick={() => setPaymentMethodFilter(method)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 whitespace-nowrap ${
                    paymentMethodFilter === method ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-gray-100 text-gray-400 hover:border-primary/30 hover:text-primary/60'
                  }`}
               >
                  {labels[method]}
               </button>
             );
          })}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Mã HĐ</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Khách hàng</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Hình thức</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Tổng cộng</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Ngày lập</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px] text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-8 py-6 h-16 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : invoices.length > 0 ? invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FileText size={16} />
                      </div>
                      <span className="font-mono font-black text-xs text-gray-800">
                         {invoice.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-gray-800">{invoice.customer?.name || 'Khách vãng lai'}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Bàn {invoice.table?.table_number || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {getPaymentMethodIcon(invoice.payment_method)}
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-primary italic">{invoice.final_amount.toLocaleString()} đ</p>
                      {invoice.discount_amount > 0 && (
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">- {invoice.discount_amount.toLocaleString()} đ ưu đãi</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-bold text-gray-800">
                      <p>{new Date(invoice.created_at).toLocaleDateString('vi-VN')}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(invoice.created_at).toLocaleTimeString()}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handlePreviewInvoice(invoice.id)}
                         disabled={isFetchingDetail}
                         className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-all shadow-sm border border-transparent hover:border-red-100 disabled:opacity-30" title="Xem chi tiết"
                        >
                         {isFetchingDetail && selectedOrder?.id === invoice.id ? (
                           <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                         ) : (
                           <Eye size={18} />
                         )}
                       </button>
                       <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all shadow-sm border border-transparent hover:border-blue-100" title="In Hóa Đơn">
                         <Printer size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <Receipt size={56} className="mb-4 text-gray-300" />
                       <p className="font-extrabold uppercase tracking-[3px] text-xs">Chưa có hóa đơn nào...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
           <p className="text-xs font-bold text-gray-400">Trang {pagination.current_page} - Tất cả {invoices.length} hóa đơn</p>
           <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-all disabled:opacity-20 shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center px-6 font-black text-xs text-gray-800 uppercase tracking-[2px]">
                {pagination.current_page} <span className="mx-2 text-gray-300">/</span> {pagination.total_pages}
              </div>
              <button 
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-all disabled:opacity-20 shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
           </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {isPreviewOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
          <div className="relative bg-white w-full h-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                  <FileText className="text-primary" />
                  Xem trước Hóa đơn #{selectedOrder.id}
                </h3>
              </div>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="flex-1 bg-gray-100 p-4 min-h-[500px]">
              {isMounted && selectedOrder && (
                <PDFViewer 
                  key={selectedOrder.id}
                  width="100%" 
                  height="100%" 
                  className="rounded-2xl border-none shadow-inner min-h-[500px]"
                >
                  <InvoicePDF order={selectedOrder} />
                </PDFViewer>
              )}
            </div>
            <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-4">
               <button 
                onClick={() => setIsPreviewOpen(false)}
                className="px-8 py-3 bg-gray-100 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
               >
                 Đóng
               </button>
               <BlobProvider document={<InvoicePDF order={selectedOrder} />}>
                 {({ blob, url, loading }) => (
                   <a 
                     href={url || '#'} 
                     download={`hoadon-${selectedOrder.id}.pdf`}
                     className={`flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                   >
                     <Download size={16} />
                     Tải xuống PDF
                   </a>
                 )}
               </BlobProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}