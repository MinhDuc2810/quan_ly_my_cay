"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Order } from '@/services/order.service';

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Sử dụng font mặc định Helvetica để tránh lỗi loading font từ server
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#333',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopInfo: {
    width: '60%',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E41E31', // Màu đỏ SASIN
    textAlign: 'right',
  },
  shopName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  shopText: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  customerSection: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    borderBottom: 0.5,
    marginBottom: 5,
    paddingBottom: 2,
    textTransform: 'uppercase',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f6f6f6',
    borderBottom: 1,
    padding: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 0.5,
    borderBottomColor: '#eee',
    padding: 5,
    alignItems: 'center',
  },
  col1: { width: '40%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '25%', textAlign: 'right' },
  summary: {
    marginTop: 20,
    borderTop: 1,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryLabel: {
    width: 100,
    textAlign: 'right',
    paddingRight: 10,
  },
  summaryValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  total: {
    fontSize: 12,
    color: '#E41E31',
    marginTop: 5,
    paddingTop: 5,
    borderTop: 0.5,
  },
  footer: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
  },
});

interface Props {
  order: Order;
}

const InvoicePDF = ({ order }: Props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>MỲ CAY SASIN - QUẬN 7</Text>
            <Text style={styles.shopText}>Địa chỉ: 157 Nguyễn Hữu Thọ, P. Tân Phong, Q7</Text>
            <Text style={styles.shopText}>Hotline: 1900 0123 - www.mysasin.vn</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>HÓA ĐƠN</Text>
            <Text style={{ textAlign: 'right', fontSize: 9 }}>Mã ĐH: #{order.id}</Text>
            <Text style={{ textAlign: 'right', fontSize: 9 }}>Ngày: {new Date(order.created_at).toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.customerSection}>
          <View style={{ width: '50%' }}>
            <Text style={styles.sectionTitle}>Khách hàng</Text>
            <Text>{order.customer?.name || 'Khách vãng lai'}</Text>
            <Text>{order.customer?.phone_number || ''}</Text>
          </View>
          <View style={{ width: '40%', textAlign: 'right' }}>
            <Text style={styles.sectionTitle}>Vị trí</Text>
            <Text>Bàn: {order.table?.table_number || 'Mang về'}</Text>
            <Text>Hình thức: {order.payment_method === 'CASH' ? 'Tiền mặt' : order.payment_method === 'TRANSFER' ? 'Chuyển khoản' : 'Thẻ'}</Text>
          </View>
        </View>

        {/* Table Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Tên món</Text>
            <Text style={styles.col2}>SL</Text>
            <Text style={styles.col3}>Đơn giá</Text>
            <Text style={styles.col4}>Thành tiền</Text>
          </View>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>
                {item.product?.name || 'Sản phẩm không tên'}
              </Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{(item.price || 0).toLocaleString()} đ</Text>
              <Text style={styles.col4}>{((item.price || 0) * (item.quantity || 0)).toLocaleString()} đ</Text>
            </View>
          ))}
          {(!order.items || order.items.length === 0) && (
            <View style={styles.tableRow}>
              <Text style={{ textAlign: 'center', width: '100%', padding: 10 }}>Không có dữ liệu chi tiết món ăn</Text>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính:</Text>
            <Text style={styles.summaryValue}>{order.total_amount.toLocaleString()} đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá:</Text>
            <Text style={styles.summaryValue}>- {order.discount_amount.toLocaleString()} đ</Text>
          </View>
          <View style={[styles.summaryRow, styles.total]}>
            <Text style={styles.summaryLabel}>TỔNG CỘNG:</Text>
            <Text style={styles.summaryValue}>{order.final_amount.toLocaleString()} đ</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Cảm ơn Quý khách - Hẹn gặp lại!</Text>
          <Text>Vui lòng giữ hóa đơn để đối chiếu khi cần thiết</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
