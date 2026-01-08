// app/cia/categories.ts
import type { CategoryChild, CategoryParent } from "./model";

export const PARENTS: readonly CategoryParent[] = [
  { id: "food", label: "食費", required: true },
  { id: "daily", label: "日用品", required: true },
  { id: "housing", label: "住居", required: true },
  { id: "utilities", label: "光熱費", required: true },
  { id: "comm", label: "通信", required: true },
  { id: "transport", label: "交通", required: true },
  { id: "subs", label: "サブスク", required: true },
  { id: "insurance", label: "保険", required: true },
  { id: "medical", label: "医療", required: true },
  { id: "education", label: "教育", required: true },
  { id: "ent", label: "娯楽", required: true },
  { id: "dining", label: "外食", required: true },
  { id: "tax", label: "税・公金", required: true },
  { id: "other", label: "その他", required: true },
] as const;

// 最初は薄くてOK（ユーザーが子カテゴリを増やしていく前提）
export const DEFAULT_CHILDREN: CategoryChild[] = [
  { id: "c_food_gro", parentId: "food", label: "スーパー" },
  { id: "c_food_con", parentId: "food", label: "コンビニ" },

  { id: "c_daily", parentId: "daily", label: "消耗品" },

  { id: "c_house_rent", parentId: "housing", label: "家賃" },

  { id: "c_util_e", parentId: "utilities", label: "電気" },
  { id: "c_util_g", parentId: "utilities", label: "ガス" },
  { id: "c_util_w", parentId: "utilities", label: "水道" },

  { id: "c_comm_cell", parentId: "comm", label: "携帯" },
  { id: "c_comm_net", parentId: "comm", label: "ネット" },

  { id: "c_trans_train", parentId: "transport", label: "電車" },
  { id: "c_trans_taxi", parentId: "transport", label: "タクシー" },

  { id: "c_subs", parentId: "subs", label: "定額" },

  { id: "c_ins", parentId: "insurance", label: "保険料" },

  { id: "c_med", parentId: "medical", label: "病院/薬" },

  { id: "c_edu", parentId: "education", label: "学習" },

  { id: "c_ent", parentId: "ent", label: "趣味" },

  { id: "c_dining", parentId: "dining", label: "外食" },

  { id: "c_tax", parentId: "tax", label: "税" },

  { id: "c_other", parentId: "other", label: "雑費" },
];

export function parentLabel(id?: string) {
  const p = PARENTS.find((x) => x.id === id);
  return p?.label ?? "";
}

export function childrenOf(children: CategoryChild[], parentId?: string) {
  if (!parentId) return [];
  return children.filter((c) => c.parentId === parentId);
}
