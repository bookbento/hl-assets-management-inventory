// frontend/src/app/page.tsx
"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { AssetTable } from "@/components/assets/AssetTable";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getAssetSummary, getAssets } from "@/lib/api";
import { Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["asset-summary"],
    queryFn: getAssetSummary,
  });

  const handleExport = async () => {
    try {
      // ดึงข้อมูลรายการ Assets ทั้งหมด (หรือตามต้องการ)
      // ตรงนี้เราเรียกใช้ getAssets โดยตรงเพื่อให้ได้ข้อมูลล่าสุด
      const response = await getAssets({ limit: 100 }); // กำหนด limit ตามที่ต้องการ export
      const assetsData = response.data; // จาก api.ts ข้อมูลจะอยู่ใน field 'data'

      if (!assetsData || assetsData.length === 0) {
        alert("ไม่พบข้อมูลรายการทรัพย์สินสำหรับส่งออก");
        return;
      }

      const doc = new jsPDF();

      // เพิ่มหัวข้อเอกสาร
      doc.setFontSize(16);
      doc.text("Asset Inventory Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated at: ${new Date().toLocaleString()}`, 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [["ID", "Name", "Category", "Status", "Location"]],
        body: assetsData.map((asset: any) => [
          asset.id,
          asset.name,
          asset.category,
          asset.status,
          asset.location || "-", // ใส่ default ถ้าไม่มีข้อมูล
        ]),
        headStyles: { fillColor: [0, 143, 91] }, // สีเขียวหลักของระบบคุณ
        styles: { fontSize: 9 },
      });

      doc.save("assets_report.pdf");
    } catch (error) {
      console.error("Export error:", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูลเพื่อส่งออก");
    }
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-6 gap-4 sm:gap-6 flex-1">

        <SummaryCards stats={stats} />

        <div className="col-span-1 md:col-span-2 lg:col-span-3 lg:row-span-5 flex flex-col min-h-0 order-2 lg:order-none">
          <AssetTable />
        </div>

        <div className="col-span-1 lg:col-span-1 lg:row-span-3 apple-card p-5 sm:p-6 flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-apple)] shadow-sm order-1 lg:order-none">
          <h4 className="font-bold mb-4 text-[var(--foreground)] text-sm sm:text-base text-left">
            Category Distribution
          </h4>
          <div className="flex-1 flex flex-col justify-center gap-5 sm:gap-6">
            {stats?.categoryDistribution?.map((item: any) => {
              const percentage = Math.round((item._count.id / stats.total) * 100);
              return (
                <div key={item.category} className="space-y-2 text-left">
                  <div className="flex justify-between text-[11px] sm:text-xs font-bold text-[var(--foreground)]">
                    <span>{item.category}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-[var(--surface-muted)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-primary to-[#008F5B] p-5 sm:p-6 rounded-[var(--radius-apple)] text-white shadow-xl shadow-primary/10 flex flex-col justify-between text-left order-3 lg:order-none">
          <div>
            <h4 className="font-bold text-base sm:text-lg leading-tight mb-2">
              Export Ready Analytics
            </h4>
            <p className="text-[10px] sm:text-[11px] opacity-90 leading-relaxed">
              Download your comprehensive asset audit report for Q3 2023.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full mt-4 py-2 sm:py-2.5 bg-white/20 backdrop-blur-md text-xs sm:text-sm font-bold rounded-xl hover:bg-white/30 active:scale-95 transition-all border border-white/20">
            Download PDF
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
