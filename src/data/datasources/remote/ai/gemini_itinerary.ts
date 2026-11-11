import { Activity } from '@/domain/entities/activity';

export async function generateGeminiItinerary(
  destination: string,
  days: number,
  budget: number,
  preferences: string,
): Promise<Activity[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Chưa cấu hình EXPO_PUBLIC_GEMINI_API_KEY.');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Tạo lịch trình du lịch ${days} ngày ở ${destination}, tổng ngân sách ${budget} VND. Sở thích: ${preferences || 'khám phá địa phương'}. Trả về JSON array, mỗi phần tử gồm dayIndex (number), time (HH:MM), title, locationName, estimatedCost (number). Chỉ trả JSON, 3 hoạt động mỗi ngày.` }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (!response.ok) throw new Error('Không thể tạo lịch trình lúc này. Vui lòng thử lại.');

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some((item) => !item.title || !Number.isInteger(item.dayIndex) || item.dayIndex < 1 || item.dayIndex > days)) {
    throw new Error('AI trả về lịch trình không hợp lệ. Vui lòng thử lại.');
  }
  return parsed.map((item, index) => ({
    id: `ai_${Date.now()}_${index}`,
    tripId: '',
    dayIndex: item.dayIndex,
    time: item.time ?? '09:00',
    title: item.title,
    locationName: item.locationName ?? destination,
    estimatedCost: Number(item.estimatedCost) || 0,
  }));
}
