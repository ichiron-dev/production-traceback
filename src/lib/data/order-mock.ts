import type { OrderDetail } from '$lib/types/order-detail';

const STEP_ICONS = {
  'case-setting':  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  'damper-less':   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`,
  'laser-marking': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  'ec-sorting':    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
};

export const mockOrders: Record<string, OrderDetail> = {
  '#00812': {
    id: '#00812', twoCode: '2D-A001', customer: 'สมชาย มีสุข',
    product: 'HDD-3.5" SATA 1TB', amount: 2450, createdAt: '2026-03-15T10:32:00',
    steps: [
      {
        key: 'case-setting', label: 'Case Setting', icon: STEP_ICONS['case-setting'],
        status: 'done', completedAt: '2026-03-15T08:10:00',
        events: [
          { id: 'cs-1', timestamp: '2026-03-15T07:45:00', operator: 'OP-001 สมหมาย', machine: 'CS-LINE-01', result: 'PASS', note: 'Case ติดตั้งเรียบร้อย', extra: { 'Torque': '0.45 N·m', 'Batch': 'B2603-01' } },
          { id: 'cs-2', timestamp: '2026-03-15T07:52:00', operator: 'QC-001 วิภา', machine: 'CS-CHECK-01', result: 'OK', note: 'ตรวจสอบผ่าน', extra: { 'Check Point': '5/5', 'Visual': 'OK' } },
          { id: 'cs-3', timestamp: '2026-03-15T08:10:00', operator: 'OP-001 สมหมาย', machine: 'CS-LINE-01', result: 'PASS', note: 'ส่งไป Damper-less', extra: { 'WO': 'WO-260315-001' } },
        ],
      },
      {
        key: 'damper-less', label: 'Damper-less', icon: STEP_ICONS['damper-less'],
        status: 'done', completedAt: '2026-03-15T09:05:00',
        events: [
          { id: 'dl-1', timestamp: '2026-03-15T08:15:00', operator: 'OP-002 สุชาติ', machine: 'DL-PRESS-01', result: 'PASS', note: 'กด Damper เรียบร้อย', extra: { 'Force': '150 N', 'Stroke': '12 mm' } },
          { id: 'dl-2', timestamp: '2026-03-15T08:30:00', operator: 'OP-002 สุชาติ', machine: 'DL-PRESS-01', result: 'PASS', note: 'ทดสอบ Vibration', extra: { 'Freq': '80 Hz', 'Amplitude': '0.3 mm', 'Duration': '30 s' } },
          { id: 'dl-3', timestamp: '2026-03-15T09:05:00', operator: 'QC-002 มาลา', machine: 'DL-CHECK-01', result: 'OK', extra: { 'Leak Test': 'PASS', 'Pressure': '1.2 bar' } },
        ],
      },
      {
        key: 'laser-marking', label: 'Laser Marking', icon: STEP_ICONS['laser-marking'],
        status: 'done', completedAt: '2026-03-15T09:45:00',
        events: [
          { id: 'lm-1', timestamp: '2026-03-15T09:10:00', operator: 'OP-003 ปรีชา', machine: 'LASER-01', result: 'PASS', note: 'Marking S/N เรียบร้อย', extra: { 'S/N': 'SN26031500001', 'Power': '15 W', 'Speed': '500 mm/s' } },
          { id: 'lm-2', timestamp: '2026-03-15T09:20:00', operator: 'OP-003 ปรีชา', machine: 'LASER-01', result: 'PASS', note: 'Marking 2D Barcode', extra: { 'Code': '2D-A001', 'Grade': 'A', 'Contrast': '98%' } },
          { id: 'lm-3', timestamp: '2026-03-15T09:45:00', operator: 'QC-003 นงนุช', machine: 'SCAN-01', result: 'OK', note: 'Scan ยืนยัน', extra: { 'Read Rate': '100%' } },
        ],
      },
      {
        key: 'ec-sorting', label: 'EC Sorting', icon: STEP_ICONS['ec-sorting'],
        status: 'done', completedAt: '2026-03-15T10:32:00',
        events: [
          { id: 'ec-1', timestamp: '2026-03-15T09:50:00', operator: 'OP-004 วิชัย', machine: 'EC-SORT-01', result: 'PASS', note: 'Sort Grade A', extra: { 'Grade': 'A', 'EC Value': '2.45 mΩ', 'Threshold': '<3 mΩ' } },
          { id: 'ec-2', timestamp: '2026-03-15T10:10:00', operator: 'OP-004 วิชัย', machine: 'EC-PACK-01', result: 'PASS', note: 'แพ็คสินค้าเรียบร้อย', extra: { 'Box No': 'BX-001', 'Qty/Box': '10' } },
          { id: 'ec-3', timestamp: '2026-03-15T10:32:00', operator: 'QC-004 สาวิตรี', machine: 'EC-FINAL', result: 'OK', note: 'ตรวจสอบขั้นสุดท้ายผ่าน', extra: { 'Final Grade': 'A', 'Ship To': 'WH-A' } },
        ],
      },
    ],
  },
  '#00811': {
    id: '#00811', twoCode: '2D-A002', customer: 'วิไล ใจดี',
    product: 'SSD-2.5" NVMe 512GB', amount: 890, createdAt: '2026-03-15T09:15:00',
    steps: [
      {
        key: 'case-setting', label: 'Case Setting', icon: STEP_ICONS['case-setting'],
        status: 'done', completedAt: '2026-03-15T07:00:00',
        events: [
          { id: 'cs-1', timestamp: '2026-03-14T22:10:00', operator: 'OP-005 ประทีป', machine: 'CS-LINE-02', result: 'PASS', extra: { 'Torque': '0.40 N·m', 'Batch': 'B2603-02' } },
          { id: 'cs-2', timestamp: '2026-03-15T07:00:00', operator: 'QC-001 วิภา', machine: 'CS-CHECK-02', result: 'OK', extra: { 'Check Point': '5/5' } },
        ],
      },
      {
        key: 'damper-less', label: 'Damper-less', icon: STEP_ICONS['damper-less'],
        status: 'done', completedAt: '2026-03-15T08:00:00',
        events: [
          { id: 'dl-1', timestamp: '2026-03-15T07:10:00', operator: 'OP-002 สุชาติ', machine: 'DL-PRESS-02', result: 'FAIL', note: 'Force เกิน threshold — NG', extra: { 'Force': '185 N', 'Limit': '170 N' } },
          { id: 'dl-2', timestamp: '2026-03-15T07:30:00', operator: 'OP-002 สุชาติ', machine: 'DL-PRESS-02', result: 'PASS', note: 'ทำซ้ำ — ผ่าน', extra: { 'Force': '148 N', 'Stroke': '11.8 mm' } },
          { id: 'dl-3', timestamp: '2026-03-15T08:00:00', operator: 'QC-002 มาลา', machine: 'DL-CHECK-01', result: 'OK', extra: { 'Leak Test': 'PASS' } },
        ],
      },
      {
        key: 'laser-marking', label: 'Laser Marking', icon: STEP_ICONS['laser-marking'],
        status: 'in-progress',
        events: [
          { id: 'lm-1', timestamp: '2026-03-15T08:05:00', operator: 'OP-003 ปรีชา', machine: 'LASER-01', result: 'PASS', extra: { 'S/N': 'SN26031500002', 'Power': '15 W' } },
        ],
      },
      {
        key: 'ec-sorting', label: 'EC Sorting', icon: STEP_ICONS['ec-sorting'],
        status: 'pending', events: [],
      },
    ],
  },
  '#00810': {
    id: '#00810', twoCode: '2D-B001', customer: 'ประทีป นามใจ',
    product: 'HDD-2.5" SATA 500GB', amount: 5200, createdAt: '2026-03-14T18:44:00',
    steps: [
      {
        key: 'case-setting', label: 'Case Setting', icon: STEP_ICONS['case-setting'],
        status: 'done', completedAt: '2026-03-14T10:00:00',
        events: [
          { id: 'cs-1', timestamp: '2026-03-14T08:00:00', operator: 'OP-001 สมหมาย', machine: 'CS-LINE-01', result: 'PASS', extra: { 'Batch': 'B2603-03' } },
          { id: 'cs-2', timestamp: '2026-03-14T09:30:00', operator: 'QC-001 วิภา', machine: 'CS-CHECK-01', result: 'OK', extra: { 'Check Point': '5/5' } },
          { id: 'cs-3', timestamp: '2026-03-14T10:00:00', operator: 'OP-001 สมหมาย', machine: 'CS-LINE-01', result: 'PASS', extra: { 'WO': 'WO-260314-002' } },
        ],
      },
      {
        key: 'damper-less', label: 'Damper-less', icon: STEP_ICONS['damper-less'],
        status: 'done', completedAt: '2026-03-14T13:00:00',
        events: [
          { id: 'dl-1', timestamp: '2026-03-14T10:10:00', operator: 'OP-006 สมศักดิ์', machine: 'DL-PRESS-01', result: 'PASS', extra: { 'Force': '155 N' } },
          { id: 'dl-2', timestamp: '2026-03-14T11:00:00', operator: 'OP-006 สมศักดิ์', machine: 'DL-PRESS-01', result: 'PASS', extra: { 'Vibration': 'PASS' } },
          { id: 'dl-3', timestamp: '2026-03-14T13:00:00', operator: 'QC-002 มาลา', machine: 'DL-CHECK-01', result: 'OK', extra: { 'Leak Test': 'PASS' } },
        ],
      },
      {
        key: 'laser-marking', label: 'Laser Marking', icon: STEP_ICONS['laser-marking'],
        status: 'done', completedAt: '2026-03-14T15:30:00',
        events: [
          { id: 'lm-1', timestamp: '2026-03-14T13:10:00', operator: 'OP-003 ปรีชา', machine: 'LASER-02', result: 'PASS', extra: { 'S/N': 'SN26031400001', 'Grade': 'A' } },
          { id: 'lm-2', timestamp: '2026-03-14T15:30:00', operator: 'QC-003 นงนุช', machine: 'SCAN-01', result: 'OK', extra: { 'Read Rate': '100%' } },
        ],
      },
      {
        key: 'ec-sorting', label: 'EC Sorting', icon: STEP_ICONS['ec-sorting'],
        status: 'in-progress',
        events: [
          { id: 'ec-1', timestamp: '2026-03-14T15:35:00', operator: 'OP-004 วิชัย', machine: 'EC-SORT-01', result: 'PASS', extra: { 'Grade': 'A', 'EC Value': '2.30 mΩ' } },
          { id: 'ec-2', timestamp: '2026-03-14T17:00:00', operator: 'OP-004 วิชัย', machine: 'EC-PACK-01', result: 'PASS', note: 'กำลังแพ็ค', extra: { 'Box No': 'BX-002' } },
        ],
      },
    ],
  },
};

export function getOrderDetail(id: string): OrderDetail | undefined {
  return mockOrders[id];
}
