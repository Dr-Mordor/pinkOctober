export const PATHS = [
	{
		key: "reassurance",
		title: "أريد أن أطمئن",
		desc: "خدمات الفحص والكشف المبكر.",
	},
	{
		key: "evaluation",
		title: "لاحظتُ تغييراً في الثدي",
		desc: "أين أذهب للتقييم؟",
	},
	{
		key: "imaging",
		title: "أحتاج إلى فحص أو تصوير",
		desc: "ما الخدمات المتاحة وأين؟",
	},
	{
		key: "diagnosis",
		title: "أحتاج إلى تشخيص",
		desc: "أين تتوفر الخزعة والفحص النسيجي؟",
	},
	{
		key: "treatment",
		title: "تم تشخيصي وأحتاج إلى علاج",
		desc: "أين تتوفر خدمات علاج الأورام؟",
	},
	{
		key: "psychosocial",
		title: "أحتاج إلى دعم نفسي واجتماعي",
		desc: "أين أجد المساندة؟",
	},
	{
		key: "navigation",
		title: "أحتاج إلى إرشاد ومرافقة",
		desc: "خدمات التوجيه ومرافقة رحلة العلاج.",
	},
	{
		key: "palliative",
		title: "أحتاج إلى رعاية تلطيفية أو منزلية",
		desc: "أين أجد الخدمة المناسبة؟",
	},
];

// Both the results header and the path tag under each institution card need
// to turn a key back into its Arabic title — one lookup here instead of a
// `PATHS.find(...)` copied at every call site.
export function findPath(key) {
	return PATHS.find((path) => path.key === key);
}
