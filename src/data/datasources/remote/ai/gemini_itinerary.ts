import { Activity } from '@/domain/entities/activity';

export async function generateGeminiItinerary(
  destination: string,
  days: number,
  budget: number,
  preferences: string,
): Promise<Activity[]> {
  if (!destination.trim() || !Number.isInteger(days) || days < 1 || !Number.isFinite(budget) || budget <= 0) {
    throw new Error('Vui lòng nhập điểm đến, số ngày và ngân sách hợp lệ.');
  }
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Chưa cấu hình EXPO_PUBLIC_GEMINI_API_KEY.');

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Tạo lịch trình thực tế cho chuyến đi ${days} ngày tại ${destination}, tổng ngân sách không vượt quá ${budget} VND. Ưu tiên: ${preferences.trim() || 'khám phá địa phương'}. Tạo 3 hoạt động mỗi ngày, sắp xếp theo giờ. Chỉ trả JSON array; mỗi hoạt động có dayIndex (integer từ 1 đến ${days}), time (HH:MM), title (string), locationName (string), estimatedCost (number VND).` }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error('Gemini đang quá tải. Vui lòng thử lại sau ít phút.');
    throw new Error('Gemini không tạo được lịch trình. Kiểm tra API key hoặc thử lại sau.');
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string') throw new Error('Gemini không trả về nội dung lịch trình. Vui lòng thử lại.');

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Gemini trả về dữ liệu không đọc được. Vui lòng thử lại.');
  }
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Gemini trả về lịch trình trống hoặc sai định dạng.');

  return parsed.map((raw: unknown, index: number) => {
    if (!raw || typeof raw !== 'object') throw new Error('Gemini trả về hoạt động sai định dạng.');
    const item = raw as Record<string, unknown>;
    const dayIndex = Number(item.dayIndex);
    const estimatedCost = Number(item.estimatedCost);
    if (!Number.isInteger(dayIndex) || dayIndex < 1 || dayIndex > days || typeof item.title !== 'string' || !item.title.trim()) {
      throw new Error('Gemini trả về hoạt động thiếu ngày hoặc tiêu đề hợp lệ.');
    }
    return {
      id: `ai_${Date.now()}_${index}`,
      tripId: '',
      dayIndex,
      time: typeof item.time === 'string' ? item.time : '09:00',
      title: item.title.trim(),
      locationName: typeof item.locationName === 'string' ? item.locationName : destination,
      estimatedCost: Number.isFinite(estimatedCost) && estimatedCost > 0 ? estimatedCost : 0,
    };
  });
}
