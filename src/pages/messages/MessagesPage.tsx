import { useEffect, useRef, useState } from 'react'
import { Bot, Clock3, Headset, SendHorizonal, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

type ChatRole = 'assistant' | 'user'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  time: string
}

const QUICK_PROMPTS = [
  'Tôi muốn mua xe phù hợp để đi làm hằng ngày',
  'Quy trình kiểm định xe trên sàn diễn ra như thế nào?',
  'Tôi cần hỗ trợ đăng bán xe nhanh',
  'Thanh toán và hoàn tiền được xử lý ra sao?',
]

const SUPPORT_TOPICS = [
  'Tư vấn chọn xe theo nhu cầu và ngân sách',
  'Giải thích quy trình kiểm định trước giao dịch',
  'Hướng dẫn thanh toán, hoàn tiền và giao nhận',
  'Hỗ trợ người bán tối ưu bài đăng và chốt đơn',
]

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

function buildAssistantReply(question: string) {
  const normalizedQuestion = question.trim().toLowerCase()

  if (
    normalizedQuestion.includes('đi làm') ||
    normalizedQuestion.includes('đi học') ||
    normalizedQuestion.includes('hằng ngày')
  ) {
    return 'Nếu bạn cần xe đi làm hoặc đi học hằng ngày, mình khuyên ưu tiên dòng city bike hoặc hybrid với tư thế ngồi thoải mái, khung nhẹ và bộ truyền động dễ bảo dưỡng. Nếu bạn nói thêm ngân sách, chiều cao và quãng đường di chuyển, mình sẽ gợi ý nhóm xe phù hợp hơn.'
  }

  if (
    normalizedQuestion.includes('kiểm định') ||
    normalizedQuestion.includes('kiểm tra') ||
    normalizedQuestion.includes('đánh giá xe')
  ) {
    return 'Quy trình kiểm định thường gồm 3 bước: tiếp nhận xe và thông tin người bán, kiểm tra ngoại hình và linh kiện chính, sau đó cập nhật biên bản tình trạng lên tin đăng. Người mua sẽ nhìn thấy trạng thái kiểm định để yên tâm hơn trước khi cọc hoặc thanh toán.'
  }

  if (
    normalizedQuestion.includes('đăng bán') ||
    normalizedQuestion.includes('bán xe') ||
    normalizedQuestion.includes('tin đăng')
  ) {
    return 'Để đăng bán hiệu quả, bạn nên chuẩn bị ảnh rõ ở nhiều góc, mô tả trung thực tình trạng khung, bánh, groupset và ghi rõ lịch sử sử dụng. Nếu muốn, mình có thể đưa cho bạn một checklist ngắn để bài đăng dễ được duyệt và dễ chốt hơn.'
  }

  if (
    normalizedQuestion.includes('thanh toán') ||
    normalizedQuestion.includes('hoàn tiền') ||
    normalizedQuestion.includes('đặt cọc') ||
    normalizedQuestion.includes('giao dịch')
  ) {
    return 'Với giao dịch trên sàn, bạn nên ưu tiên luồng đặt cọc hoặc thanh toán có xác nhận để hệ thống giữ trạng thái đơn và hỗ trợ đối soát. Khi phát sinh vấn đề, bộ phận hỗ trợ sẽ dựa vào trạng thái đơn, bằng chứng trao đổi và kết quả kiểm định để xử lý hoàn tiền hoặc khiếu nại.'
  }

  if (
    normalizedQuestion.includes('tài khoản') ||
    normalizedQuestion.includes('đăng nhập') ||
    normalizedQuestion.includes('mật khẩu')
  ) {
    return 'Nếu bạn gặp vấn đề tài khoản, hãy kiểm tra email xác thực, trạng thái đăng nhập và thử đặt lại mật khẩu nếu cần. Trường hợp vẫn lỗi, bạn có thể mô tả kỹ hơn màn hình đang gặp để mình hướng dẫn đúng bước.'
  }

  if (
    normalizedQuestion.includes('xin chào') ||
    normalizedQuestion.includes('hello') ||
    normalizedQuestion.includes('chào')
  ) {
    return 'Chào bạn, mình là trợ lý AI tư vấn khách hàng của Market Bike. Mình có thể hỗ trợ chọn xe, giải thích kiểm định, hướng dẫn đăng bán và xử lý các câu hỏi về thanh toán hoặc giao dịch.'
  }

  return 'Mình đã nhận câu hỏi của bạn. Hiện tại chat box này đang dùng AI tư vấn mẫu ở frontend, nên mình có thể hỗ trợ tốt các chủ đề như chọn xe, kiểm định, đăng bán, thanh toán và khiếu nại. Bạn mô tả cụ thể hơn một chút để mình trả lời sát nhu cầu hơn.'
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    content:
      'Xin chào, mình là AI tư vấn khách hàng của Market Bike. Bạn có thể hỏi mình về cách chọn xe, quy trình kiểm định, đăng bán, thanh toán hoặc các vấn đề sau giao dịch.',
    time: getCurrentTimeLabel(),
  },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!viewportRef.current) {
      return
    }

    viewportRef.current.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isTyping])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        globalThis.clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const sendMessage = (rawValue: string) => {
    const value = rawValue.trim()

    if (!value || isTyping) {
      return
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: value,
      time: getCurrentTimeLabel(),
    }

    setMessages((currentMessages) => [...currentMessages, userMessage])
    setInputValue('')
    setIsTyping(true)

    typingTimeoutRef.current = globalThis.setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: buildAssistantReply(value),
        time: getCurrentTimeLabel(),
      }

      setMessages((currentMessages) => [...currentMessages, assistantMessage])
      setIsTyping(false)
    }, 850)
  }

  const handleSubmit: React.ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault()
    sendMessage(inputValue)
  }

  return (
    <main className="h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid h-full max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-3xl border-2 border-slate-400/80 bg-white shadow-sm shadow-slate-200/60">
          <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 p-6 text-white">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Bot className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold leading-tight">AI tư vấn khách hàng</h1>
            <p className="mt-3 text-sm text-sky-50/90">
              Hỏi nhanh mọi vấn đề trước, trong và sau giao dịch để khách hàng được hướng dẫn ngay.
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 text-sky-600" />
              <div>
                <p className="font-semibold text-slate-900">Phản hồi theo ngữ cảnh</p>
                <p className="mt-1 text-sm text-slate-600">Tư vấn mua xe, kiểm định, thanh toán và đăng bán.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-4">
              <Clock3 className="mt-0.5 h-5 w-5 text-sky-600" />
              <div>
                <p className="font-semibold text-slate-900">Hỗ trợ tức thì</p>
                <p className="mt-1 text-sm text-slate-600">Người dùng không cần chờ nhân viên mới biết bước tiếp theo.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-sky-600" />
              <div>
                <p className="font-semibold text-slate-900">Tập trung đúng nghiệp vụ</p>
                <p className="mt-1 text-sm text-slate-600">Điều hướng khách theo quy trình an toàn của sàn.</p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Headset className="h-4 w-4 text-sky-600" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">AI có thể hỗ trợ</h2>
              </div>
              <div className="space-y-2">
                {SUPPORT_TOPICS.map((topic) => (
                  <div key={topic} className="rounded-2xl border border-slate-400/80 bg-slate-50/70 px-4 py-3 text-sm text-slate-700">
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border-2 border-slate-400/80 bg-white shadow-sm shadow-slate-200/60">
          <header className="border-b border-slate-400/80 bg-white px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-950">Chat box AI tư vấn</h2>
                  <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Trực tuyến</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Gửi câu hỏi tự nhiên như đang chat với nhân viên chăm sóc khách hàng.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-slate-400/80 bg-slate-50 px-3 py-2 text-xs font-medium text-sky-700 transition hover:border-sky-400 hover:bg-sky-100"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <ScrollArea
            className="min-h-0 flex-1 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_35%),linear-gradient(to_bottom,_#f8fbff,_#ffffff_28%)] px-4 py-5 sm:px-6"
            viewportRef={viewportRef}
          >
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[88%] sm:max-w-[75%] ${message.role === 'assistant' ? '' : 'items-end'}`}>
                    {message.role === 'assistant' && (
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                        <Bot className="h-3.5 w-3.5" />
                        Market Bike AI
                      </div>
                    )}

                    <div
                      className={`rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.role === 'assistant'
                          ? 'rounded-bl-md border border-slate-300 bg-white text-slate-800'
                          : 'rounded-br-md bg-sky-600 text-white'
                      }`}
                    >
                      {message.content}
                    </div>

                    <div
                      className={`mt-2 text-xs text-slate-400 ${
                        message.role === 'assistant' ? 'text-left' : 'text-right'
                      }`}
                    >
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[88%] sm:max-w-[75%]">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                      <Bot className="h-3.5 w-3.5" />
                      Market Bike AI
                    </div>
                    <div className="flex items-center gap-2 rounded-3xl rounded-bl-md border border-slate-300 bg-white px-4 py-3 shadow-sm">
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-sky-400 [animation-delay:-0.3s]" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.15s]" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-sky-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-slate-400/80 bg-white px-4 py-4 sm:px-6">
            <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-4xl flex-col gap-3">
              <Textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Ví dụ: Tôi nên chọn xe nào cho người cao 1m70, đi làm 8km mỗi ngày và ngân sách dưới 7 triệu?"
                className="min-h-28 resize-none rounded-3xl border-slate-400/80 bg-slate-50/50 px-4 py-3 text-sm shadow-none focus-visible:border-sky-500 focus-visible:ring-sky-500"
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  AI hiện đang chạy ở chế độ mô phỏng trên frontend để tư vấn nhanh theo ngữ cảnh nghiệp vụ.
                </p>
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="rounded-full bg-sky-600 px-5 text-white hover:bg-sky-500"
                >
                  <SendHorizonal className="mr-2 h-4 w-4" />
                  Gửi cho AI
                </Button>
              </div>
            </form>
          </div>
        </section>
      </section>
    </main>
  )
}
