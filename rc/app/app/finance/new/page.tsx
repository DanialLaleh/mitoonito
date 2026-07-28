import { redirect } from "next/navigation";
import { createTransactionAction } from "@/app/actions/finance";

export default function NewTransactionPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-8 text-right" dir="rtl">
      <h1 className="text-2xl font-black text-[#434345] mb-6">ثبت تراکنش جدید</h1>

      <form action={createTransactionAction} className="space-y-4">
        <div className="bg-white border border-[#E6E7E8] rounded-3xl p-6 shadow-sm space-y-4">
          
          {/* مبلغ */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 mr-1">مبلغ (تومان)</label>
            <input
              type="number"
              name="amount"
              placeholder="مثلاً: ۵۰۰۰۰"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-[#E6E7E8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#50B848] font-mono"
            />
          </div>

          {/* نوع تراکنش */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 mr-1">نوع تراکنش</label>
            <select
              name="type"
              className="w-full px-4 py-3 bg-gray-50 border border-[#E6E7E8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#50B848]"
            >
              <option value="EXPENSE">📤 هزینه</option>
              <option value="INCOME">📥 درآمد</option>
            </select>
          </div>

          {/* دسته‌بندی */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 mr-1">دسته‌بندی</label>
            <input
              type="text"
              name="category"
              placeholder="مثلاً: کافه، حقوق، اینترنت..."
              required
              className="w-full px-4 py-3 bg-gray-50 border border-[#E6E7E8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#50B848]"
            />
          </div>

          {/* تاریخ */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 mr-1">تاریخ</label>
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-gray-50 border border-[#E6E7E8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#50B848]"
            />
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 mr-1">توضیحات (اختیاری)</label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-[#E6E7E8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#50B848]"
            ></textarea>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-[#50B848] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#50B848]/20 active:scale-95 transition-all"
          >
            ذخیره تراکنش
          </button>
          <a
            href="/app/finance"
            className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold active:scale-95 transition-all"
          >
            لغو
          </a>
        </div>
      </form>
    </div>
  );
}
