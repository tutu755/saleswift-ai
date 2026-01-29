/**
 * 本地日程解析器（无需 API Key）
 * 从语音识别的文字中提取日程信息
 */

export interface ParsedSchedule {
  title: string;
  date: string;
  time?: string;
  customerName?: string;
  description?: string;
}

export function parseScheduleLocally(text: string): ParsedSchedule | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  const result: ParsedSchedule = {
    title: text,
    date: new Date().toISOString().split('T')[0], // 默认今天
  };

  // 提取时间相关的词
  const timePatterns = {
    今天: 0,
    明天: 1,
    后天: 2,
    大后天: 3,
  };

  const today = new Date();
  
  // 检查相对日期
  for (const [keyword, daysOffset] of Object.entries(timePatterns)) {
    if (text.includes(keyword)) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysOffset);
      result.date = targetDate.toISOString().split('T')[0];
      break;
    }
  }

  // 提取具体日期 (如 "1月15日"、"12月25日")
  const dateMatch = text.match(/(\d{1,2})月(\d{1,2})[日号]/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]);
    const day = parseInt(dateMatch[2]);
    const year = today.getFullYear();
    result.date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  // 提取时间 (如 "下午两点"、"上午10点"、"14:30")
  const timeMatch = text.match(/([上下])午\s*(\d{1,2})\s*[点时]/);
  if (timeMatch) {
    const period = timeMatch[1];
    let hour = parseInt(timeMatch[2]);
    
    // 转换为24小时制
    if (period === '下' && hour < 12) {
      hour += 12;
    } else if (period === '上' && hour === 12) {
      hour = 0;
    }
    
    result.time = `${hour.toString().padStart(2, '0')}:00`;
  }

  // 提取数字时间 (如 "14点"、"15:30")
  const numTimeMatch = text.match(/(\d{1,2})[点时:](\d{2})?/);
  if (numTimeMatch && !timeMatch) {
    const hour = parseInt(numTimeMatch[1]);
    const minute = numTimeMatch[2] || '00';
    result.time = `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  // 提取客户姓名（简单匹配常见模式）
  const namePatterns = [
    /和(.{2,4})[开会见面谈]/,
    /拜访(.{2,4})/,
    /联系(.{2,4})/,
    /见(.{2,4})/,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.customerName = match[1];
      break;
    }
  }

  // 提取关键动作作为标题
  const actionPatterns = [
    { pattern: /开会|会议/, title: '会议' },
    { pattern: /拜访|见面/, title: '拜访' },
    { pattern: /电话|联系|沟通/, title: '电话沟通' },
    { pattern: /演示|demo/, title: '产品演示' },
    { pattern: /培训/, title: '培训' },
  ];

  for (const { pattern, title } of actionPatterns) {
    if (pattern.test(text)) {
      result.title = result.customerName 
        ? `${title} - ${result.customerName}`
        : title;
      break;
    }
  }

  // 如果没有匹配到动作，使用原文作为标题（限制长度）
  if (result.title === text && text.length > 20) {
    result.title = text.substring(0, 20) + '...';
  }

  result.description = text;

  return result;
}
